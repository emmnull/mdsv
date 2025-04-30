/**
 * @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown';
 * @import {Processor} from 'unified';
 */

import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { mdxMd } from 'micromark-extension-mdx-md';

/** @this {Processor} */
export default function remarkSvelte() {
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
