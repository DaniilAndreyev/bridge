"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [room, setRoom] = useState("")

  return (
    <div>
      <h1>Join Room</h1>

      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="room id"
      />

      <button className="p-9 bg-amber-200" onClick={() => router.push(`/room/${room}`)}>
        Join
      </button>
    </div>
  )
}