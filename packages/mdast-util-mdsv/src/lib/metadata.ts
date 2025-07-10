/**
 * @import {Options as FrontmatterOptions} from 'micromark-extension-frontmatter'
 * @import {Extension, Transform, Handle as FromMarkdown} from 'mdast-util-from-markdown'
 * @import {RootContent, RootData} from 'mdast';
 * @import {Options} from 'mdast-util-to-markdown';
 */

import { nodes, tokens } from '@mdsv/constants';
import { toMatters } from 'micromark-extension-frontmatter';
import { parse as toml } from 'toml';
import { parse as yaml } from 'yaml';

/** @param {RootContent} node */
function moduleScript(node) {
  return node.type === tokens.flowElement || node.type === tokens.textElement;
}

/**
 * Preserve primitives as is.
 *
 * @param {unknown} datum
 */
function parseMetadatum(datum) {
  if (
    typeof datum === 'string' ||
    typeof datum === 'number' ||
    typeof datum === 'boolean' ||
    typeof datum === 'undefined' ||
    datum === null
  ) {
    return datum;
  }
  return JSON.stringify(datum, undefined, 2);
}

/**
 * @param {object} [options]
 * @param {Record<string, (input: string) => unknown>} [options.parsers]
 * @param {FrontmatterOptions | null | undefined} [options.frontmatter]
 * @returns {Extension}
 */
export function mdsvMetadataFromMarkdown(options) {
  const matters = toMatters(options?.frontmatter);
  const formats = matters.map((m) => m.type);
  /** @type {NonNullable<NonNullable<typeof options>['parsers']>} */
  const parsers = {
    yaml,
    toml,
    json: JSON.parse,
    ...options?.parsers,
  };

  return {
    enter: {
      yaml: enterFrontmatter,
    },
    transforms: [transform],
  };

  /** @type {FromMarkdown} */
  function enterFrontmatter(token) {
    console.log(token);
  }

  /** @type {Transform} */
  function transform(tree) {
    if (!tree.data?.metadata) {
      return;
    }
    if (!Object.keys(tree.data.metadata).length) {
      delete tree.data.metadata;
      return;
    }
    const node =
      tree.children.find(moduleScript) ??
      (tree.children.unshift({
        type: nodes.flowRaw,
        name: 'script',
        attributes: ['module'],
        value: JSON.stringify(tree.data.metadata),
      }),
      tree.children[0]);
    const raw = Object.entries(tree.data.metadata).map(
      ([k, v]) => `export const ${k} = ${parseMetadatum(v)};\n`,
    );
  }
}

// /** @returns {Options} */
// export function mdsvMetaToMarkdown(options) {
//   return {
// 		handlers: {},
// 		fences: true,
// 		resourceLink: true,
//     unsafe: [
//       { character: '<', inConstruct: ['phrasing'] },
//       { atBreak: true, character: '>' },
//     ],
//   };
// }
