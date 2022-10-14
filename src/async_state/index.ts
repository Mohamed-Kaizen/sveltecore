import { noop, sleep, to_readable, to_writable } from "svelteshareds"

import type { Readable } from "svelte/store"

export interface AsyncStateReturn<Data> {
	state: Readable<Data>

	is_ready: Readable<boolean>

	is_loading: Readable<boolean>

	error: Readable<unknown>

	execute: (delay?: number, ...args: any[]) => Promise<Data>
}

export interface AsyncStateOptions {
	/**
	 * Delay for executing the promise. In milliseconds.
	 *
	 * @default 0
	 */
	delay?: number

	/**
	 * Execute the promise right after the function is invoked.
	 * Will apply the delay if any.
	 *
	 * When set to false, you will need to execute it manually.
	 *
	 * @default true
	 */
	immediate?: boolean

	/**
	 * Callback when error is caught.
	 */
	on_error?: (e: unknown) => void

	/**
	 * Sets the state to initialState before executing the promise.
	 *
	 * This can be useful when calling the execute function more than once (for
	 * example, to refresh data). When set to false, the current state remains
	 * unchanged until the promise resolves.
	 *
	 * @default true
	 */
	reset_on_execute?: boolean

	/**
	 *
	 * An error is thrown when executing the execute function
	 *
	 * @default false
	 */
	throw_error?: boolean
}

/**
 * Reactive async state. Will not block your setup function and will trigger changes once
 * the promise is ready.
 *
 * @param promise         The promise / async function to be resolved
 * @param initial_state    The initial state, used until the first evaluation finishes
 * @param options
 */
export function async_state<Data>(
	promise: Promise<Data> | ((...args: any[]) => Promise<Data>),
	initial_state: Data,
	options?: AsyncStateOptions
): AsyncStateReturn<Data> {
	const {
		immediate = true,
		delay = 0,
		on_error = noop,
		reset_on_execute = true,
		throw_error,
	} = options ?? {}

	const state = to_writable(initial_state)

	const is_ready = to_writable(false)

	const is_loading = to_writable(false)

	const error = to_writable<unknown | undefined>(undefined)

	async function execute(delay = 0, ...args: any[]) {
		if (reset_on_execute) state.set(initial_state)

		error.set(undefined)

		is_ready.set(false)

		is_loading.set(true)

		if (delay > 0) await sleep(delay)

		const _promise =
			typeof promise === "function" ? promise(...args) : promise

		try {
			const data = await _promise

			state.set(data)

			is_ready.set(true)
		} catch (e) {
			error.set(e)
			on_error(e)
			if (throw_error) throw error
		} finally {
			is_loading.set(false)
		}

		return state as Data
	}

	if (immediate) execute(delay)

	return {
		state: to_readable(state),
		is_ready: to_readable(is_ready),
		is_loading: to_readable(is_loading),
		error: to_readable(error),
		execute,
	}
}

// alias
export { async_state as asyncState }
