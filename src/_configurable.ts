import { is_client } from "svelteshareds"

export interface ConfigurableWindow {
	/*
	 * Specify a custom `window` instance, e.g. working with iframes or in testing environments.
	 */
	window?: Window
}

export interface ConfigurableDocument {
	/*
	 * Specify a custom `document` instance, e.g. working with iframes or in testing environments.
	 */
	document?: Document
}

export interface ConfigurableNavigator {
	/*
	 * Specify a custom `navigator` instance, e.g. working with iframes or in testing environments.
	 */
	navigator?: Navigator
}

export interface ConfigurableLocation {
	/*
	 * Specify a custom `location` instance, e.g. working with iframes or in testing environments.
	 */
	location?: Location
}

export const default_window = /* #__PURE__ */ is_client ? window : undefined
export const default_document = /* #__PURE__ */ is_client
	? window.document
	: undefined
export const default_navigator = /* #__PURE__ */ is_client
	? window.navigator
	: undefined
export const default_location = /* #__PURE__ */ is_client
	? window.location
	: undefined

// aliases
export {
	default_window as defaultWindow,
	default_document as defaultDocument,
	default_navigator as defaultNavigator,
	default_location as defaultLocation,
}
