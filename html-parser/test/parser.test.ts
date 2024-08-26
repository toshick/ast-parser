import { describe, it, expect } from 'vitest';
import {
  cutHeadStr,
  removeHeadSpaces,
  findNextElement,
  NodeTypes,
  isNextCloseTag,
  getNextTextAndElement,
  parseNode,
  isStartOrSelfFinishTag,
  isFinishTag,
  isTextAndSelfCloseTag,
  isTextAndFinishTag,
  isTextAndStartTag,
  getTagName,
  getProps,
} from '../src/lib/parser';

describe('cutHeadStr', () => {
  it('cut head strings', () => {
    const ctx = {
      source: '123456',
    };
    cutHeadStr(ctx, 3);

    expect(ctx.source).toBe('456');
  });
  it('cut zero strings', () => {
    const ctx = {
      source: '',
    };
    cutHeadStr(ctx, 3);

    expect(ctx.source).toBe('');
  });
});

describe('removeHeadSpaces', () => {
  it('remove head spaces', () => {
    const ctx = {
      source: '         123456   ',
    };
    removeHeadSpaces(ctx);
    expect(ctx.source).toBe('123456   ');
  });
  it('remove head spaces with 改行', () => {
    const ctx = {
      source: '  \t    \n   123456',
    };
    removeHeadSpaces(ctx);
    expect(ctx.source).toBe('123456');
  });
  it('remove head spaces with tag', () => {
    const ctx = {
      source: '<p>123456</p>',
    };
    removeHeadSpaces(ctx);
    expect(ctx.source).toBe('<p>123456</p>');
  });
});

describe('findNextElement', () => {
  it('find next element', () => {
    const ctx = {
      source:
        '         <div class="myapp">  \n <p>てきすと1</p><p>てきすと2</p></div>',
    };
    const node = findNextElement(ctx);
    expect(node).toMatchObject({
      type: NodeTypes.ELEMENT,
      tag: '<div class="myapp">',
      tagName: 'div',
      props: [
        {
          type: 'ATTRIBUTE',
          name: 'class',
          value: 'myapp',
        },
      ],
      children: [],
      isSelfClosing: false,
    });

    expect(ctx.source).toBe('<p>てきすと1</p><p>てきすと2</p></div>');
  });
  it('find self-closing element', () => {
    const ctx = {
      source: '         <br />コンプレックス</div>',
    };
    const node = findNextElement(ctx);
    expect(node).toMatchObject({
      type: NodeTypes.ELEMENT,
      tag: '<br />',
      tagName: 'br',
      props: [],
      children: [],
      isSelfClosing: true,
    });

    expect(ctx.source).toBe('コンプレックス</div>');
  });
});

describe('isNextCloseTag', () => {
  it('return true if find it', () => {
    const ctx = {
      source: '         </div>',
    };
    expect(isNextCloseTag(ctx, 'div')).toBe(true);
    expect(ctx.source).toBe('');
  });
  it('return true if find it', () => {
    const ctx = {
      source: '         </div></article>めんたいこ',
    };
    expect(isNextCloseTag(ctx, 'div')).toBe(true);
    expect(ctx.source).toBe('</article>めんたいこ');
  });
  it('return false if it is not', () => {
    const ctx = {
      source: '   \n      </p>',
    };
    expect(isNextCloseTag(ctx, 'div')).toBe(false);
    expect(ctx.source).toBe('</p>');
  });
  it('return false if source is empty', () => {
    const ctx = {
      source: '     ',
    };
    expect(isNextCloseTag(ctx, 'p')).toBe(false);
    expect(ctx.source).toBe('');
  });
});

