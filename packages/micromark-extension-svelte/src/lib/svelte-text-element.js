/** @import {Code, Construct, Extension, HtmlExtension, State, TokenizeContext, Tokenizer} from 'micromark-util-types' */

import { htmlVoidNames, types } from 'common/constants';
import { assert } from 'common/utils';
import { markdownLineEndingOrSpace } from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes } from 'micromark-util-symbol';
import { factoryElementMisc } from './utils/element-misc.js';
import { factoryTagAttributes } from './utils/element-tag-attributes.js';
import { tagNameChar, tagNameStartChar } from './utils/element-tag-name.js';

/** @returns {Extension} */
export function svelteTextElement() {
  return {
    disable: {
      null: ['htmlText', 'autolink'],
    },
    text: {
      [codes.lessThan]: {
        name: types.svelteText,
        tokenize: tokenizeSvelteTextElement,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteTextElement() {
  return {
    enter: {
      [types.svelteTextTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenizeSvelteTextElement(effects, ok, nok) {
  const self = this;
  const stack = this.svelteElementStack || (this.svelteElementStack = []);
  /** @type {string} */
  let name;
  /** @type {boolean} */
  let isClosingTag;
  /** @type {boolean} */
  let isRawTag;

  return start;

  /**
   * Start of HTML (text).
   *
   * ```markdown
   * > | a <b> c
   *       ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.enter(types.svelteText);
    effects.enter(types.svelteTextTag);
    effects.consume(code);
    return afterStart;
  }

  /**
   * After `<`, at tag name or other stuff.
   *
   * ```markdown
   * > | a <b> c
   *        ^
   * > | a <!doctype> c
   *        ^
   * > | a <!--b--> c
   *        ^
   * ```
   *
   * @type {State}
   */
  function afterStart(code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return factoryElementMisc.call(self, effects, end, nok);
    }
    if (code === codes.slash) {
      effects.consume(code);
      isClosingTag = true;
      return tagNameStart;
    }
    return tagNameStart(code);
  }

  /** @type {State} */
  function tagNameStart(code) {
    if (tagNameStartChar(code)) {
      effects.enter(types.svelteFlowTagName);
      effects.consume(code);
      name = String.fromCharCode(code);
      return tagName;
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return tagNameStart;
    }
    return nok(code);
  }

  /** @type {State} */
  function tagName(code) {
    if (tagNameChar(code)) {
      effects.consume(code);
      name += String.fromCharCode(code);
      return tagName;
    }
    effects.exit(types.svelteFlowTagName);
    isRawTag = htmlRawNames.includes(name);
    return afterTagName(code);
  }

  /** @type {State} */
  function afterTagName(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return afterTagName;
    }
    if (isClosingTag) {
      // closing tag, with slash before name
      return end(code);
    }
    if (code === codes.slash && !isClosingTag) {
      // self-closing tag, with slash after name
      isClosingTag = true;
      effects.consume(code);
      return end;
    }
    if (code === codes.greaterThan) {
      end(code);
    }
    return factoryTagAttributes(
      effects,
      maybeSelfClose,
      nok,
      types.svelteFlowTagAttribute,
    )(code);
  }

  /** @type {State} */
  function maybeSelfClose(code) {
    if (code === codes.slash) {
      isClosingTag = true;
      effects.consume(code);
      return end;
    }
    return end(code);
  }

  /** @type {State} */
  function end(code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteTextTag);
      isClosingTag ||= htmlVoidNames.includes(name);
      if (isClosingTag) {
        if (stack[stack.length - 1] === name) {
          effects.exit(types.svelteText);
          stack.pop();
        }
      }
      return ok(code);
    }
    return nok(code);
  }
}
