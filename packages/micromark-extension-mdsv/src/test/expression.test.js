import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlMdsvExpression, mdsvExpression } from '../lib/mdsv-expression.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [mdsvExpression()],
  htmlExtensions: [htmlMdsvExpression()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes svelte expressions in markdown', () => {
  it('tokenizes simple inline expression', () => {
    strictEqual(micromark('{foo}', options), '<p>{foo}</p>');
  });

  it('tokenizes expressions inside markdown flow', () => {
    strictEqual(micromark('# {foo}', options), '<h1>{foo}</h1>');
    strictEqual(
      micromark('- {foo}\n- A\n- B', options),
      '<ul>\n<li>{foo}</li>\n<li>A</li>\n<li>B</li>\n</ul>',
    );
  });

  it('tokenizes expressions inside html tags', () => {
    strictEqual(
      micromark('<li class="{foo}" {...attrs}>Test</li>', options),
      '<li class="{foo}" {...attrs}>Test</li>',
    );
  });
});
