/**
 * @import {Extension, Transform} from 'mdast-util-from-markdown'
 * @import {RootData} from 'mdast';
 */

import { tokens } from '@mdsv/constants';

/**
 * @param {object} [options]
 * @returns {Extension}
 */
export function mdsvComponentsFromMarkdown(options) {
  return {
    transforms: [transform],
  };

  /** @type {Transform} */
  function transform(tree) {
    /** @type {NonNullable<RootData['metadata']>} */
    const meta = {};

    for (const node of tree.children) {
      if (
        node.type === tokens.flowElement ||
        node.type === tokens.textElement
      ) {
        console.log(node);
      }
    }

    if (Object.keys(meta).length) {
      if (!tree.data) {
        tree.data = {};
      }
      tree.data.metadata = meta;
    }
  }
}
