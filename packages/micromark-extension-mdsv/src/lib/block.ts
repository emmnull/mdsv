import { tokens } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import type {
  Code,
  Extension,
  HtmlExtension,
  Tokenizer,
} from 'micromark-util-types';
import { factoryBlockTag } from './utils/factory-block-tag.js';

/**
 * Basic syntax for lax support of svelte block tags (`{#open}`, `{:branch}`,
 * `{/close}`). Does not validate block keywords.
 */
export function mdsvBlock(): Extension {
  return {
    disable: {
      null: ['codeIndented'],
    },
    flow: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.flowBlock,
        tokenize: tokenizeBlockFlow,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.textBlock,
        tokenize: tokenizeBlockText,
      },
    },
  };
}

export function mdsvBlockHtml(): HtmlExtension {
  return {
    exit: {
      [tokens.flowBlockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [tokens.textBlockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

const tokenizeBlockFlow: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | {#
   *     ^
   * > | {:
   *     ^
   * > | {/
   *     ^
   * ```
   */
  function start(code: Code) {
    return factoryBlockTag(
      effects,
      endAfter,
      nok,
      tokens.flowBlockTag,
      tokens.marker,
      tokens.blockTagValue,
      tokens.blockTagSymbol,
      tokens.blockTagName,
      tokens.blockTagExpression,
    )(code);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
   * ```
   */
  function endAfter(code: Code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, endAfter, coreTypes.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      return ok(code);
    }
    return nok(code);
  }
};

const tokenizeBlockText: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | {#...}
   *     ^
   * > | {:...}
   *     ^
   * > | {/...}
   *     ^
   * ```
   */
  function start(code: Code) {
    return factoryBlockTag(
      effects,
      ok,
      nok,
      tokens.textBlockTag,
      tokens.marker,
      tokens.blockTagValue,
      tokens.blockTagSymbol,
      tokens.blockTagName,
      tokens.blockTagExpression,
    )(code);
  }
};
