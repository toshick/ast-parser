import './style.css';
import { parser } from './parser.ts';

const html = `
  <div>
    <h1><img class="dog" src="/dog2.png" /> I want to parse html and break down to tokens.</h1>
    <ul class="hotwo">
      <li>文字列からタグを検索していく</li>
      <li>開始タグをみつけたら、そのタグの子要素を children に格納する</li>
      <li>子要素に開始タグをみつけたら、タグ用の再帰処理を行う</li>
      <li>閉じタグをみつけたら、自分の token をリターンしてタグ処理を終える</li>
      <li>パースする html 文字列（source）は、タグを発見して処理をするたびに source から削除し、以降のパース処理は未検索の部分から開始される</li>
      <li>この削除処理によりパース処理が進行し最後まで処理が継続される</li>
    </ul>
    <pre id="tokens"></pre>
  </div>
`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html;

/**
 * パース
 */
const p = parser(html);
const tokens = p.parse();

const $tokens = document.getElementById('tokens');
const tokensStr = JSON.stringify(tokens);

if ($tokens) $tokens.innerHTML = escape(JSON.stringify(tokensStr));

function escape(html: string) {
  return html.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
