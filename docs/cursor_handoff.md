# Cursor Handoff

Use this when opening the project in Cursor after Codex has produced a buildable baseline.

## Prompt Template

```text
このリポジトリは MAD Pilgrim の3日MVPです。
Codexが初期実装を行いました。あなたの役割は大規模改修ではなく、差分確認と軽微修正です。

まず以下だけ確認してください。

- npm run build が通るか
- /ja の表示でテキストやカードが崩れていないか
- /ja/spots/jujutsu-kaisen-shibuya-scramble の詳細ページが読めるか
- Tailwindの余白、文字サイズ、ボタンの見た目で明らかに雑な箇所がないか

やらないでください。

- Supabase schemaの書き換え
- ルーティング構造の変更
- Stripe/Authの追加
- 大規模なコンポーネント分割

修正した場合は、変更ファイルと理由を短くまとめてください。
```

## Timing

Hand this to Cursor after:

- `npm install` has completed.
- `npm run build` has passed once in Codex.
- The user wants visual polish or a second pair of eyes.

## Current Day 3 Cursor Prompt

```text
MAD Pilgrim MVPのDay3軽微QAをお願いします。

Codex側で以下は確認済みです。
- npm run build 成功
- /ja 200 OK
- /ja/spots/steins-gate-akihabara-radio-kaikan 200 OK
- /ja/foods/steins-gate-akihabara-radio-kaikan 200 OK
- 375px幅と1280px幅で横はみ出しなし
- ホーム -> 詳細 -> グルメ -> EN切替の導線確認済み

あなたに見てほしいこと:
- 画面を実際に開いた時の余白、文字サイズ、カード密度
- 日本語コピーで不自然な箇所
- モバイル375pxでボタンやカードが窮屈すぎないか
- 画像なし/Mapbox tokenなしのfallback地図が見苦しくないか

やってよい修正:
- Tailwind classの軽微調整
- 文言の軽微修正
- ボタンやカードの余白調整
- 明らかな型エラーやimport漏れの修正

やらないでください:
- Supabase schemaの変更
- ルーティング構造の変更
- Stripe/Authの追加
- 大規模リファクタ
- .envや秘密情報の追加

確認コマンド:
- npm run build
- npm run dev -- --hostname 127.0.0.1 --port 3002
```
