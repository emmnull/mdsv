/** @import {Tokenizer, TokenizeContext, State, Effects} from 'micromark-util-types' */

import { codes } from 'micromark-util-symbol';

/**
 * Tokenize html instructions, declarations, and comments.
 *
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
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
  function declaration(code) {
    // TO DO
    return ok(code);
  }

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
  function comment(code) {
    // TO DO
    return ok(code);
  }

  /**
   * ```markdown
   * > | <?
   *       ^
   * ```
   *
   * @type {State}
   */
  function instructionStart(code) {
    // TO DO
    return ok(code);
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
    // TO DO
    return ok(code);
  }
}
