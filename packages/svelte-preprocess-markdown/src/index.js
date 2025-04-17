/** @import {PreprocessorGroup} from 'svelte/compiler' */

import { unified } from 'unified';

/**
 * @param {object} options
 * @returns {PreprocessorGroup}
 */
export default function ({
  extensions = ['.md'],
  rehype,
  remark,
  ...remarkOptions
}) {
  // write dts

  /** @param {string} filename */
  function isMarkdown(filename) {
    return extensions.some((ext) => filename.endsWith(ext));
  }

  const processor = unified().use(remarkMdsv, remarkOptions);
  // .use(remark ?? [])
  // .use(rehype ? remarkRehype : [])
  // .use(rehype ?? []);

  return {
    name: 'mdsv',
    async markup(input) {
      if (isMarkdown(input.filename)) {
        return {
          code: (await processor.process(input.content)).toString(),
        };
      }
    },
  };
}
