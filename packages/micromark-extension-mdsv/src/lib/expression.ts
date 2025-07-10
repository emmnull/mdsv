import { tokens } from '@mdsv/constants';
import { ok as assert } from 'devlop';
import { codes } from 'micromark-util-symbol';
import type {
  Code,
  Extension,
  HtmlExtension,
  Tokenizer,
} from 'micromark-util-types';
import { factoryExpression } from './utils/factory-expression.js';

export function mdsvExpression(): Extension {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.textExpression,
        tokenize: tokenizeExpressionText,
      },
    },
  };
}

export function mdsvExpressionHtml(): HtmlExtension {
  return {
    exit: {
      [tokens.textExpression](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

const tokenizeExpressionText: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   */
  function start(code: Code) {
    assert(code === codes.leftCurlyBrace, 'expected `{`');
    effects.enter(tokens.textExpression);
    effects.enter(tokens.marker);
    effects.consume(code);
    effects.exit(tokens.marker);
    return noTag;
  }

  /**
   * ```markdown
   *  > | {
   *       ^
   * ```
   */
  function noTag(code: Code) {
    // bail out on tags and block tags
    if (
      code === codes.atSign ||
      code === codes.numberSign ||
      code === codes.colon
    ) {
      return nok(code);
    }
    effects.enter(tokens.expressionValue);
    return factoryExpression(effects, end, nok, codes.rightCurlyBrace)(code);
  }

  /**
   * ```markdown
   *  > | {...}
   *          ^
   * ```
   */
  function end(code: Code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(tokens.expressionValue);
    effects.enter(tokens.marker);
    effects.consume(code);
    effects.exit(tokens.marker);
    effects.exit(tokens.textExpression);
    return ok(code);
  }
};
