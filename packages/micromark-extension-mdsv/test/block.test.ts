import { micromark } from 'micromark';
import { Options } from 'micromark-util-types';
import { strictEqual } from 'node:assert';
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
    strictEqual(
      micromark('{#if foo}bar{/if}', options),
      '<p>{#if foo}bar{/if}</p>',
    );

    strictEqual(
      micromark('{#if foo}bar{/if} baz', options),
      '<p>{#if foo}bar{/if} baz</p>',
    );
  });
});

//   it('suports flow blocks', () => {
//     strictEqual(
//       micromark(
//         dedent`
// 				{#if foo}
// 					Hello world
// 				{/if}`,
//         options,
//       ),
//       dedent`
// 			{#if foo}
// 			<p>Hello world</p>
// 			{/if}`,
//     );
//   });
// });
