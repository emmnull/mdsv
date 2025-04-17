/** @import {Tokenizer, State, Code, Effects, Extension, HtmlExtension, TokenizeContext, Construct, Token, ConstructRecord} from 'micromark-util-types' */

import { types } from 'common/constants';

// Ensure distinct types are defined
import { assert } from 'common/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';

// NOTE: htmlBlockNames is not needed here. htmlRawNames might be if <script> etc. are disallowed inline.
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { createTagContent } from './tag-content.js';

// Likely not used/valid in text
import { createTagName } from './tag-name.js';

/** @returns {Extension} */
export function svelteTextElement() {
  return {
    disable: {
      null: ['htmlText', 'autolink'],
    },
    text: {
      [codes.lessThan]: {
        name: types.svelteTextElement,
        tokenize,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteTextElement() {
  return {
    exit: {
      [types.svelteElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      // Handler for content if needed
      [types.svelteTextElementContent](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * Tokenizer for Svelte Text Elements (Inline).
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  const self = this;
  let tagName;
  let isRawTag = false; // Keep check for disallowed inline tags like <script>

  // Helper to tokenize closing tag, can reuse the flow version
  // as it doesn't exit any specific context tokens.
  const tokenizeClosingTag = tokenizeChunkClosing;

  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.lessThan, 'expected "<"');
    // Enter tokens optimistically for the element and its opening tag part
    effects.enter(types.svelteTextElement);
    effects.enter(types.svelteTextElementTag); // Use distinct type name
    effects.consume(code);
    return openingTagStart;
  }

  /** @type {State} */
  function openingTagStart(code) {
    // Misc tags like <! > or closing tags </ > are invalid starts for text elements
    if (
      code === codes.exclamationMark ||
      code === codes.questionMark ||
      code === codes.slash
    ) {
      return nok(code); // Backtracking handled by Micromark if nok is returned early
    }
    if (asciiAlpha(code)) {
      effects.enter(types.svelteTextElementTagName); // Use distinct type name
      return createTagName(effects, openingTagNameEnd, nok)(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      // Allow whitespace like `< MyComp...` ? Typically not, but maybe `<   MyComp`
      // Let's stick to factorySpace for flexibility, though it might be too lenient.
      return factorySpace(effects, openingTagStart, coreTypes.whitespace)(code);
    }
    // If it's not alpha or space after '<', it's not a valid tag start here
    return nok(code);
  }

  /** @type {State} */
  function openingTagNameEnd(code) {
    const nameToken = effects.exit(types.svelteTextElementTagName);
    tagName = self.sliceSerialize(nameToken);
    isRawTag = htmlRawNames.includes(tagName); // Check if tag like <script> used inline

    if (!tagName) {
      return nok(code);
    } // Should be caught by createTagName

    // Disallow raw tags (like <script>) from being parsed as inline elements
    if (isRawTag) {
      return nok(code);
    }

    // Unlike flow, we don't check isBlockTag. Any non-raw tag is allowed syntactically.
    return createTagContent(effects, openingTagEnd, nok)(code);
  }

  /** @type {State} */
  function maybeSelfClose(code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteTextElementTag);
      effects.exit(types.svelteTextElement);
      return ok;
    }
    return nok(code);
  }

  /** @type {State} */
  function openingTagEnd(code) {
    // Called by createTagContent with '>' or '/'
    if (code === codes.slash) {
      effects.consume(code);
      return maybeSelfClose;
    }
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteTextElementTag); // Exit the opening tag part

      // Proceed to parse inline content
      return textContent;
    }
    return nok(code);
  }

  // --- Inline Content Parsing ---

  /** @type {State} */
  function textContent(code) {
    if (code === codes.eof) {
      // EOF before closing tag is an error for inline elements
      return nok(code);
    }
    if (code === codes.lessThan) {
      // Found '<', attempt to match the specific closing tag
      return effects.attempt(
        { partial: true, tokenize: tokenizeClosingTag }, // Reuses flow helper
        finishText, // If closing tag matches, finish.
        consumeTextContentChar, // If not, consume '<' as content.
      )(code);
    }
    // Consume regular characters as content
    return consumeTextContentChar(code);
  }

  /** @type {State} */
  function consumeTextContentChar(code) {
    // Mark content with a distinct token type or just 'data'
    effects.enter(types.svelteTextElementContent); // e.g., 'svelteTextElementContent'
    effects.consume(code);
    effects.exit(types.svelteTextElementContent);
    return textContent; // Continue consuming content
  }

  // --- Finalization ---

  /** @type {State} */
  function finishText(code) {
    // Reached after the closing tag is successfully consumed by the attempt
    effects.exit(types.svelteTextElement);
    return ok;
  }
}
