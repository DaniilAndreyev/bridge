"use client"

// Room page: joins/creates rooms, negotiates WebRTC peers, and renders chat UI.

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createSocket } from "@/lib/socket"
import { createPeer } from "@/lib/peer"

export default function Room() {
	// Room UI: handles signaling, peer connection, and message rendering.
	const { id } = useParams<{ id: string }>()
	const searchParams = useSearchParams()
	const isCreate = searchParams.get("create") === "1"
	const router = useRouter()

	const socketRef = useRef<WebSocket | null>(null)
	const peerRef = useRef<any>(null)
	const createSentRef = useRef(false)
	const messagesRef = useRef<HTMLDivElement | null>(null)

	const [messages, setMessages] = useState<string[]>([])
	const [input, setInput] = useState("")
	const [copied, setCopied] = useState(false)
	const peerConnectedRef = useRef(false)
	const [connectionClosed, setConnectionClosed] = useState(false)
	const primaryButtonClass = "p-6 py-3 text-base text-stone-100 transition-colors duration-300 bg-stone-700 rounded-lg hover:bg-stone-600 ease px-7"

	// Add a system message to the message stream.
	function addSystemMessage(text: string) {
		setMessages((prev) => [
			...prev,
			`System: ${text}`
		])
	}

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

				peer.on("connect", () => {
					peerConnectedRef.current = true
				})

				peer.on("close", () => {
					if (peerConnectedRef.current) {
						addSystemMessage("Connection closed by the other user.")
						setConnectionClosed(true)
					}
				})

				peer.on("error", () => {
					if (peerConnectedRef.current) {
						addSystemMessage("Connection error. The peer may have disconnected.")
						setConnectionClosed(true)
					}
				})
			}

			if (data.type === "signal") {
				peerRef.current?.signal(data.signal)
			}
		}

		socket.onclose = () => {
			if (peerConnectedRef.current) {
				addSystemMessage("WebSocket closed. Connection ended.")
				setConnectionClosed(true)
			}
		}

		return () => {
			peerRef.current?.destroy()
			socket.close()
		}
	}, [id])

	useEffect(() => {
		const container = messagesRef.current
		if (!container) return
		container.scrollTop = container.scrollHeight
	}, [messages.length])

	// Send a chat message over the established peer connection.
	function sendMessage() {
		const peer = peerRef.current
		if (!peer || connectionClosed || !input.trim()) return

		peer.send(input)

		setMessages((prev) => [
			...prev,
			`You: ${input}`
		])

		setInput("")
	}

	// Copy the current room URL for sharing.
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
		<div className="min-h-screen bg-stone-800 bg-cover flex flex-col items-center justify-center gap-6 px-6">
			<div className="flex w-full max-w-2xl justify-end">
				<button
					className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide text-stone-100 transition hover:bg-stone-700/40"
					onClick={copyRoomUrl}
				>
					{copied ? "Copied" : "Copy link"}
				</button>
			</div>

			{/* messages */}
			<div ref={messagesRef} className="room-scrollbar w-full max-w-2xl min-h-[320px] max-h-[420px] overflow-y-auto rounded-xl border border-stone-700/40 bg-stone-900/20 px-3 py-2">
				{messages.map((m, i) => {
					const isSystem = m.startsWith("System:")
					const isYou = m.startsWith("You:")
					const alignment = isSystem ? "justify-center" : isYou ? "justify-start" : "justify-end"
					const text = m.replace(/^You:\s?|^Other:\s?|^System:\s?/, "")

					return (
						<div key={i} className={`flex ${alignment} py-1`}>
							<div className={isSystem ? "text-xs text-rose-400" : "text-sm text-stone-100"}>
								{text}
							</div>
						</div>
					)
				})}
			</div>

			{connectionClosed ? (
				<button className={primaryButtonClass} onClick={() => router.push("/")}>Return to home</button>
			) : (
				<div className="flex w-full max-w-2xl items-center gap-3">
					{/* input */}
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault()
								sendMessage()
							}
						}}
						placeholder="Type message..."
						className="flex-1 rounded-lg border border-stone-600 bg-stone-900/60 px-4 py-3 text-sm text-stone-100 outline-none"
					/>

					<button className={primaryButtonClass} onClick={sendMessage}>
						Send
					</button>
				</div>
			)}
		</div>
	)
}