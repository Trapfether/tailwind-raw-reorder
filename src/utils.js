/**
 * @typedef {string | string[] | { regex?: string | string[]; separator?: string; replacement?: string } | undefined} LangConfig
 */

/**
 * @typedef {{shouldRemoveDuplicates: boolean, shouldPrependCustomClasses: boolean, customTailwindPrefix: string, separator?: RegExp, replacement?: string}} Options
 */

/**
 * @param {unknown} value
 * @returns {value is string[]}
 */
function isArrayOfStrings(value) {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
}

/**
 * @typedef {{regex: RegExp[], separator?: RegExp, replacement?: string}} Matcher
 */

/**
 * @param {LangConfig} value
 * @returns {Matcher}
 */
function buildMatcher(value) {
	if (typeof value === 'string') {
		return {
			regex: [new RegExp(value, 'gi')],
		};
	} else if (isArrayOfStrings(value)) {
		return {
			regex: value.map((v) => new RegExp(v, 'gi')),
		};
	} else if (value == undefined) {
		return {
			regex: [],
		};
	} else {
		return {
			regex:
				typeof value.regex === 'string'
					? [new RegExp(value.regex, 'gi')]
					: isArrayOfStrings(value.regex)
					? value.regex.map((v) => new RegExp(v, 'gi'))
					: [],
			separator:
				typeof value.separator === 'string'
					? new RegExp(value.separator, 'g')
					: undefined,
			replacement: value.replacement || value.separator,
		};
	}
}

/**
 * @param {LangConfig | LangConfig[]} value
 * @returns {Matcher[]}
 */
export function buildMatchers(value) {
	if (value == undefined) {
		return [];
	} else if (Array.isArray(value)) {
		if (!value.length) {
			return [];
		} else if (!isArrayOfStrings(value)) {
			return value.map((v) => buildMatcher(v));
		}
	}
	return [buildMatcher(value)];
}

/**
 * @param {RegExp[]} regexes
 * @param {string} text
 * @param {(text: string, startPosition: number) => void} callback
 * @param {number} [startPosition=0]
 */
export function getTextMatch(
	regexes,
	text,
	callback,
	startPosition = 0
) {
	if (regexes.length >= 1) {
		/** @type {RegExpExecArray | null} */
		let wrapper;
		while ((wrapper = regexes[0].exec(text)) !== null) {
			const wrapperMatch = wrapper[0];
			const valueMatchIndex = wrapper.findIndex(
				(match, idx) => idx !== 0 && match
			);
			const valueMatch = wrapper[valueMatchIndex];

			const newStartPosition =
				startPosition + wrapper.index + wrapperMatch.lastIndexOf(valueMatch);

			if (regexes.length === 1) {
				callback(valueMatch, newStartPosition);
			} else {
				getTextMatch(regexes.slice(1), valueMatch, callback, newStartPosition);
			}
		}
	}
}
