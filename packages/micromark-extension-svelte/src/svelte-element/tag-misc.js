/** @import {Effects, State} from 'micromark-util-types' */

import { assert } from 'common/utils';
import { codes } from 'micromark-util-symbol';

/**
 * @param {Effects} effects,
 * @param {(code: typeof codes.greaterThan) => State | undefined} close
 * @param {State} nok
 */
export function createTagMisc(effects, close, nok) {
  return start;

  /** @param {typeof codes.exclamationMark | typeof codes.questionMark} code */
  function start(code) {
    assert(
      code === codes.exclamationMark || code === codes.questionMark,
      'expected "!" or "?"',
    );
    if (code === codes.exclamationMark) {
      effects.consume(code);
      return declaration;
    }
    if (code === codes.questionMark) {
      effects.consume(code);
      return instruction;
    }
    return nok;
  }

  /** @type {State} */
  function declaration(code) {
    if (code === codes.greaterThan) {
      return close(code);
    }
    if (code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return declaration;
  }

  /** @type {State} */
  function instruction(code) {
    if (code === codes.questionMark) {
      effects.consume(code);
      return maybeInstructionEnd;
    }
    if (code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return instruction;
  }

  /** @type {State} */
  function maybeInstructionEnd(code) {
    if (code === codes.greaterThan) {
      return close(code);
    }
    return instruction(codes.questionMark);
  }
}
