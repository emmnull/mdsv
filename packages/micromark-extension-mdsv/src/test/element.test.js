/** @import {Options} from 'micromark-util-types' */

import { micromark } from 'micromark';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { mdsvElement, mdsvElementHtml } from '../lib/mdsv-element.js';

/** @type {Options} */
const options = {
  extensions: [mdsvElement()],
  htmlExtensions: [mdsvElementHtml()],
  allowDangerousHtml: true,
};

describe('svelteElement micromark extesion processes elements and components syntax', () => {
  it('supports standalone self-closing and void elements as flow', () => {
    strictEqual(micromark('<FooBar />', options), '<FooBar />');

    strictEqual(
      micromark(
        '<FooBar use:action {...spread} {shorthand} class="a {b}" style={c} />',
        options,
      ),
      '<FooBar use:action {...spread} {shorthand} class="a {b}" style={c} />',
    );
  });

  it('supports inline elements as text', () => {
    strictEqual(
      micromark('Have a pint <FooBarA />', options),
      '<p>Have a pint <FooBarA /></p>',
    );

    strictEqual(
      micromark('<FooBarB /> had a pint', options),
      '<p><FooBarB /> had a pint</p>',
    );

    strictEqual(
      micromark('<FooBarC>Hi mom</FooBarC>', options),
      '<p><FooBarC>Hi mom</FooBarC></p>',
    );

    strictEqual(
      micromark(
        '<FooBarD>Trailing spaces should not matter</FooBarD>   ',
        options,
      ),
      '<p><FooBarD>Trailing spaces should not matter</FooBarD></p>',
    );

    strictEqual(
      micromark('<FooBarE>**This is bold**</FooBarE>', options),
      '<p><FooBarE><strong>This is bold</strong></FooBarE></p>',
    );
  });

  it('supports flow content based on eols and blank lines', () => {
    strictEqual(
      micromark('<FooBarF>\n**Some more bold**\n</FooBarF>', options),
      '<FooBarF>\n<strong>Some more bold</strong>\n</FooBarF>',
    );

    strictEqual(
      micromark('<FooBarG>\n# This is not a heading\n</FooBarG>', options),
      '<FooBarG>\n# This is not a heading\n</FooBarG>',
    );

    strictEqual(
      micromark('<FooBarH>\n\nI like turtles\n\n</FooBarH>', options),
      '<FooBarH>\n<p>I like turtles</p>\n</FooBarH>',
    );

    strictEqual(
      micromark('<FooBarI>\n\n# This is a heading\n\n</FooBarI>', options),
      '<FooBarI>\n<h1>This is a heading</h1>\n</FooBarI>',
    );

    strictEqual(
      micromark('<FooBarJ>\n\n**Dat beat is faaat**\n\n</FooBarJ>', options),
      '<FooBarJ>\n<p><strong>Dat beat is faaat</strong></p>\n</FooBarJ>',
    );
  });

  it('supports nested text tags', () => {
    strictEqual(
      micromark('<Foo><Bar>Hi mom</Bar></Foo>', options),
      '<p><Foo><Bar>Hi mom</Bar></Foo></p>',
    );
  });

  it('tokenizes nested flow tags', () => {
    strictEqual(
      micromark('<Foo>\n<Bar>Hi mom</Bar>\n</Foo>', options),
      '<Foo>\n<Bar>Hi mom</Bar>\n</Foo>',
    );
  });

  it('supports raw element content', () => {
    strictEqual(
      micromark(
        '<script lang="ts" module>\nconst test = "a<b";\n\nlet value = $state();\n</script>',
        options,
      ),
      '<script lang="ts" module>\nconst test = "a<b";\n\nlet value = $state();\n</script>',
    );
  });
});
