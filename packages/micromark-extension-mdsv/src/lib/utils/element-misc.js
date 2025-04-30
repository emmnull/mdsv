/** @import {Tokenizer, TokenizeContext, State} from 'micromark-util-types' */

import { codes } from 'micromark-util-symbol';

/**
 * Tokenize html instructions, declarations, and comments.
 *
 * @type {Tokenizer}
 */
export function factoryElementMisc(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | <!
   *      ^
   * > | <?
   *      ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    if (code === codes.exclamationMark) {
      effects.consume(code);
      return declarationStart;
    }
    if (code === codes.questionMark) {
      effects.consume(code);
      return instructionStart;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <!
   *       ^
   * ```
   *
   * @type {State}
   */
  function declarationStart(code) {
    if (code === codes.dash) {
      effects.consume(code);
      return commentStart;
    }
    return declaration(code);
  }

  /**
   * ```markdown
   * > | <!
   *       ^
   * ```
   *
   * @type {State}
   */
  function declaration(code) {}

  /**
   * ```markdown
   * > | <!-
   *        ^
   * ```
   *
   * @type {State}
   */
  function commentStart(code) {
    if (code === codes.dash) {
      effects.consume(code);
      return comment;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <!--
   *         ^
   * ```
   *
   * @type {State}
   */
  function comment(code) {}

  /**
   * ```markdown
   * > | <?
   *       ^
   * ```
   *
   * @type {State}
   */
  function instructionStart(code) {
    // to do
  }

  /**
   * ```markdown
   * > | <?
   *       ^
   * ```
   *
   * @type {State}
   */
  function instruction(code) {
    // to do
  }
}
