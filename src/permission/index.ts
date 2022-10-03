import {
	create_singleton_promise,
	to_readable,
	to_writable,
	unstore,
} from "svelteshareds"

import { default_navigator } from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type { Readable } from "svelte/store"

import type { ConfigurableNavigator } from "../_configurable"

type DescriptorNamePolyfill =
	| "accelerometer"
	| "accessibility-events"
	| "ambient-light-sensor"
	| "background-sync"
	| "camera"
	| "clipboard-read"
	| "clipboard-write"
	| "gyroscope"
	| "magnetometer"
	| "microphone"
	| "notifications"
	| "payment-handler"
	| "persistent-storage"
	| "push"
	| "speaker"

export type GeneralPermissionDescriptor =
	| PermissionDescriptor
	| { name: DescriptorNamePolyfill }

export interface PermissionOptions<Controls extends boolean>
	extends ConfigurableNavigator {
	/**
	 * Expose more controls
	 *
	 * @default false
	 */
	controls?: Controls
}
export type PermissionReturn = Readable<PermissionState | undefined>
export interface PermissionReturnWithControls {
	state: PermissionReturn
	is_supported: Readable<boolean>
	query: () => Promise<PermissionStatus | undefined>
}

/**
 * Reactive Permissions API.
 *
 */
export function permission(
	permissionDesc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options?: PermissionOptions<false>
): PermissionReturn
export function permission(
	permissionDesc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options: PermissionOptions<true>
): PermissionReturnWithControls
export function permission(
	permission_desc:
		| GeneralPermissionDescriptor
		| GeneralPermissionDescriptor["name"],
	options: PermissionOptions<boolean> = {}
): PermissionReturn | PermissionReturnWithControls {
	const { controls = false, navigator = default_navigator } = options

	const is_supported = supported("permissions")

	let permission_status: PermissionStatus | undefined

	const desc = { name: permission_desc } as PermissionDescriptor

	const state = to_writable<PermissionState | undefined>(undefined)

	const on_change = () => {
		if (permission_status) state.set(permission_status.state)
	}

	const query = create_singleton_promise(async () => {
		if (!unstore(is_supported)) return

		if (!permission_status) {
			try {
				permission_status = await navigator?.permissions.query(desc)

				event_listener(permission_status, "change", on_change)

				on_change()
			} catch {
				state.set("prompt")
			}
		}
		return permission_status
	})

	query()

	if (controls) {
		return {
			state: to_readable<PermissionState | undefined>(state),
			is_supported,
			query,
		}
	} else {
		return to_readable(state)
	}
}
