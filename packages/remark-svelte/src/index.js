/**
 * @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown';
 * @import {Processor, Transformer} from 'unified';
 */

import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { mdxMd } from 'micromark-extension-mdx-md';
import { frontmatter_options } from './constants';
import { svelteFromMarkdown, svelteToMarkdown } from './mdast-util-svelte';
import { svelte } from './micromark-extension-svelte';

// import { mdxJsxFromMarkdown, mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';
// import { mdxJsx } from 'micromark-extension-mdx-jsx';

/** @this {Processor} */
export default function () {
  const data = this.data();
  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    /** @type ToMarkdownExtension[] */
    // @ts-expect-error type of data is missing toMarkdownExtensions
    (data.toMarkdownExtensions || (data.toMarkdownExtensions = []));
  micromarkExtensions.push(
    frontmatter(...Object.values(frontmatter_options)),
    svelte(),
    mdxMd(),
    gfm(),
  );
  fromMarkdownExtensions.push(
    frontmatterFromMarkdown(...Object.values(frontmatter_options)),
    svelteFromMarkdown(),
    gfmFromMarkdown(),
  );
  toMarkdownExtensions.push(
    frontmatterToMarkdown(...Object.values(frontmatter_options)),
    svelteToMarkdown(),
    gfmToMarkdown(),
  );
}
