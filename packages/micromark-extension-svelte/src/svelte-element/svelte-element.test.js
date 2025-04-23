import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlSvelteElement, svelteElement } from './svelte-element.js';
import {
  htmlSvelteFlowElement,
  svelteFlowElement,
} from './svelte-flow-element.js';
import {
  htmlSvelteTextElement,
  svelteTextElement,
} from './svelte-text-element.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [svelteElement()],
  htmlExtensions: [htmlSvelteElement()],
  allowDangerousHtml: true,
};

/** @type {import('micromark-util-types').Options} */
const flowOptions = {
  extensions: [svelteFlowElement()],
  htmlExtensions: [htmlSvelteFlowElement()],
  allowDangerousHtml: true,
};

/** @type {import('micromark-util-types').Options} */
const textOptions = {
  extensions: [svelteTextElement()],
  htmlExtensions: [htmlSvelteTextElement()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes elements with svelte syntax in markdown', () => {
  // it('showcases the default behavior', () => {
  //   console.log(
  //     micromark('<FooBar>Hi mom</FooBar>', { allowDangerousHtml: true }),
  //   );
  //   console.log(micromark('<p>Hi mom</p>', { allowDangerousHtml: true }));
  //   console.log(
  //     micromark('<div>\n# Hi mom</div>', { allowDangerousHtml: true }),
  //   );
  // });

  it('tokenizes self-closing tags', () => {
    strictEqual(micromark('<FooBar />', options), '<FooBar />');
  });

  it('distinguishes flow and text content based on new lines', () => {
    strictEqual(
      micromark('<FooBar>Hi mom</FooBar>', options),
      '<FooBar>Hi mom</FooBar>',
    );

    strictEqual(
      micromark('<FooBar>**Hi mom**</FooBar>', options),
      '<FooBar><strong>Hi mom</strong></FooBar>',
    );

    strictEqual(
      micromark('<FooBar>\nHi mom\n</FooBar>', flowOptions),
      '<FooBar>\n<p>Hi mom\n</p></FooBar>',
    );

    // strictEqual(
    //   micromark('<FooBar>\n**Hi mom**\n</FooBar>', options),
    //   '<FooBar>\n<p><strong>Hi mom</strong>\n</p></FooBar>',
    // );
  });

  it.skip('tokenizes nested flow tags', () => {
    strictEqual(
      micromark('<Foo><Bar>Hi mom</Bar></Foo>', options),
      '<Foo>\n<Bar>\nHi mom</Bar></Foo>',
    );
  });
});
