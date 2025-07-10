/** @import {Options} from 'mdast-util-from-markdown' */

import { mdsv } from 'micromark-extension-mdsv';
import { describe } from 'node:test';
import { mdsvFromMarkdown } from '../src/index.js';

/** @type {Options} */
export const options = {
  extensions: [mdsv()],
  mdastExtensions: [mdsvFromMarkdown()],
};

describe('mdast util supports mdsv elements', () => {});
