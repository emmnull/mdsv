/**
 * @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
 * @import {Options as ToMarkdownExtension, State} from 'mdast-util-to-markdown'
 */

/** @returns {FromMarkdownExtension} */
export function mdsvCustomFromMarkdown(options) {
  let metadata;

  return {
    enter: {},
    exit: {
      root(token) {
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
export function mdsvCustomToMarkdown(options) {
  return {
    handlers: {},
  };
}
