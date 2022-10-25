import { is_string, noop, try_on_destroy } from "svelteshareds"

import { default_window } from "../_configurable"

import type { Fn } from "svelteshareds"

interface InferEventTarget<Events> {
	addEventListener(event: Events, fn?: Fn, options?: any): any
	removeEventListener(event: Events, fn?: Fn, options?: any): any
}

export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap

export interface GeneralEventListener<E = Event> {
	(evt: E): void
}

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 1: Omitted Window target
 *
 * @param event
 * @param listener
 * @param options
 */
export function event_listener<E extends keyof WindowEventMap>(
	event: E,
	listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function event_listener<E extends keyof WindowEventMap>(
	target: Window,
	event: E,
	listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function event_listener<E extends keyof DocumentEventMap>(
	target: Document,
	event: E,
	listener: (this: Document, ev: DocumentEventMap[E]) => any,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Custom event target with event type infer
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function event_listener<Names extends string, EventType = Event>(
	target: InferEventTarget<Names>,
	event: Names,
	listener: GeneralEventListener<EventType>,
	options?: boolean | AddEventListenerOptions
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target fallback
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function event_listener<EventType = Event>(
	target: EventTarget | null | undefined,
	event: string,
	listener: GeneralEventListener<EventType>,
	options?: boolean | AddEventListenerOptions
): Fn
export function event_listener(...args: any[]) {
	let target: EventTarget | undefined
	let event: string
	let listener: any
	let options: any

	if (is_string(args[0])) {
		;[event, listener, options] = args
		target = default_window
	} else {
		;[target, event, listener, options] = args
	}

	if (!target) return noop

	target.addEventListener(event, listener, options)

	function cleanup() {
		target?.removeEventListener(event, listener, options)
	}

	try_on_destroy(cleanup)

	return cleanup
}

// alias
export { event_listener as on, event_listener as eventListener }
