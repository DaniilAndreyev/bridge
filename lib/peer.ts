// Peer factory for creating WebRTC connections with simple-peer.
import Peer from "simple-peer"

// Create a WebRTC peer instance with the initiator role set by the server.
export function createPeer(initiator: boolean) {
	return new Peer({
		initiator,
		trickle: false,
		config: {
			iceServers: [
				{
					urls: "stun:stun.l.google.com:19302"
				},
				{
					urls: "turn:openrelay.metered.ca:80",
					username: "openrelayproject",
					credential: "openrelayproject"
				}
			]
		}
	})
}