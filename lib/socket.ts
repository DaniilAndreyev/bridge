// Create a WebSocket client connection to the signaling server.
// WebSocket client helper for connecting to the local signaling server.
export function createSocket() {
	return new WebSocket("ws://localhost:8080")
}