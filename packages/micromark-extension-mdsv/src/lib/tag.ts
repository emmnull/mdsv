import { tokens } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types } from 'micromark-util-symbol';
import type {
  Code,
  Extension,
  HtmlExtension,
  Tokenizer,
} from 'micromark-util-types';
import { factoryTag } from './utils/factory-tag.js';

export function mdsvTag(): Extension {
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: tokens.flowTag,
        tokenize: tokenizeTagFlow,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: tokens.textTag,
        tokenize: tokenizeTagText,
        concrete: true,
      },
    },
  };
}

export function mdsvTagHtml(): HtmlExtension {
  return {
    exit: {
      [tokens.flowTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [tokens.textTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

const tokenizeTagFlow: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   */
  function start(code: Code) {
    return factoryTag(
      effects,
      endAfter,
      nok,
      tokens.flowTag,
      tokens.marker,
      tokens.tagValue,
      tokens.tagSymbol,
      tokens.tagKeyword,
      tokens.tagExpression,
    )(code);
  }

  function endAfter(code: Code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, endAfter, types.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      return ok(code);
    }
    return nok(code);
  }
};

const tokenizeTagText: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   */
  function start(code: Code) {
    return factoryTag(
      effects,
      ok,
      nok,
      tokens.textTag,
      tokens.marker,
      tokens.tagValue,
      tokens.tagSymbol,
      tokens.tagKeyword,
      tokens.tagExpression,
    )(code);
  }
};
