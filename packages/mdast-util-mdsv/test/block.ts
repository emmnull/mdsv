/** @import {Options} from 'mdast-util-from-markdown' */

import { nodes } from '@mdsv/constants';
import dedent from 'dedent';
import { heading, paragraph, root, strong, text } from 'mdast-builder';
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

describe('mdast util supports mdsv blocks', () => {
  it('creates block nodes', () => {
    const tree = fromMarkdown(
      dedent`
			{#if foo}
			
			# Foo
			
			{/if}
			`,
      options,
    );
    removePosition(tree, { force: true });
    deepEqual(
      tree,
      root([
        u(
          nodes.flowBlock,
          {
            name: 'if',
            expression: 'foo',
          },
          [heading(1, [text('Foo')])],
        ),
      ]),
    );
  });

  it('handles block branching', () => {
    const tree = fromMarkdown(
      dedent`
			{#if foo}

				# Foo

			{:else if bar}

				# Bar
			
			{/if}
			`,
      options,
    );
    removePosition(tree, { force: true });
    deepEqual(
      tree,
      root([
        u(
          nodes.flowBlock,
          {
            name: 'if',
            expression: 'foo',
          },
          [
            heading(1, [text('Foo')]),
            u(
              nodes.flowBlock,
              {
                name: 'else',
                expression: 'if bar',
                branch: true,
              },
              [heading(1, [text('Bar')])],
            ),
          ],
        ),
      ]),
    );
  });

  it('supports nested blocks', () => {
    const tree = fromMarkdown(
      dedent`
			{#if foo}

				# Foo

			{:else if bar}

				# Bar

			{:else}

				{#each ['pizza', 'poutine', 'tiramisu', 'cortado'] as life}
					**{life}**
				{/each}
			
			{/if}
			`,
      options,
    );
    removePosition(tree, { force: true });
    deepEqual(
      tree,
      root([
        u(
          nodes.flowBlock,
          {
            name: 'if',
            expression: 'foo',
          },
          [
            heading(1, [text('Foo')]),
            u(
              nodes.flowBlock,
              {
                name: 'else',
                expression: 'if bar',
                branch: true,
              },
              [heading(1, [text('Bar')])],
            ),
            u(nodes.flowBlock, { name: 'else', branch: true }, [
              u(
                nodes.flowBlock,
                {
                  name: 'each',
                  expression:
                    "['pizza', 'poutine', 'tiramisu', 'cortado'] as life",
                },
                [paragraph([strong([u(nodes.textExpression, 'life')])])],
              ),
            ]),
          ],
        ),
      ]),
    );
  });
});
