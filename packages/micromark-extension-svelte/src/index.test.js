import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlSvelte, svelte } from './index.js';

describe.skip('micromark extension tokenizes svelte syntax in markdown', () => {
  /** @type {import('micromark-util-types').Options} */
  const options = {
    extensions: [svelte()],
    htmlExtensions: [htmlSvelte()],
    allowDangerousHtml: true,
  };

  it('should not tokenize svelte syntax without the extensions', () => {
    strictEqual(micromark('{foo}', { allowDangerousHtml: true }), '');
    strictEqual(
      micromark('# {foo}', { allowDangerousHtml: true }),
      '<h1></h1>',
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
    strictEqual(micromark('foo\n{:else}\nbar', options), 'foo\n{:else}\nbar');
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
