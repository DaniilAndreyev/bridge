export function createSocket() {
	return new WebSocket(process.env.NEXT_PUBLIC_WS_URL!)
}