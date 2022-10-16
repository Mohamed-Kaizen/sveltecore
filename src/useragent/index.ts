import { onDestroy } from "svelte"
import { to_readable, to_writable, unstore } from "svelteshareds"

import { async_state } from "../async_state"
import { supported } from "../supported"

interface UserAgentData {
	mobile: boolean

	architecture: string

	model: string

	platform: string

	platformVersion: string

	bitness: string

	brands: UserAgentDataBrand[]
}

interface UserAgentDataBrand {
	name: string

	version: string
}

export function useragent() {
	const mobile = to_writable(false)

	const arch = to_writable("")

	const model = to_writable("")

	const platform = to_writable("")

	const platform_version = to_writable("")

	const bitness = to_writable("")

	const brands = to_writable<UserAgentDataBrand[]>([
		{ name: "", version: "" },
	])

	const is_supported = supported("userAgentData")

	if (unstore(is_supported)) {
		const { state } = async_state<UserAgentData>(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			navigator.userAgentData.getHighEntropyValues([
				"architecture",
				"model",
				"platform",
				"platformVersion",
				"bitness",
			]),
			{
				mobile: false,
				architecture: "",
				model: "",
				platform: "",
				platformVersion: "",
				bitness: "",
				brands: [{ name: "", version: "" }],
			}
		)
		const unsubscribe = state.subscribe((v) => {
			if (!v) return

			mobile.set(v.mobile)

			arch.set(v.architecture)

			model.set(v.model)

			platform.set(v.platform)

			platform_version.set(v.platformVersion)

			bitness.set(v.bitness)

			const _brands = v.brands.map((b: any) => {
				return {
					name: b.brand,
					version: b.version,
				}
			})

			brands.set(_brands)
		})

		onDestroy(unsubscribe)
	}

	return {
		is_supported,
		brands: to_readable(brands),
		mobile: to_readable(mobile),
		arch: to_readable(arch),
		model: to_readable(model),
		platform: to_readable(platform),
		platform_version: to_readable(platform_version),
		bitness: to_readable(bitness),
	}
}
