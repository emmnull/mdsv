import { types } from 'common/constants';
import 'micromark-util-types';
import { Token } from 'micromark-util-types';

type SvelteTokenTypeMap = {
  [K in (typeof types)[keyof typeof types]]: Token;
};

type SvelteTokenizeContext = {
  svelteElementStack?: string[];
  // svelteBlockStack?: string[];
};

declare module 'micromark-util-types' {
  interface TokenTypeMap extends SvelteTokenTypeMap {}
  interface TokenizeContext extends SvelteTokenizeContext {}
}
