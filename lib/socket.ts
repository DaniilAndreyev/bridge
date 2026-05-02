// Create a WebSocket client connection to the signaling server.
// WebSocket client helper for connecting to the local signaling server.
export function createSocket() {
	return new WebSocket(process.env.NEXT_PUBLIC_WS_URL!)
}