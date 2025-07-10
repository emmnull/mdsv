/** @import {Options} from 'mdast-util-from-markdown' */

import { tokens } from '@mdsv/constants';
import { paragraph, root } from 'mdast-builder';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdsv } from 'micromark-extension-mdsv';
import { deepEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { u } from 'unist-builder';
import { removePosition } from 'unist-util-remove-position';
import { mdsvFromMarkdown } from '../src/index.js';

/** @type {Options} */
export const options = {
  extensions: [mdsv()],
  mdastExtensions: [mdsvFromMarkdown()],
};

describe('mdast util supports mdsv expressions', () => {
  it('creates expression nodes', () => {
    const tree = fromMarkdown('{foo}', options);
    removePosition(tree, { force: true });
    deepEqual(tree, root([paragraph([u(tokens.textExpression, 'foo')])]));
  });

  it('serializes expressions', () => {});
});
