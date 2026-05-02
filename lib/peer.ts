import Peer from "simple-peer"

export function createPeer(initiator: boolean) {
	return new Peer({
		initiator,
		trickle: false,
		config: {
			iceServers: [
				{
					urls: "stun:stun.l.google.com:19302"
				}
			]
		}
	})
}