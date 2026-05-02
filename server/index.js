// WebSocket signaling server that manages rooms, pairs two peers, and relays signals.
import { WebSocketServer } from 'ws'

// Simple WebSocket room broker for pairing two peers and relaying WebRTC signals.

const wss = new WebSocketServer({ port: 8080 })
const rooms = new Map()

wss.on('connection', (ws) => {
	ws.on('message', (msg) => {
		const data = JSON.parse(msg)

		if (data.type === 'join') {
			// extract roomId from data
			const { roomId } = data

			if (!rooms.has(roomId)) {
				ws.send(JSON.stringify({
					type: "error",
					message: "Room does not exist"
				}))
				return
			}

			const room = rooms.get(roomId)

			if (room.length >= 2) {
				ws.send(JSON.stringify({
					type: "error",
					message: "Room is full"
				}))
				return
			}

			room.push(ws)
			ws.roomId = roomId

			if (room.length === 2) {
				room[0].send(JSON.stringify({
					type: "ready",
					initiator: true
				}))
				room[1].send(JSON.stringify({
					type: "ready",
					initiator: false
				}))
			}
		}

		if (data.type === 'create') {
			const { roomId } = data

			if (rooms.has(roomId)) {
				ws.send(JSON.stringify({
					type: "error",
					message: "Room already exists"
				}))
				return
			}

			rooms.set(roomId, [])
		}

		if (data.type === 'signal') {
			const room = rooms.get(ws.roomId)
			if (!room) return

			room.forEach(u => {
				if (u !== ws) {
					u.send(JSON.stringify({
						type: 'signal',
						signal: data.signal
					}))
				}
			});
		}
	})

	ws.on('close', () => {
		const room = rooms.get(ws.roomId)
		if (!room) return

		const updated = room.filter(u => u !== ws)

		if (updated.length === 0) {
			rooms.delete(ws.roomId)
		} else {
			rooms.set(ws.roomId, updated)
		}
	})
})