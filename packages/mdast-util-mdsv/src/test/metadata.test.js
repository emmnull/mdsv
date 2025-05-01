import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const files = {
  sample: readFileSync('./src/test/sample.md', { encoding: 'utf-8' }),
};

describe('mdast metadata handles front matter', () => {
  it('parses front matter', () => {
    // to do
  });

  it('injects or merges module script', () => {
    // to do
  });
});
