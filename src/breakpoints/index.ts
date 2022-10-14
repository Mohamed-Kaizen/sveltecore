import { adjust_with_unit, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { media_query } from "../media_query"

import type { Readable } from "svelte/store"

/**
 * Breakpoints from Tailwind V2
 *
 * @see https://tailwindcss.com/docs/breakpoints
 */
export const breakpoints_tailwind = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
}

/**
 * Breakpoints from Bootstrap V5
 *
 * @see https://getbootstrap.com/docs/5.0/layout/breakpoints
 */
export const breakpoints_bootstrap5 = {
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
	xxl: 1400,
}

/**
 * Breakpoints from Ant Design
 *
 * @see https://ant.design/components/layout/#breakpoint-width
 */
export const breakpoints_ant_design = {
	xs: 480,
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
	xxl: 1600,
}

/**
 * Sematic Breakpoints
 */
export const breakpoints_sematic = {
	mobileS: 320,
	mobileM: 375,
	mobileL: 425,
	tablet: 768,
	laptop: 1024,
	laptopL: 1440,
	desktop4K: 2560,
}

export type Breakpoints<K extends string = string> = Record<K, number | string>

/**
 * Reactively viewport breakpoints
 *
 * @param options
 */
export function breakpoints<K extends string>(breakpoints: Breakpoints<K>) {
	function get_value(k: K, delta?: number) {
		let v = breakpoints[k]

		if (delta != null) v = unstore(adjust_with_unit(v, delta))

		if (typeof v === "number") v = `${v}px`

		return v
	}

	function match(query: string): boolean {
		if (!window) return false
		return window.matchMedia(query).matches
	}

	const greater_or_equal = (k: K) => {
		return media_query(`(min-width: ${get_value(k)})`)
	}

	const shortcut_methods = Object.keys(breakpoints).reduce((shortcuts, k) => {
		Object.defineProperty(shortcuts, k, {
			get: () => greater_or_equal(k as K),
			enumerable: true,
			configurable: true,
		})
		return shortcuts
	}, {} as Record<K, Readable<boolean>>)

	return {
		greater(k: K) {
			return media_query(`(min-width: ${get_value(k, 0.1)})`)
		},

		greater_or_equal,

		smaller(k: K) {
			return media_query(`(max-width: ${get_value(k, -0.1)})`)
		},

		smaller_or_equal(k: K) {
			return media_query(`(max-width: ${get_value(k)})`)
		},

		between(a: K, b: K) {
			return media_query(
				`(min-width: ${get_value(a)}) and (max-width: ${get_value(
					b,
					-0.1
				)})`
			)
		},

		is_greater(k: K) {
			return match(`(min-width: ${get_value(k, 0.1)})`)
		},

		is_greater_or_equal(k: K) {
			return match(`(min-width: ${get_value(k)})`)
		},

		is_smaller(k: K) {
			return match(`(max-width: ${get_value(k, -0.1)})`)
		},

		isSmallerOrEqual(k: K) {
			return match(`(max-width: ${get_value(k)})`)
		},
		is_in_between(a: K, b: K) {
			return match(
				`(min-width: ${get_value(a)}) and (max-width: ${get_value(
					b,
					-0.1
				)})`
			)
		},
		...shortcut_methods,
	}
}

// alias
export {
	breakpoints_tailwind as breakpointsTailwind,
	breakpoints_bootstrap5 as breakpointsBootstrap5,
	breakpoints_ant_design as breakpointsAntDesign,
	breakpoints_sematic as breakpointsSematic,
}
