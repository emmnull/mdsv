/** @import {State, Code, Effects, Token} from 'micromark-util-types'; */

import { asciiAlpha, asciiAlphanumeric } from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';

/**
 * ```markdown
 * > | <x
 *      ^
 * ```
 *
 * @param {Code} code
 * @returns {code is NonNullable<Code>}
 */
export function tagNameStartChar(code) {
  return asciiAlpha(code);
}

/**
 * ```markdown
 * > | <xy
 *       ^
 * ```
 *
 * @param {Code} code
 * @returns {code is NonNullable<Code>}
 */
export function tagNameChar(code) {
  return (
    asciiAlphanumeric(code) ||
    code === codes.dash ||
    code === codes.dot ||
    code === codes.colon
  );
}

/**
 * Test if a name is a component or custom element name.
 *
 * ```markdown
 * <FooBar>
 * <foo-bar>
 * <foo.bar>
 * <foo:bar>
 * ```
 *
 * @param {string} name
 */
export function svelteName(name) {
  return /[A-Z]/.test(name[0]) || /[-.:]/.test(name);
}
