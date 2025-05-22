/**
 * @import {Options as FromMarkdownOptions} from 'mdast-util-from-markdown'
 * @import {Options as ToMarkdownOptions} from 'mdast-util-to-markdown'
 */

import { deepEqual } from 'assert';
import dedent from 'dedent';
import { heading, root, text } from 'mdast-builder';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdsv } from 'micromark-extension-mdsv';
import { describe, it } from 'node:test';
import { removePosition } from 'unist-util-remove-position';
import { mdsvFromMarkdown } from '../src/index.js';

/** @type {FromMarkdownOptions} */
const fromMarkdownOptions = {
  extensions: [mdsv()],
  mdastExtensions: [mdsvFromMarkdown()],
};

describe.skip('mdast util supports mdsv metadata', () => {
  it('parses front matter into metadata', () => {
    const tree = fromMarkdown(
      dedent`
			---
			foo: bar
			---
			
			# Hi mom
			`,
      fromMarkdownOptions,
    );
    removePosition(tree, { force: true });

    const target = {
      ...root([heading(1, text('Hi mom'))]),
      data: {
        meta: {
          foo: 'bar',
        },
      },
    };

    deepEqual(tree, target);
  });

  it.skip('detects and handles module scripts', () => {
    const tree = fromMarkdown(
      dedent`
  		<script module>
  			const foo = 'bar';
  		<script>

  		# Hi mom
  		`,
      fromMarkdownOptions,
    );
    removePosition(tree, { force: true });

    // console.log(tree);
  });

  it.skip('marks merges module script with metadata', () => {
    const tree = fromMarkdown(
      dedent`
  		---
  		foo: bar
  		---

  		<script module>
  			const foo = 'bar';
  		<script>

  		# Hi mom
  		`,
      fromMarkdownOptions,
    );
    removePosition(tree, { force: true });

    // console.log(tree);
  });

  it('serializes all metadata as module script', () => {});
});
