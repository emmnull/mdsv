import { micromark } from 'micromark';
import type { Options } from 'micromark-util-types';
import { describe, expect, test } from 'vitest';
import { mdsvTag, mdsvTagHtml } from '../src/lib/tag.js';

const options: Options = {
  extensions: [mdsvTag()],
  htmlExtensions: [mdsvTagHtml()],
  allowDangerousHtml: true,
};

describe('tokenizes svelte {@tag}s', () => {
  test('tokenizes tags in text', () => {
    expect(micromark('Hello {@render foo()} world', options)).toBe(
      '<p>Hello {@render foo()} world</p>',
    );
  });

  test('tokenizes tags in flow', () => {
    expect(micromark('{@render foo()}', options)).toBe('{@render foo()}');
  });

  test('tokenizes tags inside markdown flow', () => {
    expect(micromark('# {@html foo}', options)).toBe('<h1>{@html foo}</h1>');

    expect(micromark('- {@html foo}\n- A\n- B', options)).toBe(
      '<ul>\n<li>{@html foo}\n</li>\n<li>A</li>\n<li>B</li>\n</ul>',
    );
  });
});
