/**
 * @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
 * @import {Options as ToMarkdownExtension, State} from 'mdast-util-to-markdown'
 */

import { frontmatter_parsers, frontmatter_types, types } from '@mdsv/constants';

/** @returns {FromMarkdownExtension} */
export function svelteFromMarkdown() {
  /** Parsed front matter. */
  let metadata;

  return {
    enter: {
      [types.root](token) {
        console.log('enter root');
      },
      [types.svelteExpression](token) {
        this.enter({ type: types.svelteExpression, value: '' }, token);
      },
      [types.svelteElement](token) {
        this.enter({ type: types.svelteElement, value: '' }, token);
      },
      // Frontmatter
      ...Object.fromEntries(
        Object.keys(frontmatter_types).map((format) => {
          return [
            format,
            /** @type {State} */
            function () {
              this.buffer();
            },
          ];
        }),
      ),
    },
    exit: {
      [types.svelteExpression](token) {
        const value = this.sliceSerialize(token);
        const node = this.stack[this.stack.length - 1];
        node.value = value;
        this.exit(token);
      },
      [types.svelteElement](token) {
        const value = this.sliceSerialize(token);
        const node = this.stack[this.stack.length - 1];
        node.value = value;
        this.exit(token);
      },
      // Frontmatter
      ...Object.fromEntries(
        Object.keys(frontmatter_types).map((format) => [
          format,
          /** @type {State} */
          function (token) {
            metadata = frontmatter_parsers[
              /** @type {keyof typeof frontmatter_parsers} */ (format)
            ](this.resume());
          },
        ]),
      ),
      [types.root](token) {
        console.log('exit root');
        // to do:
        // - get toc
        // - inject script module with toc and metadata
        // - inject script with metadata
        // - replace element with custom components
      },
    },
  };
}

/** @returns {ToMarkdownExtension} */
export function svelteToMarkdown() {
  return {
    handlers: {
      [types.svelteExpression](node) {
        return node.value;
      },
    },
  };
}

// /**
//  * @param {string} content
//  * @param {string} tag
//  * @param {...(string | [string, unknown])} attributes
//  */
// function wrap(content, tag, ...attributes) {
//   const attrs = attributes
//     ? attributes
//         .map((a) => {
//           if (Array.isArray(a)) {
//             if (a[1] == null) {
//               return a;
//             }
//             return a.join('=');
//           }
//           return a;
//         })
//         .join(' ')
//     : '';
//   return `<${[tag, ...attributes].join(' ')}>\n${content}\n</${tag}>`;
// }
