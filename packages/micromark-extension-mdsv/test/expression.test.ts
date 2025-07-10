import { micromark } from 'micromark';
import type { Options } from 'micromark-util-types';
import { describe, expect, test } from 'vitest';
import { mdsvExpression, mdsvExpressionHtml } from '../src/lib/expression.js';

const options: Options = {
  extensions: [mdsvExpression()],
  htmlExtensions: [mdsvExpressionHtml()],
  allowDangerousHtml: true,
};

describe('tokenizes svelte {expression}s', () => {
  test('tokenizes simple inline expression', () => {
    expect(micromark('{foo}', options)).toBe('<p>{foo}</p>');
  });

  test('tokenizes expressions inside markdown flow', () => {
    expect(micromark('# {foo}', options)).toBe('<h1>{foo}</h1>');

    expect(micromark('- {foo}\n- A\n- B', options)).toBe(
      '<ul>\n<li>{foo}</li>\n<li>A</li>\n<li>B</li>\n</ul>',
    );
  });

  test('tokenizes expressions inside html tags', () => {
    expect(micromark('<li class="{foo}" {...attrs}>Test</li>', options)).toBe(
      '<li class="{foo}" {...attrs}>Test</li>',
    );
  });

  expect(micromark('<div class="a {b}" style={c} />', options)).toBe(
    '<div class="a {b}" style={c} />',
  );
});
