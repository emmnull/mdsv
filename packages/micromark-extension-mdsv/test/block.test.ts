import { micromark } from 'micromark';
import type { Options } from 'micromark-util-types';
import { describe, expect, test } from 'vitest';
import { mdsvBlock, mdsvBlockHtml } from '../src/lib/block.js';

const options: Options = {
  extensions: [mdsvBlock()],
  htmlExtensions: [mdsvBlockHtml()],
  allowDangerousHtml: true,
};

describe('block tokenization', () => {
  test('text blocks', () => {
    expect(micromark('Hello {#if foo}bar{/if}', options)).toBe(
      '<p>Hello {#if foo}bar{/if}</p>',
    );

    expect(micromark('{#if foo}bar{/if}', options)).toBe(
      '<p>{#if foo}bar{/if}</p>',
    );

    expect(micromark('{#if foo}bar{/if} baz', options)).toBe(
      '<p>{#if foo}bar{/if} baz</p>',
    );
  });
});
