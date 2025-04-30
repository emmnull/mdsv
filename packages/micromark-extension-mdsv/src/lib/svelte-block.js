/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token} from 'micromark-util-types' */

import { types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryPlainExpression } from './utils/plain-expression.js';

/** @returns {Extension} */
export function svelteBlock() {
  return {
    disable: {
      null: ['codeIndented'],
    },
    flow: {
      [codes.leftCurlyBrace]: {
        name: types.blockTag,
        tokenize,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: types.blockTag,
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
      [types.blockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * Naive tokenizer only preoccupied with block tags without validating keywords
 * nor attempting to match opening tags with closing tags.
 *
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
    assert(code === codes.leftCurlyBrace, 'expected `{`');
    effects.enter(types.blockTag);
    effects.enter(types.marker);
    effects.consume(code);
    effects.exit(types.marker);
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
    effects.enter(types.blockTagMarker);
    effects.consume(code);
    effects.exit(types.blockTagMarker);
    return nameStart;
  }

  /** @type {State} */
  function nameStart(code) {
    if (code === codes.eof || !asciiAlpha(code)) {
      return nok;
    }
    effects.enter(types.blockTagName);
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
    effects.exit(types.blockTagName);
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
    effects.enter(types.blockTagValue);
    return factoryPlainExpression(effects, afterValue, nok)(code);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function afterValue(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(types.blockTagValue);
    return end(brace);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function end(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.enter(types.marker);
    effects.consume(brace);
    effects.exit(types.marker);
    effects.exit(types.blockTag);
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
