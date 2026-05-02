"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  function handleCreate() {
    const roomId = crypto.randomUUID()
    router.push(`/room/${roomId}?create=1`)
  }

  function handleJoin() {
    const roomId = window.prompt("Enter room id")?.trim()
    if (!roomId) return
    router.push(`/room/${roomId}`)
  }

  return (
    <div>
      <h1>Join Room</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="p-9 bg-amber-200" onClick={handleJoin}>
          Join
        </button>

        <button className="p-9 bg-emerald-200" onClick={handleCreate}>
          Create
        </button>
      </div>
    </div>
  )
}