describe('getNextTextAndElement', () => {
  it('return node and text', () => {
    const ctx = {
      source: '  あいうえ       <b class="kakiku">かきくけ</b>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('あいうえ       ');
    expect(tag).toBe('<b class="kakiku">');
  });
  it('return node and text from 最初に開始タグ', () => {
    const ctx = {
      source: '<p class="kakiku">かきくけ</p>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('');
    expect(tag).toBe('<p class="kakiku">');
  });
  it('return node and text from 最初に終了タグ', () => {
    const ctx = {
      source: '</div></section>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('');
    expect(tag).toBe('');
  });
  it('return node and text from テキストと開始タグ1', () => {
    const ctx = {
      source: 'ほんなこつ<p class="kakiku">かきくけ</p>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('ほんなこつ');
    expect(tag).toBe('<p class="kakiku">');
  });

  it('return node and text from テキストと終了タグ1', () => {
    const ctx = {
      source: 'かいぎょうする\n</p>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('かいぎょうする');
    expect(tag).toBe('');
  });
  it('return node and text from テキストと終了タグ2', () => {
    const ctx = {
      source: 'Text1</li>\n<li>Text2</li>',
    };
    const { text, tag } = getNextTextAndElement(ctx);

    expect(text).toBe('Text1');
    expect(tag).toBe('');
  });
});

describe('parseNode', () => {
  it.skip('return children 1', () => {
    const ctx = {
      source:
        '<section class="mysection">  <div class="kakiku">かき<br class="mybr" />くけ</div></section>',
    };
    const node = parseNode(ctx);

    expect(node).toMatchObject({
      type: 'ELEMENT',
      tag: '<section class="mysection">',
      tagName: 'section',
      props: [
        {
          type: 'ATTRIBUTE',
          name: 'class',
          value: 'mysection',
        },
      ],
      children: [
        {
          type: 'ELEMENT',
          tag: '<div class="kakiku">',
          tagName: 'div',
          props: [
            {
              type: 'ATTRIBUTE',
              name: 'class',
              value: 'kakiku',
            },
          ],
          children: [
            { type: 'TEXT', content: 'かき' },
            {
              type: 'ELEMENT',
              tag: '<br class="mybr" />',
              tagName: 'br',
              props: [
                {
                  type: 'ATTRIBUTE',
                  name: 'class',
                  value: 'mybr',
                },
              ],
              children: [],
              isSelfClosing: true,
            },
            { type: 'TEXT', content: 'くけ' },
          ],
          isSelfClosing: false,
        },
      ],
      isSelfClosing: false,
    });
  });
  it.skip('return children 2', () => {
    const ctx = {
      source: `
          <article data-e2e="fortest" class="myarticle" style="{'background-color': '0xff3355'}">
            <p>かいぎょう<br class="mybr" />する</p>
            <ul class="mysection">
              <li>Text1</li>
              <li id="this-is-text-2">Text2</li>
              <li>Text3</li>
              <li>Text4</li>
              <li>Text5<div>ほんなこつ</div></li>
            </ul>
            はひふへ<br /><br />ほほほ
          </article>
        `,
    };
    const node = parseNode(ctx);

    console.log(JSON.stringify(node));
  });
  it('return children 3', () => {
    const ctx = {
      source: `
         <div>
         <h1><img class="dog" src="/dog2.png" /> I want to parse html and break down to tokens.</h1>
          <a href="https://vitejs.dev" target="_blank">
            <img src="url" class="logo" alt="Vite logo" />
          </a>
          <a href="https://www.typescriptlang.org/" target="_blank">
            <img src="mysrc" class="logo vanilla" alt="TypeScript logo" />
          </a>
          
          <div class="card">
            <button id="counter" type="button">ぼたん</button>
          </div>
          <p class="read-the-docs">
            Click on the Vite and TypeScript logos to learn more
          </p>
        </div>
        `,
    };
    const node = parseNode(ctx);

    console.log(JSON.stringify(node));
  });
});

describe('isXXX', () => {
  describe('isStartOrSelfFinishTag', () => {
    it('return matched', () => {
      const match = isStartOrSelfFinishTag('<p>ほんなこつ</p>   <a>リンク</a>');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('<p>');
    });
    it('return matched', () => {
      const match = isStartOrSelfFinishTag('<p>ほんなこつ</p>   <br />');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('<p>');
    });
    it('return matched', () => {
      const match = isStartOrSelfFinishTag('<li>Text1</li>');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('<li>');
    });
    it('return null', () => {
      const match = isStartOrSelfFinishTag('</p>   <br />');
      expect(match).toBe(null);
    });
    it('return null', () => {
      const match = isStartOrSelfFinishTag('<br />oooo');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('<br />');
    });
  });
  describe('isFinishTag', () => {
    it('return matched', () => {
      const match = isFinishTag('</section>ほんなこつ</p>   <a>リンク</a>');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('</section>');
    });
    it('return matched', () => {
      const match = isFinishTag('</p>ほんなこつ</p>   <a>リンク</a>');
      expect(match.length).toBe(2);
      expect(match[0]).toBe('</p>');
    });
    it('return null', () => {
      const match = isFinishTag('ほんなこつ</p>   <a>リンク</a>');
      expect(match).toBe(null);
    });
  });
  describe('isTextAndSelfCloseTag', () => {
    it('return matched', () => {
      const match = isTextAndSelfCloseTag('おおお<br />ううう');
      expect(match.length).toBe(3);
      expect(match[1]).toBe('おおお');
      expect(match[2]).toBe('<br />');
    });
    it('return null', () => {
      const match = isTextAndSelfCloseTag('<br />ううう');
      expect(match).toBe(null);
    });
  });
  describe('isTextAndFinishTag', () => {
    it('return matched', () => {
      const match = isTextAndFinishTag('おおお</p>ううう');
      expect(match.length).toBe(3);
      expect(match[1]).toBe('おおお');
      expect(match[2]).toBe('</p>');
    });
    it('return null', () => {
      const match = isTextAndFinishTag('</p>ううう');
      expect(match).toBe(null);
    });
  });
  describe('isTextAndStartTag', () => {
    it('return matched', () => {
      const match = isTextAndStartTag('おおお<p>ううう</p><p>えええ</p>');
      expect(match.length).toBe(3);
      expect(match[1]).toBe('おおお');
      expect(match[2]).toBe('<p>');
    });
    it('return null', () => {
      const match = isTextAndStartTag('<p>ううう</p><p>えええ</p>');
      expect(match).toBe(null);
    });
  });
});

describe('getTagName', () => {
  it('return tagName', () => {
    const tagName = getTagName('<p>');
    expect(tagName).toBe('p');
  });
  it('return tagName', () => {
    const tagName = getTagName('<article id="">');
    expect(tagName).toBe('article');
  });
  it('return tagName', () => {
    const tagName = getTagName(' <li class="VVVVVVVV" />');
    expect(tagName).toBe('li');
  });
  it('return tagName', () => {
    const tagName = getTagName(' </p>');
    expect(tagName).toBe('p');
  });
  it('return tagName', () => {
    const tagName = getTagName('');
    expect(tagName).toBe('');
  });
  it('return tagName', () => {
    const tagName = getTagName('i');
    expect(tagName).toBe('i');
  });
});

describe('getProps', () => {
  it('return props', () => {
    const props = getProps('<p class="fff">');
    expect(props).toMatchObject([
      {
        type: 'ATTRIBUTE',
        name: 'class',
        value: 'fff',
      },
    ]);
  });
  it('return props', () => {
    const props = getProps(
      '<p class="aaa" style="{\'border\': \'solid 1px #333\'}">'
    );
    expect(props).toMatchObject([
      {
        type: 'ATTRIBUTE',
        name: 'class',
        value: 'aaa',
      },
      {
        type: 'ATTRIBUTE',
        name: 'style',
        value: "{'border': 'solid 1px #333'}",
      },
    ]);
  });
});
