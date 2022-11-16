import { try_on_destroy, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { supported } from "../supported"

export interface ResizeObserverSize {
	readonly inlineSize: number
	readonly blockSize: number
}

export interface ResizeObserverEntry {
	readonly target: Element
	readonly contentRect: DOMRectReadOnly
	readonly borderBoxSize?: ReadonlyArray<ResizeObserverSize>
	readonly contentBoxSize?: ReadonlyArray<ResizeObserverSize>
	readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>
}

export type ResizeObserverCallback = (
	entries: ReadonlyArray<ResizeObserverEntry>,
	observer: ResizeObserver
) => void

export interface ResizeObserverOptions {
	/**
	 * Sets which box model the observer will observe changes to. Possible values
	 * are `content-box` (the default), `border-box` and `device-pixel-content-box`.
	 *
	 * @default 'content-box'
	 */
	box?: ResizeObserverBoxOptions
}

declare class ResizeObserver {
	constructor(callback: ResizeObserverCallback)
	disconnect(): void
	observe(target: Element, options?: ResizeObserverOptions): void
	unobserve(target: Element): void
}

/**
 * Reports changes to the dimensions of an Element's content or the border-box
 *
 * @param target
 * @param callback
 * @param options
 */
export function resize_observer(
	target: HTMLElement | SVGElement | undefined | null,
	callback: ResizeObserverCallback,
	options: ResizeObserverOptions = {}
) {
	const { ...observerOptions } = options

	let observer: ResizeObserver | undefined

	const is_supported = supported("ResizeObserver", { from: "window" })

	const cleanup = () => {
		if (observer) {
			observer.disconnect()
			observer = undefined
		}
	}
	cleanup()

	if (unstore(is_supported) && window && target) {
		observer = new ResizeObserver(callback)
		observer?.observe(target, observerOptions)
	}

	try_on_destroy(cleanup)

	return {
		is_supported,
		cleanup,
	}
}

// alias
export { resize_observer as resizeObserver }
