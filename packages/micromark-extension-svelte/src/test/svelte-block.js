import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlSvelteBlock, svelteBlock } from '../lib/svelte-block.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [svelteBlock()],
  htmlExtensions: [htmlSvelteBlock()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes svelte blocks in markdown', () => {
  it('tokenizes simple inline blocks', () => {
    strictEqual(
      micromark('Hello {#each [foo, bar] as baz}{baz}{/each}', options),
      '<p>Hello {#each [foo, bar] as baz}{baz}{/each}</p>',
    );
  });

  it('tokenizes simple inline blocks', () => {
    strictEqual(
      micromark('{#if foo}\nHello world\n{/if}', options),
      '{#if foo}\n<p>Hello world</p>\n{/if}',
    );
  });
});
