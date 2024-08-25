// ElementNode`, `TextNode`, `AttributeNode`

export const enum NodeTypes {
  ELEMENT = 'ELEMENT',
  TEXT = 'TEXT',
  ATTRIBUTE = 'ATTRIBUTE',
}

export interface Node {
  type: NodeTypes;
  // loc: SourceLocation; // これ必要なのか
}

export type TemplateChildNode = ElementNode | TextNode;

export interface TextNode extends Node {
  type: NodeTypes.TEXT;
  content: string;
}

export interface ElementNode extends Node {
  type: NodeTypes.ELEMENT;
  tag: string; // eg. "div"
  props: Array<AttributeNode>; // eg. { name: "class", value: { content: "container" } }
  children: TemplateChildNode[];
  isSelfClosing: boolean; // eg. <img /> -> true
}

export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE;
  name: string;
  value: TextNode | undefined;
}

type ParseContext = {
  source: string;
};

export const parser = (html: string) => {
  const ctx: ParseContext = {
    source: html,
  };

  return {
    parse: () => {
      const node = parseNode(ctx);
      console.log('node', node);
    },
  };
};

export const parseNode = (ctx: ParseContext): ElementNode | null => {
  const element = findNextElement(ctx);
  if (!element) return null;
  if (element.isSelfClosing) {
    return element;
  }

  const parentTag = element.tag;
  const children: TemplateChildNode[] = [];
  const counter = {
    count: 0,
    max: 30,
  };
  while (true) {
    removeHeadSpaces(ctx);
    const { text, tag, selftag } = getNextTextAndElement(ctx);
    // console.log('処理 tag:', tag, 'text:', text);
    if (text) {
      cutHeadStr(ctx, text.length);
      children.push({
        type: NodeTypes.TEXT,
        content: text,
      });
    }
    if (selftag) {
      cutHeadStr(ctx, selftag.length);
      children.push({
        type: NodeTypes.ELEMENT,
        tag: selftag,
        props: [],
        children: [],
        isSelfClosing: true,
      });
    }
    if (tag) {
      const mynode = parseNode(ctx);
      if (mynode) children.push(mynode);
    }

    if (isNextCloseTag(ctx, parentTag)) {
      break;
    }
    counter.count += 1;
    if (counter.count > counter.max) {
      throw new Error('無限ループ発生');

      break;
    }
  }
  element.children = children;

  return element;
};

export const findNextElement = (ctx: ParseContext): ElementNode | null => {
  removeHeadSpaces(ctx);
  const match = /^<([a-z]+)/i.exec(ctx.source)!;
  if (!match) return null;
  const tagName = match[1];

  // とりあえず属性は無視
  // タグ全体をカット
  const match2 = /^(<.+?>)/i.exec(ctx.source)!;
  const tagStr = match2[1];
  cutHeadStr(ctx, tagStr.length);
  removeHeadSpaces(ctx);

  const isSelfClosing = / \/>$/.test(tagStr);

  return {
    type: NodeTypes.ELEMENT,
    tag: tagName,
    props: [],
    children: [],
    isSelfClosing,
  };
};

export function removeHeadSpaces(ctx: ParseContext): void {
  const match = /^[\t\r\n\f ]+/.exec(ctx.source);

  if (match) {
    cutHeadStr(ctx, match[0].length);
  }
}

export function cutHeadStr(ctx: ParseContext, length: number): void {
  ctx.source = ctx.source.slice(length);
}

export function isNextCloseTag(ctx: ParseContext, tagName: string): boolean {
  removeHeadSpaces(ctx);
  const match = /^<\/([a-z][^\t\r\n\f />]*)/i.exec(ctx.source)!;
  if (!match) return false;
  const findTagName = match[1];
  if (findTagName === tagName) {
    const tagMatch = /^(<\/.+?>)/i.exec(ctx.source)!;
    cutHeadStr(ctx, tagMatch[1].length);
    return true;
  }
  return false;
}

// 開始タグを最初に発見;
export const isStartOrSelfFinishTag = (text: string): RegExpExecArray => {
  return /^(<[a-z].*?\/*>)/i.exec(text)!;
};
// 終了タグを最初に発見;
export const isFinishTag = (text: string): RegExpExecArray => {
  return /^(<\/[a-z].*?>)/i.exec(text)!;
};
// テキストと自己完結タグ;
export const isTextAndSelfCloseTag = (text: string): RegExpExecArray => {
  return /^([^<]+?)(<[a-z].*? \/>)/i.exec(text)!;
};
// テキストと終了タグ;
export const isTextAndFinishTag = (text: string): RegExpExecArray => {
  return /^([^<]+?)(<\/[a-z].*?>)/i.exec(text)!;
};
// テキストと開始タグ;
export const isTextAndStartTag = (text: string): RegExpExecArray => {
  return /^([^<]+?)(<[a-z].*?>)/i.exec(text)!;
};

export const getNextTextAndElement = (ctx: ParseContext) => {
  let match = null;
  let text = '';
  let tag = '';
  let selftag = '';
  removeHeadSpaces(ctx);

  // 開始タグを最初に発見
  match = isStartOrSelfFinishTag(ctx.source);
  if (match) {
    text = '';
    tag = match[1];

    return {
      text,
      tag,
      selftag,
    };
  }
  // 終了タグを最初に発見
  match = isFinishTag(ctx.source);
  if (match) {
    return {
      text,
      tag,
      selftag,
    };
  }
  // テキストと自己完結タグ
  match = isTextAndSelfCloseTag(ctx.source);
  if (match) {
    text = match[1];
    selftag = match[2];
    return {
      text: text.trim(),
      tag: '',
      selftag,
    };
  }
  // テキストと終了タグ
  match = isTextAndFinishTag(ctx.source);
  if (match) {
    text = match[1];
    return {
      text: text.trim(),
      tag: '',
      selftag,
    };
  }
  // テキストと開始タグ
  match = isTextAndStartTag(ctx.source);
  if (match) {
    text = match[1];
    tag = match[2];

    return {
      text,
      tag,
      selftag,
    };
  }

  return {
    text,
    tag,
    selftag,
  };
};
