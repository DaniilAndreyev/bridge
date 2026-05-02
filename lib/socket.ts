import type { ServerMessage } from "./types/messages"

let socket: WebSocket | null = null

export function createSocket(): WebSocket {
  socket = new WebSocket("ws://localhost:3001")
  return socket
}

export function joinRoom(socket: WebSocket, roomId: number) {
  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "join", roomId }))
  }
}

export function onSocketMessage(
  socket: WebSocket,
  callback: (data: ServerMessage) => void
) {
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as ServerMessage
    callback(data)
  }
}