/** @import {Effects, State, Token, TokenizeContext, Tokenizer, TokenType} from 'micromark-util-types' */

import { markdownLineEnding } from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryTagClose } from './factory-tag-close.js';

/**
 * Consume and tokenize content up until element termination is detected.
 *
 * @param {Effects} effects
 * @param {State} ok State to transition to after ending content and closing
 *   tag.
 * @param {State | null} line State to transition to on line ending.
 * @param {string} tagName Tag name to match for closing tag.
 * @param {Token} token
 */
export function factoryElementContent(effects, ok, line, tagName, token) {
  return content;

  /** @type {State} */
  function content(code) {
    if (code === codes.eof) {
      effects.exit(token.type);
      return ok;
    }
    if (line && markdownLineEnding(code)) {
      effects.exit(token.type);
      effects.consume(code);
      return line;
    }
    if (code === codes.lessThan) {
      return effects.attempt(
        { partial: true, tokenize: tokenizeClose },
        ok,
        consume,
      )(code);
    }
    return consume(code);
  }

  /** @type {State} */
  function consume(code) {
    effects.consume(code);
    return content;
  }

  /** @type {Tokenizer} */
  function tokenizeClose(effects, ok, nok) {
    return startClose;

    /** @type {State} */
    function startClose(code) {
      effects.exit(token.type);
      return factoryTagClose(effects, ok, nok, tagName)(code);
    }
  }
}
