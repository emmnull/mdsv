/** @import {Tokenizer, State, Code, Effects, Token} from 'micromark-util-types'; */

import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';

/** @param {Code} code */
function isRegexFlag(code) {
  switch (code) {
    case codes.lowercaseD:
    case codes.lowercaseG:
    case codes.lowercaseI:
    case codes.lowercaseM:
    case codes.lowercaseS:
    case codes.lowercaseU:
    case codes.lowercaseV:
    case codes.lowercaseY:
      return true;
    default:
      return false;
  }
}

/** @param {Code} code */
function getClosingBracket(code) {
  switch (code) {
    case codes.leftCurlyBrace:
      return codes.rightCurlyBrace;
    case codes.leftParenthesis:
      return codes.rightParenthesis;
    case codes.leftSquareBracket:
      return codes.rightSquareBracket;
  }
}

/**
 * Creates consumer suite to handle contents of a svelte or js expression opened
 * by curly braces. To use **after** encountering and consuming an
 * expression-opening brace. See calling tokenizer for ok and nok state
 * details.
 *
 * @param {Parameters<Tokenizer>[0]} effects - Micromark effects context.
 * @param {(brace: typeof codes.rightCurlyBrace) => State | undefined} ok -
 *   State to transition to after reaching closing brace.
 * @param {State} nok - State to transition to on error.
 * @returns {State} - The initial state function for the expression consumer.
 */
export function createPlainExpression(effects, ok, nok) {
  const brackets = /** @type {NonNullable<Code>[]} */ ([]);
  const regexBrackets = /** @type {NonNullable<Code>[]} */ ([]);

  return plainExpression;

  /** @type {State} */
  function plainExpression(code) {
    if (code === codes.rightCurlyBrace) {
      return ok(code);
    }
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.quotationMark || code === codes.apostrophe) {
      effects.consume(code);
      return createStringConsumer(code);
    }
    if (code === codes.graveAccent) {
      effects.consume(code);
      return consumeTemplateLiteral;
    }
    if (code === codes.slash) {
      effects.consume(code);
      return consumePossibleCommentOrRegex;
    }
    if (
      code === codes.leftCurlyBrace ||
      code === codes.leftParenthesis ||
      code === codes.leftSquareBracket
    ) {
      brackets.push(code);
      effects.consume(code);
      return plainExpression;
    }
    if (
      code === codes.rightCurlyBrace ||
      code === codes.rightParenthesis ||
      code === codes.rightSquareBracket
    ) {
      if (brackets.length > 0) {
        if (code === getClosingBracket(brackets[brackets.length - 1])) {
          brackets.pop();
        } else {
          return nok;
        }
      }
    }
    effects.consume(code);
    return plainExpression;
  }

  /** @param {NonNullable<Code>} quote */
  function createStringConsumer(quote) {
    /** @type {State} */
    function consumeString(code) {
      if (code === codes.eof) {
        return nok;
      }
      if (code === codes.backslash) {
        effects.consume(code);
        return consumeStringEscape;
      }
      if (code === quote) {
        effects.consume(code);
        return plainExpression;
      }
      effects.consume(code);
      return consumeString;
    }
    /** @type {State} */
    function consumeStringEscape(code) {
      if (code === codes.eof) {
        return nok;
      }
      effects.consume(code);
      return consumeString;
    }
    return consumeString;
  }

  /** @type {State} */
  function consumePossibleCommentOrRegex(code) {
    if (code === codes.slash) {
      effects.consume(code);
      return consumeSingleLineComment;
    }
    if (code === codes.asterisk) {
      effects.consume(code);
      return consumeMultiLineComment;
    }
    regexBrackets.length = 0;
    return consumeRegexBody(code);
  }

  /** @type {State} */
  function consumeSingleLineComment(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return plainExpression;
    }
    effects.consume(code);
    return consumeSingleLineComment;
  }

  /** @type {State} */
  function consumeMultiLineComment(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.asterisk) {
      effects.consume(code);
      return consumeMultiLineCommentPossibleEnd;
    }
    effects.consume(code);
    return consumeMultiLineComment;
  }

  /** @type {State} */
  function consumeMultiLineCommentPossibleEnd(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.slash) {
      effects.consume(code);
      return plainExpression;
    }
    return consumeMultiLineComment(code);
  }

  /** @type {State} */
  function consumeRegexBody(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return nok;
    }
    if (code === codes.backslash) {
      effects.consume(code);
      return consumeRegexEscape;
    }
    if (code === codes.leftSquareBracket) {
      regexBrackets.push(code);
      effects.consume(code);
      return consumeRegexBody;
    }
    if (code === codes.rightSquareBracket && regexBrackets.length > 0) {
      regexBrackets.pop();
      effects.consume(code);
      return consumeRegexBody;
    }
    if (code === codes.slash && !regexBrackets.length) {
      effects.consume(code);
      return consumeRegexFlags;
    }
    effects.consume(code);
    return consumeRegexBody;
  }

  /** @type {State} */
  function consumeRegexEscape(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return nok;
    }
    effects.consume(code);
    return consumeRegexBody;
  }

  /** @type {State} */
  function consumeRegexFlags(code) {
    if (isRegexFlag(code)) {
      effects.consume(code);
      return consumeRegexFlags;
    }
    return plainExpression;
  }

  /** @type {State} */
  function consumeTemplateLiteral(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.graveAccent) {
      effects.consume(code);
      return plainExpression;
    }
    if (code === codes.backslash) {
      effects.consume(code);
      return consumeTemplateLiteralEscape;
    }
    if (code === codes.dollarSign) {
      effects.consume(code);
      return consumeTemplateLiteralPossibleExpression;
    }
    effects.consume(code);
    return consumeTemplateLiteral;
  }

  /** @type {State} */
  function consumeTemplateLiteralEscape(code) {
    if (code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return consumeTemplateLiteral;
  }

  /** @type {State} */
  function consumeTemplateLiteralPossibleExpression(code) {
    if (code === codes.leftCurlyBrace) {
      brackets.push(code);
      effects.consume(code);
      return plainExpression;
    }
    return consumeTemplateLiteral(code);
  }
}
