import { interval_fn, to_readable, to_writable, unstore } from "svelteshareds"

import { supported } from "../supported"

import type { IntervalFnOptions } from "svelteshareds"

/**
 * Performance.memory
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export interface MemoryInfo {
	/**
	 * The maximum size of the heap, in bytes, that is available to the context.
	 */
	jsHeapSizeLimit: number
	/**
	 *  The total allocated heap size, in bytes.
	 */
	totalJSHeapSize: number
	/**
	 * The currently active segment of JS heap, in bytes.
	 */
	usedJSHeapSize: number
}

export interface MemoryOptions extends IntervalFnOptions {
	interval?: number
}

type PerformanceMemory = Performance & {
	memory: MemoryInfo
}

/**
 * Reactive Memory Info.
 *
 * @param options
 */
export function memory(options: MemoryOptions = {}) {
	const memory = to_writable<MemoryInfo | undefined>(undefined)

	const is_supported = supported("memory", { from: "performance" })

	if (unstore(is_supported)) {
		const { interval = 1000 } = options

		interval_fn(
			() => {
				memory.set({
					jsHeapSizeLimit: (performance as PerformanceMemory).memory
						.jsHeapSizeLimit,
					totalJSHeapSize: (performance as PerformanceMemory).memory
						.totalJSHeapSize,
					usedJSHeapSize: (performance as PerformanceMemory).memory
						.usedJSHeapSize,
				})
			},
			interval,
			{
				immediate: options.immediate,
				immediate_callback: options.immediate_callback,
			}
		)
	}

	return { is_supported, result: to_readable(memory) }
}

export type MemoryReturn = ReturnType<typeof memory>
