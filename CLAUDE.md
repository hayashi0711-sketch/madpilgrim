# MAD Pilgrim — Claude Code / Codex 作業分担

このプロジェクトの開発は Claude Code と OpenAI Codex CLI を併用する。

## Codex CLI の場所
```
C:\Users\Haruki\AppData\Local\OpenAI\Codex\bin\330bd0cba6496126\codex.exe
```
バージョンハッシュは更新で変わるため、使用前に存在確認すること:
```powershell
Get-ChildItem "C:\Users\Haruki\AppData\Local\OpenAI\Codex\bin" | Select-Object -Last 1
```

## 役割分担

### Claude Code
- プロジェクト作業の指揮（タスク分解・進行管理・`05_Current_State.md` / `08_Handoff_Note.md` 更新）
- メインのコーディング
- Gemini Deep Research 用プロンプトの作成・改善
- Supabase REST API / RPC（`upsert_spot_candidate_v2` 等）関連の作業

### Codex（Claude Codeが自動委任）
- 一部のコーディング（並行作業可能な範囲・補助実装）
- バグ確認（Claude Codeが書いたコードのレビュー）
- GPT Image 2.0 を使ったWEBデザイン素材生成
- **GitHubへのPUSH（必須・Claude Codeは直接 `git push` しない）**
- **課金リスクのあるSDK設定・APIキー発行系の作業（必須・Claude Codeは直接実行しない）**

## 委任コマンド例
```powershell
codex exec "MAD Pilgrim のリポジトリで、現在のdiffをGitHubにpushしてください。コミットメッセージは内容に基づいて作成してください。"
```

## 厳守事項
- GitHub PUSH と SDK/課金関連の設定変更は、Claude Codeが「やっていいですか」と聞いて自分で実行するのではなく、**最初からCodex CLI経由で実行する**。
- Codexの実行結果（diff・ログ）は必ずユーザーに要約報告する。
- `.env.local` の内容・APIキー・トークンはCodexへの指示文にも書かない。

## サブエージェント編成（このプロジェクトでの運用）

- Codexに作業委任する際は **実装 → `codex exec review --uncommitted` でのセルフレビュー → 必要なら再修正** の2段構成を基本とする。単発の `codex exec` で済ませない。
- GPT Image 2.0でのデザイン素材生成とコードのバグ確認など、独立したCodexタスクが複数ある場合は、Bashで並列に `codex exec` を同時起動する。
- 探索・調査でClaude Codeの`Explore`サブエージェントを使う場合も、独立した調査は並列に投げる。
- 些細な1往復タスク（1行修正・単純な質問）はチーム編成せず直接処理する。トークン節約を優先。
- Codexの思考ログや中間出力はそのままClaude Codeの会話に貼らず、要約のみ残す。
