import { factorySpace } from 'micromark-factory-space';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import type { Code, Effects, State } from 'micromark-util-types';

function isRegexFlag(code: Code) {
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

function getClosingBracket(code: Code) {
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
 * Consume contents of a svelte or js expression to be terminated by a closing
 * curly brace.
 *
 * Use **after** encountering and consuming an expression-opening marker
 * (typically `{` or `${` depending on the semantic context). See calling
 * tokenizer for ok and nok state details.
 *
 * ```markdown
 * > | {...}
 *      ^^^
 * ```
 */
export function factoryExpression(
  effects: Effects,
  ok: State,
  nok: State,
  closing: Code,
) {
  const brackets: (
    | typeof codes.leftCurlyBrace
    | typeof codes.leftParenthesis
    | typeof codes.leftSquareBracket
  )[] = [];
  const regexBrackets: (
    | typeof codes.leftCurlyBrace
    | typeof codes.leftParenthesis
    | typeof codes.leftSquareBracket
  )[] = [];

  return start;

  function start(code: Code) {
    if (code === closing) {
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
      return start;
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
    if (markdownSpace(code)) {
      return factorySpace(effects, start, coreTypes.whitespace)(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.enter(coreTypes.whitespace);
      effects.consume(code);
      effects.exit(coreTypes.whitespace);
      return start;
    }
    effects.consume(code);
    return start;
  }

  function createStringConsumer(quote: NonNullable<Code>) {
    function consumeString(code: Code) {
      if (code === codes.eof) {
        return nok;
      }
      if (code === codes.backslash) {
        effects.consume(code);
        return consumeStringEscape;
      }
      if (code === quote) {
        effects.consume(code);
        return start;
      }
      effects.consume(code);
      return consumeString;
    }

    function consumeStringEscape(code: Code) {
      if (code === codes.eof) {
        return nok;
      }
      effects.consume(code);
      return consumeString;
    }
    return consumeString;
  }

  function consumePossibleCommentOrRegex(code: Code) {
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

  function consumeSingleLineComment(code: Code) {
    if (code === codes.eof) {
      return nok;
    }
    if (markdownLineEnding(code)) {
      effects.enter(coreTypes.whitespace);
      effects.consume(code);
      effects.exit(coreTypes.whitespace);
      return start;
    }
    effects.consume(code);
    return consumeSingleLineComment;
  }

  function consumeMultiLineComment(code: Code): State {
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

  function consumeMultiLineCommentPossibleEnd(code: Code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.slash) {
      effects.consume(code);
      return start;
    }
    return consumeMultiLineComment(code);
  }

  function consumeRegexBody(code: Code) {
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

  function consumeRegexEscape(code: Code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return nok;
    }
    effects.consume(code);
    return consumeRegexBody;
  }

  function consumeRegexFlags(code: Code) {
    if (isRegexFlag(code)) {
      effects.consume(code);
      return consumeRegexFlags;
    }
    return start;
  }

  function consumeTemplateLiteral(code: Code): State {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.graveAccent) {
      effects.consume(code);
      return start;
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

  function consumeTemplateLiteralEscape(code: Code) {
    if (code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return consumeTemplateLiteral;
  }

  function consumeTemplateLiteralPossibleExpression(code: Code) {
    if (code === codes.leftCurlyBrace) {
      brackets.push(code);
      effects.consume(code);
      return start;
    }
    return consumeTemplateLiteral(code);
  }
}
