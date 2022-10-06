import { onDestroy } from "svelte"
import { unstore } from "svelteshareds"

import { default_window } from "../_configurable"
import { supported } from "../supported"

import type { ConfigurableWindow } from "../_configurable"

export interface ResizeObserverSize {
	readonly inline_size: number
	readonly block_size: number
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

export interface ResizeObserverOptions extends ConfigurableWindow {
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
	const { window = default_window, ...observerOptions } = options

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

	onDestroy(cleanup)

	return {
		is_supported,
		cleanup,
	}
}

// alias
export { resize_observer as resizeObserver }
