"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createSocket } from "@/lib/socket"
import { createPeer } from "@/lib/peer"

export default function Room() {
	const { id } = useParams<{ id: string }>()
	const searchParams = useSearchParams()
	const isCreate = searchParams.get("create") === "1"
	const router = useRouter()

	const socketRef = useRef<WebSocket | null>(null)
	const peerRef = useRef<any>(null)
	const createSentRef = useRef(false)

	const [messages, setMessages] = useState<string[]>([])
	const [input, setInput] = useState("")
	const [copied, setCopied] = useState(false)

	useEffect(() => {
		const socket = createSocket()
		socketRef.current = socket

		socket.onopen = () => {
			if (isCreate && !createSentRef.current) {
				socket.send(JSON.stringify({
					type: "create",
					roomId: id
				}))
				createSentRef.current = true
				router.replace(`/room/${id}`)
			}

			socket.send(JSON.stringify({
				type: "join",
				roomId: id
			}))
		}

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data)

			if (data.type === "error") {
				if (data.message === "Room already exists" && isCreate) {
					return
				}
				router.replace("/404")
				return
			}

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

	async function copyRoomUrl() {
		try {
			await navigator.clipboard.writeText(window.location.href)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<h1 style={{ margin: 0 }}>Room: {id}</h1>
				<button onClick={copyRoomUrl}>
					{copied ? "Copied" : "Copy link"}
				</button>
			</div>

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