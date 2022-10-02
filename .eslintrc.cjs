module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	plugins: ["@typescript-eslint"],
	env: {
		browser: true,
		node: true,
	},
	rules: {
		camelcase: "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-inferrable-types": "off",
		"no-empty": "off",
	},
}
