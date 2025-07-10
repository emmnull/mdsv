/** @import {Options} from 'mdast-util-from-markdown' */

import { nodes } from '@mdsv/constants';
import dedent from 'dedent';
import { paragraph, root, text } from 'mdast-builder';
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

describe('mdast util supports mdsv tags', () => {
  it('creates tag nodes', () => {
    const tree = fromMarkdown(
      dedent`
			{@foo}
			{@foo bar()}
			with leading text {@foo}

			{@foo} with trailing text
			`,
      options,
    );
    removePosition(tree, { force: true });
    deepEqual(
      tree,
      root([
        u(nodes.flowTag, 'foo'),
        u(nodes.flowTag, 'foo bar()'),
        paragraph([text('with leading text '), u(nodes.textTag, 'foo')]),
        paragraph([u(nodes.textTag, 'foo'), text(' with trailing text')]),
      ]),
    );
  });
});
