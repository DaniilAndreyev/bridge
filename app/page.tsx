"use client"

// Home page: generates shareable room links and provides copy controls.

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  // Home UI: generates a shareable room URL and lets users copy it.
  const router = useRouter()
  const [link, setLink] = useState("")
  const [copied, setCopied] = useState(false)

  // Generate a new room URL without navigating away.
  function handleCreate() {
    const roomId = crypto.randomUUID()
    const url = `${window.location.origin}/room/${roomId}?create=1`
    setLink(url)
    setCopied(false)
  }

  // Copy the generated room URL to the clipboard.
  async function handleCopy() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="h-screen bg-stone-800 bg-cover flex flex-col items-center justify-center gap-10 px-6">
      <div className="text-9xl font-semibold text-emerald-400">Bridge</div>

      <div className="flex w-full max-w-lg flex-col items-center gap-4">
        <div className="flex w-lg items-center gap-2 rounded-lg border border-stone-600 bg-stone-900/60 px-4 py-3">
          <input
            className="w-full bg-transparent text-sm text-stone-300 placeholder-stone-500 outline-none"
            placeholder="Your bridge link will appear here"
            readOnly
            value={link}
          />
          <button
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide text-stone-100 transition hover:bg-stone-700/40"
            onClick={handleCopy}
            disabled={!link}
          >
            {copied ? "Copied" : ""}
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        <button
          className="p-6 py-3 text-base text-stone-100 transition-colors duration-300 bg-stone-700 rounded-lg hover:bg-stone-600 ease px-7"
          onClick={handleCreate}
        >
          Generate
        </button>
      </div>
    </div>
  )
}