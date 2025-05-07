import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { mdsvBlock, mdsvBlockHtml } from '../lib/mdsv-block.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [mdsvBlock()],
  htmlExtensions: [mdsvBlockHtml()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes svelte blocks in markdown', () => {
  it('supports text blocks', () => {
    strictEqual(
      micromark('Hello {#if foo}bar{/if}', options),
      '<p>Hello {#if foo}bar{/if}</p>',
    );
    strictEqual(
      micromark('{#if foo}bar{/if}', options),
      '<p>{#if foo}bar{/if}</p>',
    );

    strictEqual(
      micromark('{#if foo}bar{/if} baz', options),
      '<p>{#if foo}bar{/if} baz</p>',
    );
  });

  it('suports flow blocks', () => {
    strictEqual(
      micromark('{#if foo}\nHello world\n{/if}', options),
      '{#if foo}\n<p>Hello world</p>\n{/if}',
    );
  });
});
