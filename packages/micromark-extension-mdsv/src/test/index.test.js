import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { mdsv, mdsvHtml } from '../index.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [mdsv()],
  htmlExtensions: [mdsvHtml()],
  allowDangerousHtml: true,
};

describe('mdsv extension supports all svelte syntax in markdown', () => {
  it('should not tokenize svelte syntax without the extensions', () => {
    strictEqual(
      micromark('# {foo}', { allowDangerousHtml: true }),
      '<h1>{foo}</h1>',
    );
  });

  it('tokenizes svelte expression syntax', () => {
    strictEqual(micromark('{foo}', options), '<p>{foo}</p>');
    strictEqual(micromark('# {foo}', options), '<h1>{foo}</h1>');
  });

  it('tokenizes svelte block syntax', () => {
    strictEqual(
      micromark('{#each [mom, dad] as parent}\nHi {parent}!\n{/each}', options),
      '{#each [mom, dad] as parent}\n<p>Hi {parent}!</p>\n{/each}',
    );
  });

  it('tokenizes svelte branch syntax', () => {
    strictEqual(
      micromark('foo\n{:else}\nbar', options),
      '<p>foo</p>\n{:else}\n<p>bar</p>',
    );
  });

  it('tokenizes svelte tag syntax', () => {
    strictEqual(micromark('{@render foo()}', options), '{@render foo()}');
  });

  it('tokenizes svelte elements and components syntax', () => {
    strictEqual(
      micromark(
        '<MyComponent {...props}>\nHello world!\n</MyComponent>',
        options,
      ),
      '<MyComponent {...props}>\nHello world!\n</MyComponent>',
    );
  });
});
