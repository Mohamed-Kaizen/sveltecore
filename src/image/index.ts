import { async_state } from "../async_state"

import type { AsyncStateOptions } from "../async_state"

export interface ImageOptions {
	/** Address of the resource */
	src: string
	/** Images to use in different situations, e.g., high-resolution displays, small monitors, etc. */
	srcset?: string
	/** Image sizes for different page layouts */
	sizes?: string
}

async function load_image(options: ImageOptions): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()

		const { src, srcset, sizes } = options

		img.src = src

		if (srcset) img.srcset = srcset

		if (sizes) img.sizes = sizes

		img.onload = () => resolve(img)

		img.onerror = reject
	})
}

/**
 * Reactive load an image in the browser, you can wait the result to display it or show a fallback.
 *
 * @param options Image attributes, as used in the <img> tag
 * @param asyncStateOptions
 */
export function image(
	options: ImageOptions,
	async_state_options?: AsyncStateOptions
) {
	const state = async_state<HTMLImageElement | undefined>(
		() => load_image(options),
		undefined,
		{
			reset_on_execute: true,
			...async_state_options,
		}
	)
	state.execute(async_state_options ? async_state_options.delay : 0)

	return state
}
