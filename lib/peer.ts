import Peer from "simple-peer"

export function createPeer(initiator: boolean) {
	return new Peer({
		initiator,
		trickle: false
	})
}