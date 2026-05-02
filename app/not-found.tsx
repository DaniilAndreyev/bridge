import Link from "next/link"

export default function NotFound() {
	return (
		<div className="h-screen bg-stone-800 bg-cover flex flex-col items-center justify-center gap-6 px-6">
			<div className="text-9xl font-semibold text-emerald-400">404</div>
			<p className="text-sm text-stone-300">No Bridge here, unfortunately :(</p>
			<Link
				href="/"
				className="p-6 py-3 text-base text-stone-100 transition-colors duration-300 bg-stone-700 rounded-lg hover:bg-stone-600 ease px-7"
			>
				Back Home
			</Link>
		</div>
	)
}
	