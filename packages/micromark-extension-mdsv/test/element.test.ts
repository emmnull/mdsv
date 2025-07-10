import dedent from 'dedent';
import { micromark } from 'micromark';
import type { Options } from 'micromark-util-types';
import { describe, expect, test } from 'vitest';
import { mdsvElement, mdsvElementHtml } from '../src/lib/element.js';

const options: Options = {
  extensions: [mdsvElement()],
  htmlExtensions: [mdsvElementHtml()],
  allowDangerousHtml: true,
};

describe('svelteElement micromark extesion processes elements and components syntax', () => {
  test('supports standalone self-closing and void elements as flow', () => {
    expect(micromark('<FooBar />', options)).toBe('<FooBar />');

    expect(micromark('<FooBar use:action />', options)).toBe(
      '<FooBar use:action />',
    );

    expect(micromark('<FooBar class="a {b}" style={c} />', options)).toBe(
      '<FooBar class="a {b}" style={c} />',
    );

    expect(micromark('<FooBar {...spread} {shorthand} />', options)).toBe(
      '<FooBar {...spread} {shorthand} />',
    );
  });

  test('supports svelte tags', () => {
    expect(micromark('<svelte:window />', options)).toBe('<svelte:window />');

    expect(micromark('<svelte:element={foo} />', options)).toBe(
      '<svelte:element={foo} />',
    );
  });

  test('supports inline elements as text', () => {
    expect(micromark('Have a pint <FooBarA />', options)).toBe(
      '<p>Have a pint <FooBarA /></p>',
    );

    expect(micromark('<FooBarB /> had a pint', options)).toBe(
      '<p><FooBarB /> had a pint</p>',
    );

    expect(micromark('<FooBarC>Hi mom</FooBarC>', options)).toBe(
      '<p><FooBarC>Hi mom</FooBarC></p>',
    );

    expect(
      micromark(
        '<FooBarD>Trailing spaces should not matter</FooBarD>   ',
        options,
      ),
      '<p><FooBarD>Trailing spaces should not matter</FooBarD></p>',
    );

    expect(micromark('<FooBarE>**This is bold**</FooBarE>', options)).toBe(
      '<p><FooBarE><strong>This is bold</strong></FooBarE></p>',
    );
  });

  test('supports flow content based on eols and blank lines', () => {
    expect(
      micromark('<FooBarF>\n**Some more bold**\n</FooBarF>', options),
    ).toBe('<FooBarF>\n<strong>Some more bold</strong>\n</FooBarF>');

    expect(
      micromark('<FooBarG>\n# This is not a heading\n</FooBarG>', options),
    ).toBe('<FooBarG>\n# This is not a heading\n</FooBarG>');

    expect(
      micromark('<FooBarH>\n\nI like turtles\n\n</FooBarH>', options),
    ).toBe('<FooBarH>\n<p>I like turtles</p>\n</FooBarH>');

    expect(
      micromark('<FooBarI>\n\n# This is a heading\n\n</FooBarI>', options),
    ).toBe('<FooBarI>\n<h1>This is a heading</h1>\n</FooBarI>');

    expect(
      micromark('<FooBarJ>\n\n**Dat beat is faaat**\n\n</FooBarJ>', options),
    ).toBe('<FooBarJ>\n<p><strong>Dat beat is faaat</strong></p>\n</FooBarJ>');
  });

  test('supports nested text tags', () => {
    expect(micromark('<Foo><Bar>Hi mom</Bar></Foo>', options)).toBe(
      '<p><Foo><Bar>Hi mom</Bar></Foo></p>',
    );
  });

  test('tokenizes nested flow tags', () => {
    expect(micromark('<Foo>\n<Bar>Hi mom</Bar>\n</Foo>', options)).toBe(
      '<Foo>\n<Bar>Hi mom</Bar>\n</Foo>',
    );
  });

  test('supports raw element content', () => {
    expect(
      micromark(
        '<script lang="ts" module>const test = "a<b"; let value = $state(); const u = x * y * z;</script>',
        options,
      ),
      '<script lang="ts" module>const test = "a<b"; let value = $state(); const u = x * y * z;</script>',
    );

    expect(
      micromark('<script lang="ts" module>\n\n</script>', options),
      '<script lang="ts" module>\n\n</script>',
    );

    // expect(
    //   micromark(
    //     '<script lang="ts" module>\nconst test = "a<b";\n\nlet value = $state();\n</script>',
    //     options,
    //   ),
    //   '<script lang="ts" module>\nconst test = "a<b";\n\nlet value = $state();\n</script>',
    // );
  });

  test('supports multine tags', () => {
    expect(
      micromark(
        dedent`
				<a
					href="foo/{bar}"
					{...attributes}
				/>`,
        options,
      ),
    ).toBe(dedent`
			<a
				href="foo/{bar}"
				{...attributes}
			/>
		`);

    //   expect(
    //     micromark(
    //       dedent`
    // 			<script
    // 				module
    // 				generics="T extends Foo<Bar>"
    // 			>
    // 				const { children }: { children: Snippet<[T]> } = $props();
    // 			</script>`,
    //       options,
    //     ),
    //   ).toBe(dedent`
    // 		<script
    // 			module
    // 			generics="T extends Foo<Bar>"
    // 		>
    // 			const { children }: { children: Snippet<[T]> } = $props();
    // 		</script>`);
  });
});
