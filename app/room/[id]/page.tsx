"use client"
import { useEffect, useRef, useState } from "react"
import { createSocket, joinRoom, onSocketMessage } from "@/lib/socket"
import {
  createPeerOnReady,
  attachSignalHandler,
  forwardSignalToPeer,
  attachConnectHandler,
  attachDataHandler,
} from "@/lib/peer"
import type Peer from "simple-peer"

export default function ChatPage() {
  const socketRef = useRef<WebSocket | null>(null)
  const peerRef = useRef<Peer.Instance | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const socket = createSocket()
    socketRef.current = socket
    joinRoom(socket, 42)

    onSocketMessage(socket, (data) => {
      if (data.type === "ready") {
        const peer = createPeerOnReady(data)
        if (!peer) return
        peerRef.current = peer

        attachSignalHandler(peer, socket)
        attachConnectHandler(peer, () => setConnected(true))
        attachDataHandler(peer, (msg) => {                     
          setMessages((prev) => [...prev, msg])
        })
      }

      if (data.type === "signal" && peerRef.current) {
        forwardSignalToPeer(peerRef.current, data.signal as Peer.SignalData)
      }
    })
  }, [])

  return (
    <div>
      <p>{connected ? "Connected!" : "Waiting..."}</p>
      {messages.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  )
}