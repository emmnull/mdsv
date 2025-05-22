import { nodes } from '@mdsv/constants';
import 'hast';
import 'mdast';
import { Literal, Parent } from 'mdast';
import 'micromark-extension-mdsv';
import { Token } from 'micromark-util-types';

interface MdsvTextExpression extends Literal {
  type: typeof nodes.textExpression;
}

interface MdsvTextTag extends Literal {
  type: typeof nodes.textTag;
}

interface MdsvFlowTag extends Literal {
  type: typeof nodes.flowTag;
}

interface MdsvTextBlock extends Parent {
  type: typeof nodes.textBlock;
  name: string;
  expression?: string;
  branch?: boolean;
}

interface MdsvFlowBlock extends Parent {
  type: typeof nodes.flowBlock;
  name: string;
  expression?: string;
  branch?: boolean;
}

interface MdsvTextElement extends Parent {
  type: typeof nodes.textElement;
  name: string;
  attributes?: string[];
}

interface MdsvFlowElement extends Parent {
  type: typeof nodes.flowElement;
  name: string;
  attributes?: string[];
}

interface MdsvTextRaw extends Literal {
  type: typeof nodes.textRaw;
  name: string;
  attributes?: string[];
}

interface MdsvFlowRaw extends Literal {
  type: typeof nodes.flowRaw;
  name: string;
  attributes?: string[];
}

declare module 'mdast' {
  interface RootContentMap {
    [nodes.textExpression]: MdsvTextExpression;
    [nodes.textTag]: MdsvTextTag;
    [nodes.textBlock]: MdsvTextBlock;
    [nodes.textElement]: MdsvTextElement;
    [nodes.textRaw]: MdsvTextRaw;
    [nodes.flowTag]: MdsvFlowTag;
    [nodes.flowBlock]: MdsvFlowBlock;
    [nodes.flowElement]: MdsvFlowElement;
    [nodes.flowRaw]: MdsvFlowRaw;
  }

  interface PhrasingContentMap {
    [nodes.textExpression]: MdsvTextExpression;
    [nodes.textTag]: MdsvTextTag;
    [nodes.textBlock]: MdsvTextBlock;
    [nodes.textElement]: MdsvTextElement;
    [nodes.textRaw]: MdsvTextRaw;
  }

  interface BlockContentMap {
    [nodes.flowTag]: MdsvFlowTag;
    [nodes.flowBlock]: MdsvFlowBlock;
    [nodes.flowElement]: MdsvFlowElement;
    [nodes.flowRaw]: MdsvFlowRaw;
  }
}

declare module 'mdast' {
  interface RootData {
    metadata?: Record<string, unknown>;
  }
}

declare module 'mdast-util-from-markdown' {
  interface CompileData {
    mdsvBlockStack?: Token[];
  }

  // interface CompileContext {}
}

declare module 'mdast-util-to-markdown' {
  // interface CompileData {
  //   mdsvMetadata?: string;
  // }
  // interface ConstructNameMap {}
}
