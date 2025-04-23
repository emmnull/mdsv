/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryPlainExpression } from '../factory-plain-expression.js';

/** @returns {Extension} */
export function svelteBlock() {
  return {
    disable: {
      null: ['codeIndented'],
    },
    flow: {
      [codes.leftCurlyBrace]: {
        name: types.svelteBlockTag,
        tokenize,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: types.svelteBlockTag,
        tokenize,
        concrete: true,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteBlock() {
  return {
    exit: {
      [types.svelteBlockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * Naive tokenizer only preoccupied with block tags without validating keywords
 * nor attempting to match opening tags with closing tags.
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  // const self = this;
  // const stack = this.svelteBlockStack || (this.svelteBlockStack = []);
  // /** @type {Token | undefined} */
  // let nameToken;
  // /** @type {'open' | 'branch' | 'close' | undefined} */
  // let type;

  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftCurlyBrace, 'expected "{"');
    effects.enter(types.svelteBlockTag);
    effects.enter(types.svelteMarker);
    effects.consume(code);
    effects.exit(types.svelteMarker);
    return blockTagMarker;
  }

  /** @type {State} */
  function blockTagMarker(code) {
    if (
      code !== codes.numberSign &&
      code !== codes.colon &&
      code !== codes.slash
    ) {
      return nok;
    }
    // switch (code) {
    //   case codes.numberSign:
    //     type = 'open';
    //     break;
    //   case codes.colon:
    //     type = 'branch';
    //     break;
    //   case codes.slash:
    //     type = 'close';
    //     break;
    //   default:
    //     return nok;
    // }
    effects.enter(types.svelteBlockTagMarker);
    effects.consume(code);
    effects.exit(types.svelteBlockTagMarker);
    return nameStart;
  }

  /** @type {State} */
  function nameStart(code) {
    if (code === codes.eof || !asciiAlpha(code)) {
      return nok;
    }
    effects.enter(types.svelteBlockTagName);
    effects.consume(code);
    return name;
  }

  /** @type {State} */
  function name(code) {
    if (asciiAlphanumeric(code)) {
      effects.consume(code);
      return name;
    }
    // nameToken = effects.exit(types.svelteBlockTagName);
    effects.exit(types.svelteBlockTagName);
    return afterName(code);
  }

  /** @type {State} */
  function afterName(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownSpace(code) || markdownLineEnding(code)) {
      effects.consume(code);
      return afterName;
    }
    effects.enter(types.svelteBlockTagValue);
    return factoryPlainExpression(effects, afterValue, nok)(code);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function afterValue(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.exit(types.svelteBlockTagValue);
    return end(brace);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function end(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.enter(types.svelteMarker);
    effects.consume(brace);
    effects.exit(types.svelteMarker);
    effects.exit(types.svelteBlockTag);
    // assert(
    //   nameToken !== undefined,
    //   'Block tag name token should have been captured.',
    // );
    // const tagName = self.sliceSerialize(nameToken);
    // switch (type) {
    //   case 'open':
    //     stack.push(tagName);
    //     break;
    //   case 'branch':
    //     if (!stack.length) {
    //       return nok;
    //     }
    //     break;
    //   case 'close':
    //     if (!stack.length) {
    //       return nok;
    //     }
    //     if (stack[stack.length - 1] !== tagName) {
    //       return nok;
    //     }
    //     stack.pop();
    //     break;
    //   default:
    //     return nok;
    // }
    return ok;
  }
}
