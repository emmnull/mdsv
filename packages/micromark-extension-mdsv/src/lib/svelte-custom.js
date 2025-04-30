//
//
//
// To do:
// Move into svelte-element extension
//
//
//

/** @import {Extension, HtmlExtension, Token} from 'micromark-util-types' */
import { types as coreTypes } from 'micromark-util-symbol';

const prefixableCoreTags = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'li',
  'blockquote' /* Add more as needed */,
]);
const prefix = 'components.';

/** @returns {HtmlExtension} */
export function prefixCoreHtmlTags() {
  return {
    exit: {
      [coreTypes.atxHeading](token) {
        const tagName = `h${token.depth}`;
        if (prefixableCoreTags.has(tagName)) {
          const originalTag = this.sliceSerialize(token);
          const parts = originalTag.match(/^<(\/?)(h\d)(.*)>$/);
          if (parts) {
            const [match, slash, , rest] = parts;
            this.raw(`<${slash}${prefix}${tagName}${rest}>`);
          } else {
            this.raw(originalTag);
          }
        } else {
          this.raw(this.sliceSerialize(token));
        }
      },
      [coreTypes.paragraph](token) {
        if (prefixableCoreTags.has('p')) {
          const originalTag = this.sliceSerialize(token);
          const parts = originalTag.match(/^<(\/?)(p)(.*)>$/);
          if (parts) {
            const [match, slash, tagName, rest] = parts;
            this.raw(`<${slash}${prefix}${tagName}${rest}>`);
          } else {
            this.raw(originalTag);
          }
        } else {
          this.raw(this.sliceSerialize(token));
        }
      },
      [coreTypes.listItem](token) {
        if (prefixableCoreTags.has('li')) {
          const originalTag = this.sliceSerialize(token);
          const parts = originalTag.match(/^<(\/?)(li)(.*)>$/);
          if (parts) {
            const [match, slash, tagName, rest] = parts;
            this.raw(`<${slash}${prefix}${tagName}${rest}>`);
          } else {
            this.raw(originalTag);
          }
        } else {
          this.raw(this.sliceSerialize(token));
        }
      },
      // Add exit handlers for other core token types as needed (e.g., blockQuote)
    },
  };
}
