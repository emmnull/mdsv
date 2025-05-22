/**
 * @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown';
 * @import {Extension as MicromarkExtension} from 'micromark-util-types';
 * @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown';
 * @import {Processor} from 'unified';
 */

// import {
//   frontmatterFromMarkdown,
//   frontmatterToMarkdown,
// } from 'mdast-util-frontmatter';
import { frontmatter } from 'micromark-extension-frontmatter';
import { mdsv } from 'micromark-extension-mdsv';

/** @this {Processor} */
export default function remarkMdsv(options) {
  const data = this.data();
  const micromarkExtensions =
    /** @type MicromarkExtension[] */
    // @ts-expect-error type of data is missing micromarkExtensions
    (data.micromarkExtensions || (data.micromarkExtensions = []));
  const fromMarkdownExtensions =
    /** @type {FromMarkdownExtension[]} */
    // @ts-expect-error type of data is missing toMarkdownExtensions
    (data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []));
  const toMarkdownExtensions =
    /** @type ToMarkdownExtension[] */
    // @ts-expect-error type of data is missing toMarkdownExtensions
    (data.toMarkdownExtensions || (data.toMarkdownExtensions = []));
  micromarkExtensions.push(mdsv(), frontmatter());
  // fromMarkdownExtensions.push(frontmatterFromMarkdown());
  // toMarkdownExtensions.push(frontmatterToMarkdown());
}
