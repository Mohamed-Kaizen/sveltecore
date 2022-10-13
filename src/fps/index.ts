import { to_writable } from "svelteshareds"

import { raf_fn } from "../raf_fn"

import type { Readable } from "svelte/store"

export interface FpsOptions {
	/**
	 * Calculate the FPS on every x frames.
	 * @default 10
	 */
	every?: number
}

export function fps(options?: FpsOptions): Readable<number> {
	const { subscribe, set } = to_writable(0)

	if (typeof performance === "undefined") return { subscribe }

	const every = options?.every ?? 10

	let last = performance.now()

	let ticks = 0

	raf_fn(() => {
		ticks += 1

		if (ticks >= every) {
			const now = performance.now()

			const diff = now - last

			set(Math.round(1000 / (diff / ticks)))

			last = now

			ticks = 0
		}
	})

	return { subscribe }
}
