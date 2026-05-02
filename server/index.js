import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })
const rooms = new Map()

wss.on('connection', (ws) => {
	ws.on('message', (msg) => {
		const data = JSON.parse(msg)

		if (data.type === 'join') {
			// extract roomId from data
			const { roomId } = data

			if (!rooms.has(roomId)) {
				rooms.set(roomId, [])
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

		rooms.set(ws.roomId,
			room.filter(u => u !== ws) // u is a socket
		)
	})
})