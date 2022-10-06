import { to_writable } from "svelteshareds"

import { resize_observer } from "../resize_observer"

export interface ElementSize {
	width: number
	height: number
}

/**
 * Reactive size of an HTML element.
 *
 * @param target
 * @param callback
 * @param options
 */
export function element_size(
	target: HTMLElement | SVGElement | undefined | null,
	initial_size: ElementSize = { width: 0, height: 0 },
	options: ResizeObserverOptions = {}
) {
	const { box = "content-box" } = options

	const width = to_writable(initial_size.width)

	const height = to_writable(initial_size.height)

	resize_observer(
		target,
		([entry]) => {
			const boxSize =
				box === "border-box"
					? entry.borderBoxSize
					: box === "content-box"
					? entry.contentBoxSize
					: entry.devicePixelContentBoxSize

			if (boxSize) {
				width.set(
					boxSize.reduce((acc, { inlineSize }) => acc + inlineSize, 0)
				)
				height.set(
					boxSize.reduce((acc, { blockSize }) => acc + blockSize, 0)
				)
			} else {
				// fallback
				width.set(entry.contentRect.width)
				height.set(entry.contentRect.height)
			}
		},
		options
	)

	width.set(target ? initial_size.width : 0)
	height.set(target ? initial_size.height : 0)

	return {
		width,
		height,
	}
}

// alias
export { element_size as elementSize }
