import Peer from "simple-peer"
import type { ServerMessage } from "./types/messages"

export function createPeerOnReady(data: ServerMessage): Peer.Instance | undefined {
  if (data.type !== "ready") return undefined
  return new Peer({ initiator: data.initiator, trickle: false })
}

export function attachSignalHandler(peer: Peer.Instance, socket: WebSocket) {
  peer.on("signal", (signal) => {
    socket.send(JSON.stringify({ type: "signal", signal }))
  })
}

export function forwardSignalToPeer(peer: Peer.Instance, signal: string | Peer.SignalData) {
  peer.signal(signal)
}

export function attachConnectHandler(
  peer: Peer.Instance,
  onConnect: () => void
) {
  peer.on("connect", () => {
    console.log("Connected!")
    peer.send("hello")
    onConnect()
  })
}

export function attachDataHandler(
  peer: Peer.Instance,
  onMessage: (msg: string) => void
) {
  peer.on("data", (data) => {
    onMessage(data.toString())
  })
}