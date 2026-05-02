"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { createSocket } from "@/lib/socket"
import { createPeer } from "@/lib/peer"

export default function Room() {
	const { id } = useParams<{ id: string }>()

	const socketRef = useRef<WebSocket | null>(null)
	const peerRef = useRef<any>(null)

	const [messages, setMessages] = useState<string[]>([])
	const [input, setInput] = useState("")

	useEffect(() => {
		const socket = createSocket()
		socketRef.current = socket

		socket.onopen = () => {
			socket.send(JSON.stringify({
				type: "join",
				roomId: id
			}))
		}

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data)

			if (data.type === "ready") {
				const peer = createPeer(data.initiator)
				peerRef.current = peer

				peer.on("signal", (signal: any) => {
					socket.send(JSON.stringify({
						type: "signal",
						signal
					}))
				})

				peer.on("data", (data: any) => {
					setMessages((prev) => [
						...prev,
						`Other: ${data.toString()}`
					])
				})
			}

			if (data.type === "signal") {
				peerRef.current?.signal(data.signal)
			}
		}

		return () => {
			peerRef.current?.destroy()
			socket.close()
		}
	}, [id])

	function sendMessage() {
		const peer = peerRef.current
		if (!peer || !input.trim()) return

		peer.send(input)

		setMessages((prev) => [
			...prev,
			`You: ${input}`
		])

		setInput("")
	}

	return (
		<div style={{ padding: 20 }}>
			<h1>Room: {id}</h1>

			{/* messages */}
			<div style={{
				height: 300,
				border: "1px solid #ccc",
				padding: 10,
				overflowY: "auto",
				marginBottom: 10
			}}>
				{messages.map((m, i) => (
					<div key={i}>{m}</div>
				))}
			</div>

			{/* input */}
			<input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Type message..."
				style={{ marginRight: 10 }}
			/>

			<button onClick={sendMessage}>
				Send
			</button>
		</div>
	)
}