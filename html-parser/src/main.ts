import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter.ts';
import { parser } from './parser.ts';

const html = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

/**
 * parser
 */
const p = parser(html);
p.parse();

/**
 * 考え方
 * - 文字列からタグを検索していく
 * - 開始タグをみつけたら、そのタグの子要素をchildrenに格納する
 *   - 子要素に開始タグをみつけたら、タグ用の再帰処理を行う
 * - 閉じタグをみつけたら、自分のtokenをリターンしてタグ処理を終える
 * - パースするhtml文字列（source）は、タグを発見して処理をするたびにsourceから削除し、以降のパース処理は未検索の部分から開始される
 *
 */
