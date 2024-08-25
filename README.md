# html-parser

I want to parse html and break down to tokens.

## 考え方

- 文字列からタグを検索していく
- 開始タグをみつけたら、そのタグの子要素を children に格納する
  - 子要素に開始タグをみつけたら、タグ用の再帰処理を行う
- 閉じタグをみつけたら、自分の token をリターンしてタグ処理を終える
- パースする html 文字列（source）は、タグを発見して処理をするたびに source から削除し、以降のパース処理は未検索の部分から開始される
