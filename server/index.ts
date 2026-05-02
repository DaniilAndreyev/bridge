import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })
const rooms = new Map()

wss.on('connection', (ws) => {
	ws.on('message', (msg) => {
		const data = JSON.parse(msg)

		ws.roomId = roomId
	})

	ws.on('close', () => {
		const room = rooms.get(ws.roomId)
	})
})