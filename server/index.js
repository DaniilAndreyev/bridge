// WebSocket signaling server that manages rooms, pairs two peers, and relays signals.
import { WebSocketServer } from 'ws'

const port = process.env.PORT || 8080
const wss = new WebSocketServer({ port })
const rooms = new Map() // roomId -> [ws, ws]

wss.on('connection', (ws) => {
	// Receive signaling events from clients.
	ws.on('message', (msg) => {
		const data = JSON.parse(msg)

		if (data.type === 'join') {
			// Validate room membership and notify both peers when ready.
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
			// Create an empty room; the join event will place peers into it.
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
			// Relay SDP/ICE messages to the other peer in the room.
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

	// Cleanup room membership on disconnect.
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