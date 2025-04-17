/** @import {Tokenizer, State, Code, Effects, TokenizeContext, Construct, Token, ConstructRecord} from 'micromark-util-types' */

import { types } from 'common/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEndingOrSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';

/**
 * @param {string} tagName
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 */
export function createTagMatch(tagName, effects, ok, nok) {
  let index = 0;

  return start;

  /** @type {State} */
  function start(code) {
    if (code !== codes.lessThan) {
      return nok;
    }
    effects.enter(types.svelteElementTag);
    effects.consume(code);
    return slash;
  }

  /** @type {State} */
  function slash(code) {
    if (code !== codes.slash) {
      return nok;
    }
    effects.consume(code);
    effects.enter(types.svelteElementTagName);
    return match;
  }

  /** @type {State} */
  function match(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (index < tagName.length) {
      if (code === tagName.charCodeAt(index)) {
        effects.consume(code);
        index++;
        return match;
      }
      return nok;
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.exit(types.svelteElementTagName);
      return factorySpace(effects, end, coreTypes.whitespace)(code);
    }
    return end(code);
  }
  /** @type {State} */
  function end(code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteElementTag);
      return ok;
    }
    return nok;
  }
}
