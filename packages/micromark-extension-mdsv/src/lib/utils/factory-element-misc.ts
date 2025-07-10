import { codes } from 'micromark-util-symbol';
import type { Code, Effects, State } from 'micromark-util-types';

/**
 * - Instructions.
 * - Declarations.
 * - Comments.
 */
export function factoryElementMisc(effects: Effects, ok: State, nok: State) {
  return start;

  /**
   * ```markdown
   * > | <!
   *      ^
   * > | <?
   *      ^
   * ```
   */
  function start(code: Code) {
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
   */
  function declarationStart(code: Code) {
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
   */
  function declaration(code: Code) {
    // TO DO
    return ok(code);
  }

  /**
   * ```markdown
   * > | <!-
   *        ^
   * ```
   */
  function commentStart(code: Code) {
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
   */
  function comment(code: Code) {
    // TO DO
    return ok(code);
  }

  /**
   * ```markdown
   * > | <?
   *       ^
   * ```
   */
  function instructionStart(code: Code) {
    // TO DO
    return ok(code);
  }

  // /**
  //  * ```markdown
  //  * > | <?
  //  *       ^
  //  * ```
  //  */
  // function instruction(code: Code) {
  //   // TO DO
  //   return ok(code);
  // }
}
