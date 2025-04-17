import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { htmlSvelteElement, svelteElement } from './svelte-element.js';

/** @type {import('micromark-util-types').Options} */
const options = {
  extensions: [svelteElement()],
  htmlExtensions: [htmlSvelteElement()],
  allowDangerousHtml: true,
};

describe('micromark extension tokenizes elements with svelte syntax in markdown', () => {
  // it('showcases the default behavior', () => {
  //   console.log(
  //     micromark('<FooBar>Hi mom</FooBar>', { allowDangerousHtml: true }),
  //   );
  //   console.log(micromark('<p>Hi mom</p>', { allowDangerousHtml: true }));
  // });

  it('tokenizes self-closing tags', () => {
    strictEqual(micromark('<FooBar />', options), '<FooBar />');
  });

  it('tokenizes flow tags with content', () => {
    strictEqual(
      micromark('<FooBar>Hi mom</FooBar>', options),
      '<FooBar>Hi mom</FooBar>',
    );
    //   strictEqual(
    //     micromark('<FooBar>\n# Hi mom\n</FooBar>', options),
    //     '<FooBar>\n<h1>Hi mom</h1>\n</FooBar>',
    //   );
    // });
    // strictEqual(
    //   micromark('<FooBar>\nHi mom\n</FooBar>', options),
    //   '<FooBar>\nHi mom\n</FooBar>',
    // );
    // strictEqual(micromark('<foo.bar />', options), '<foo.bar />');
    // strictEqual(
    //   micromark('<foo.bar>Hi mom</foo.bar>', options),
    //   '<foo.bar>Hi mom</foo.bar>',
    // );
    // strictEqual(
    //   micromark(
    //     '<foo.bar onclick={handleClick} ontest={() => {console.log("Boop!")}} />',
    //     options,
    //   ),
    //   '<foo.bar />',
    // );
    // strictEqual(
    //   micromark(
    //     '<foo.bar onclick={handleClick} ontest={() => {console.log("Boop!")}}>Hi mom</foo.bar>',
    //     options,
    //   ),
    //   '<foo.bar>Hi mom</foo.bar>',
    // );
  });

  it.skip('parses contents as markdown', () => {
    strictEqual(
      micromark('<FooBar>**Hi mom**</FooBar>', options),
      '<FooBar><strong>Hi mom</strong></FooBar>',
    );
  });
});
