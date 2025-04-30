import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlSvelteTag, svelteTag } from '../lib/svelte-tag.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [svelteTag()],
  htmlExtensions: [htmlSvelteTag()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes svelte tags in markdown', () => {
  it('tokenizes tags in text', () => {
    strictEqual(
      micromark('Hello {@render foo()} world', options),
      '<p>Hello {@render foo()} world</p>',
    );
  });

  it('tokenizes tags in flow', () => {
    strictEqual(micromark('{@render foo()}', options), '{@render foo()}');
  });

  it('tokenizes tags inside markdown flow', () => {
    strictEqual(micromark('# {@html foo}', options), '<h1>{@html foo}</h1>');
    strictEqual(
      micromark('- {@html foo}\n- A\n- B', options),
      '<ul>\n<li>{@html foo}\n</li>\n<li>A</li>\n<li>B</li>\n</ul>',
    );
  });
});
