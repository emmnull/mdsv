/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { tokens } from '@mdsv/constants';
import type { Token } from 'micromark-util-types';

type MdsvTokenTypeMap = Record<(typeof tokens)[keyof typeof tokens], Token>;

type MdsvTokenizeContext = {
  mdsvElementTagName?: string;
};

declare module 'micromark-util-types' {
  interface Token {
    /**
     * If inside a closing block tag. Else we are either inside an opening or
     * branching block tag.
     */
    _blockClose?: boolean;
    /**
     * If inside a branching block tag. Else we are either inside an opening or
     * closing block tag.
     */
    _blockBranch?: boolean;
    /**
     * If inside a closing element tag token. When true in conjunction with
     * _elementOpen means inside a self-closing element tag.
     */
    _elementClose?: boolean;
    /**
     * If inside an opening element tag token. When true in conjunction with
     * _elementClose means inside a self-closing element tag.
     */
    _elementOpen?: boolean;
  }

  interface TokenTypeMap extends MdsvTokenTypeMap {}

  interface TokenizeContext extends MdsvTokenizeContext {}
}
