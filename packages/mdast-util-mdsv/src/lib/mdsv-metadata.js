/**
 * @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
 * @import {Options as ToMarkdownExtension, State} from 'mdast-util-to-markdown'
 */

import { parse as toml } from 'toml';
import { parse as yaml } from 'yaml';

const parsers = {
  yaml,
  toml,
  json: JSON.parse,
};

/**
 * @param {object} options
 * @param {any} options.formats
 * @returns {FromMarkdownExtension}
 */
export function mdsvMetadataFromMarkdown(options) {
  let metadata;

  return {
    enter: {
      // Frontmatter
      ...Object.fromEntries(
        Object.keys(formats).map((format) => {
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
    // exit: {
    //   // Frontmatter
    //   ...Object.fromEntries(
    //     Object.keys(frontmatter_types).map((format) => [
    //       format,
    //       /** @type {State} */
    //       function (token) {
    //         metadata = frontmatter_parsers[
    //           /** @type {keyof typeof frontmatter_parsers} */ (format)
    //         ](this.resume());
    //       },
    //     ]),
    //   ),
    // },
  };
}

/** @returns {ToMarkdownExtension} */
export function mdsvMetadataToMarkdown(options) {
  return {
    handlers: {},
  };
}
