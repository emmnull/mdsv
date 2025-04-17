/** @import {State, Code, Effects, Token} from 'micromark-util-types'; */

import { asciiAlpha, asciiAlphanumeric } from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';

/**
 * Creates a tokenizer state machine for parsing a tag name.
 *
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 */
export function createTagName(effects, ok, nok) {
  return nameStart;

  /** @type {State} */
  function nameStart(code) {
    if (asciiAlpha(code)) {
      effects.consume(code);
      return name;
    }
    return nok;
  }

  /** @type {State} */
  function name(code) {
    if (
      asciiAlphanumeric(code) ||
      code === codes.dash ||
      code === codes.dot ||
      code === codes.colon
    ) {
      effects.consume(code);
      return name;
    }
    return ok(code);
  }
}
