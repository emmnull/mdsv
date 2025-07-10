import { micromark } from 'micromark';
import type { Options } from 'micromark-util-types';
import { describe, expect, test } from 'vitest';
import { mdsv, mdsvHtml } from '../src/index.js';

const options: Options = {
  extensions: [mdsv()],
  htmlExtensions: [mdsvHtml()],
  allowDangerousHtml: true,
};

describe.skip('mdsv extension supports all svelte syntax in markdown', () => {
  test('should not tokenize svelte syntax without the extensions', () => {
    expect(micromark('# {foo}', { allowDangerousHtml: true })).toBe(
      '<h1>{foo}</h1>',
    );
  });

  test('tokenizes svelte expression syntax', () => {
    expect(micromark('{foo}', options)).toBe('<p>{foo}</p>');
    expect(micromark('# {foo}', options)).toBe('<h1>{foo}</h1>');
  });

  test('tokenizes svelte block syntax', () => {
    expect(
      micromark('{#each [mom, dad] as parent}\nHi {parent}!\n{/each}', options),
    ).toBe('{#each [mom, dad] as parent}\n<p>Hi {parent}!</p>\n{/each}');
  });

  test('tokenizes svelte branch syntax', () => {
    expect(micromark('foo\n{:else}\nbar', options)).toBe(
      '<p>foo</p>\n{:else}\n<p>bar</p>',
    );
  });

  test('tokenizes svelte tag syntax', () => {
    expect(micromark('{@render foo()}', options)).toBe('{@render foo()}');
  });

  test('tokenizes svelte elements and components syntax', () => {
    expect(
      micromark(
        '<MyComponent {...props}>\nHello world!\n</MyComponent>',
        options,
      ),
    ).toBe('<MyComponent {...props}>\nHello world!\n</MyComponent>');
  });
});
