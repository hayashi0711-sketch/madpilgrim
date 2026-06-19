# MAD Pilgrim 引き継ぎメモ

Last updated: 2026-06-19（デザイン刷新 + YouTube公式動画埋め込みセッション）

## ✅ 完了: デザイン刷新 + YouTube埋め込み機能（2026-06-19 夜）

1. **フォント/カラー変更**: 見出しHina Mincho、本文BIZ UDPGothic。テーマカラーをネイビー
   (#121826)×チャコール(#1d2128)×ペーパー(#f3f1ec)×アクセントゴールド(#c2a14d)に統一（旧オレンジ廃止）。
2. **ホームページ新規実装**（`src/components/LandingPage.tsx`）。ヒーロー画像はGPT Image 2.0で
   著作物・文字・ロゴを含まない汎用シネマティック画像を生成。
3. **デザイン品質向上5項目**: 選択状態のゴールド接続線／詳細ページのコンポーネント分割
   （`SpotDetail/SpotDetailReceipt.tsx`新設）／ハイライト画像の街並み写真優先化／モバイルタブUI
   （820px以下で作品/地図/食切替）／`TrustIndicator.tsx`で検証バッジ統一。
4. **YouTube公式動画埋め込み機能**: `supabase/migrations/0008_youtube_official_embed.sql`で
   `youtube_url`/`youtube_channel_name`カラム追加・適用済み。`src/lib/youtube.ts`でURL変換、
   詳細ページにクレジット表記付きiframeを実装。**安全策**: `import_from_gemini.py`は
   `youtube_confirmed: true`が無い限りURLを自動的に捨てる（人間の最終確認が必須の運用）。
   - ユーザー作成のエクセルから13作品・36スポットに実データ登録済み。
5. **Phase 4一部対応**: 詳細ページ用動的OGP画像 `spots/[slug]/opengraph-image.tsx` 追加。

## ⚠️ このセッションでの学び（次回に活かす）

- **Codexの利用量制限に複数回遭遇**（21:58、3:10 AM等、長時間ブロックされることがある）。
  制限中はClaude Codeが直接実装する判断も可。今回のYouTube埋め込みUIはCodex制限時に
  Claude Codeが代行実装した。
- **`.next`キャッシュ競合に注意**: `npm run build`実行後に`npm run dev`を再起動すると
  「Cannot find module './vendor-chunks/@supabase.js'」等で500エラーになることが複数回発生。
  `rm -rf .next`してから`npm run dev`で解消する。
- Geminiの「Gem」自体のシステム指示（出力JSON仕様）にはまだ`youtube_url`等の3フィールドを
  追記していない。SKILL.md側のプロンプトだけではGemに新フィールドを認識させられないため、
  Gemini Web UI側の設定は別途ユーザー作業が必要。

## Dev Environment（次回スレッド開始時に必ず確認）

Claude Code と Codex CLI を役割分担で併用する開発環境。

- グローバルルール: `C:\Users\Haruki\.claude\CLAUDE.md`（Codex連携・サブエージェント編成ルール）
- プロジェクトルール: `C:\Users\Haruki\Projects\MadPilgrim\CLAUDE.md`
- Obsidian側の同じ内容: `AI開発ハブ/00_運用ルール/ClaudeCode_Codex_併用運用.md`、`Projects/MadPilgrim/08_Handoff_Note.md`
- Codex CLI本体: `C:\Users\Haruki\AppData\Local\OpenAI\Codex\bin\<version-hash>\codex.exe`
  （`Get-ChildItem`でハッシュ確認。2026-06-19時点の最新版は`5d35d2790d1d3d7b`）
  → `codex.exe exec "<指示>"`で非対話実行。gitリポジトリ内必須。
- レビュー専用コマンド: `codex.exe exec review --uncommitted`

**役割分担（通常時）:**
| 担当 | 作業 |
|---|---|
| Claude Code | プロジェクト指揮・メインコーディング・Geminiプロンプト作成・Supabase REST API作業 |
| Codex（自動委任・必須） | 一部コーディング・バグ確認（`codex review`）・GPT Image 2.0デザイン・**GitHub PUSH**・**課金リスクのあるSDK設定** |

**🆕 Codex全面委任モード（2026-06-19導入）:**
ユーザーが「Claude Codeのプラン使用制限を節約したい」と明示した場合、UI実装・デザイン作業を
Claude Codeは指示と検証のみに留め、実装は全面的にCodexに委任するモードに切り替える。
この回のUI品質改善（レスポンシブ対応CSS、データパイプライン修正、マイグレーション作成）はこの方式で実施した。
Claude Codeは「何を直すべきか調査・特定 → Codexへの詳細指示文を作成 → 実装→`codex review`の2段で実行 →
結果を要約してユーザーに報告」のみを行う。

**チーム編成方針（トークン節約 × 品質維持）:**
- Claude Code: 軽い作業は単独処理、探索が重い時は`Explore`サブエージェント、独立タスクは並列`Agent`呼び出し。
- Codex: 単発`codex exec`で終わらせず「実装 → `codex exec review --uncommitted`で自己レビュー → 必要なら再修正」の2段構成。

**絶対厳守:** `G:\マイドライブ\.claude\` は自動バックアップ専用領域。重要な設定・CLAUDE.mdは絶対にそこへ書かず、必ずローカル `C:\Users\Haruki\.claude\` 側に作成する。

## Current State

MAD Pilgrim は、映像作品を起点に「シーン・ロケ地・作品に関連する食体験」を案内する Web サービス。

最新のプロダクト方針は `docs/strategy_pivot.md` と `docs/scene_serve_design.md`。

## Workspace / Repository

- Workspace: `C:\Users\Haruki\Projects\MadPilgrim`
- Framework: Next.js 15 App Router / React 19 / TypeScript / Tailwind CSS
- Git branch: `master`（初回コミット `cbacda5` 以降、未コミットの変更が多数蓄積中。次回コミット推奨）
- `.env.local` は存在するが、内容や秘密値を引き継ぎ文書へ記載しない。
- Dev server: `npm run dev -- --hostname 127.0.0.1 --port 3002`

主要ルート: `/ja` `/en` `/ja/spots/[slug]` `/en/spots/[slug]` `/ja/foods/[spotSlug]`

## このセッションでの作業内容（2026-06-19）

### 1. Obsidian外部記憶の確認・整理
- `AI開発ハブ` / `Preferences` / `Projects/MadPilgrim` の優先ファイルを確認。
- `Preferences/profile.md` に矛盾する別人格の記載があったため削除・訂正。

### 2. Geminiデータ投入パイプラインの大量運用
- `gemini-research-prompt` Skill（`C:\Users\Haruki\.claude\skills\gemini-research-prompt\SKILL.md`）を新設。
  作品名を伝えるだけで1作品=短い定型プロンプトを生成できる。
- **26作品・71スポットを投入・承認・公開**（ぼっち・ざ・ろっく！、STEINS;GATE、SPEC、リコリス・リコイル、
  孤独のグルメ、グランメゾン東京、ワカコ酒、きのう何食べた？、美味しんぼ、silent、夜明けのすべて、
  不適切にもほどがある！、ドラえもん、First Love 初恋、忍びの家、ゆるキャン△、HERO、
  最高の人生の終わり方、VIVANT、相棒、逃げるは恥だが役に立つ、コンフィデンスマンJP、木更津キャッツアイ、
  教場、半沢直樹、恋はつづくよどこまでも）。
- 品質基準により見送ったもの: 座標未特定（チェーン店総称、建物撤去済み）、推測ベースの「インスピレーション元」
  記述（撮影地ではない）、閉業済み施設、ユーザー判断によるキャンセル多数。
- 保留中（承認待ち）: SPEC「もつ福 赤坂店（跡地）」1件。
- `SpotCategory`に`manga`カテゴリを追加（型・タブUI・i18nラベル・CSS配色・テンプレJSON・Skillの計6箇所）。
  ※ただしDB側のCHECK制約は0006マイグレーション適用までmanga投入不可。

### 3. UIバグ修正（完了・確認済み）
- カテゴリ別カラーコーディング: コード自体は正しかったが視認性が低かった（縦線6px）ため10pxに拡大して解決。
- 「マンガ」タブなど該当スポット0件のカテゴリを選ぶと画面全体が消える致命的なクラッシュを修正
  （`LocationReceiptDashboard.tsx`の`if (!selected) return null`が原因）。空状態UIを追加。

### 4. UI品質改善フェーズ（Codex全面委任で開始）
- レスポンシブ対応CSSをCodexに実装依頼（`globals.css`にブレークポイント追加、375px〜1024px想定）。
  `npm run build`成功。実機/実ブラウザでの最終確認はまだ。
- Codexのレビューで上記「最優先」セクションの重大不具合4件＋公開範囲の不具合1件を発見・修正。

## Important Files

- `src/components/LocationReceiptDashboard.tsx` — LOCATION RECEIPT メイン画面
- `src/app/globals.css` — レイアウト・レスポンシブスタイル
- `src/app/[locale]/page.tsx` — RSC、spots + foodsBySlug を取得して渡す
- `src/types/mad-pilgrim.ts` — `SpotCategory`に`manga`含む現行フロント型
- `src/lib/spots-adapter.ts` — Supabase ↔ Spot/NearbyFood 型変換
- `src/lib/i18n.ts` — カテゴリラベル（日英）
- `scripts/import_from_gemini.py` — Gemini出力JSON投入スクリプト（2026-06-19にCodexが大幅修正）
- `scripts/review_spots.py` — ai_suggested承認スクリプト（urllib経由でRemoteDisconnectedが時々発生。curlで直接PATCHすれば成功する）
- `scripts/apply_0006_0007.sql` — 未適用マイグレーションの手動適用用ファイル（最優先）
- `supabase/migrations/0006_gemini_import_pipeline.sql` / `0007_restrict_public_spots_to_approved.sql` — 未適用

## Data Pipeline (Geminiインポート)

```powershell
# プレビュー（書き込みなし）
python scripts/import_from_gemini.py --input scripts/gemini_output.json

# 実際に投入
python scripts/import_from_gemini.py --input scripts/gemini_output.json --commit
```

- 入力形式は `scripts/gemini_template.json` を参照（`manga`カテゴリ追加済み、DB側0006適用待ち）
- 投入データは`status='ai_suggested'`（0007適用後は正式に非公開になる）
- Windows環境では `PYTHONIOENCODING=utf-8 PYTHONUTF8=1` を付けて実行すると文字化けしない

**承認フロー（--commit 後）:**
```powershell
python scripts/review_spots.py --list
python scripts/review_spots.py --approve <slug>
python scripts/review_spots.py --approve-all --yes
```
urllibでRemoteDisconnectedが出た場合は、`.env.local`の値を読み込んでcurlで直接PATCHする
（このセッションで何度も発生・回避済み、引き継ぎメモ内に手順の参考あり）。

## Remaining Work to Completion

### 最優先（次回これから）
1. GitHubリモート設定 + push（Codex経由・必須）。
2. push後にVercel環境変数設定 + デプロイ。
3. SPEC「もつ福 赤坂店（跡地）」の承認判断（2022年閉店、近隣グルメは六本木店紹介）。

### Phase 4: ページ・SEO（一部完了）
1. ✅ 詳細ページのコンポーネント分割・動的OGP画像対応済み
2. 日英コピー校正（未着手）
3. 404 / 空状態 / 取得失敗状態の最終確認（未着手）

### Phase 5: リリース準備（一部完了）
1. Mapbox live rendering確認 → 未実施
2. Supabase RLS と公開view → ✅ 0007適用済み（未承認スポット非公開を修正）
3. Lighthouse・アクセシビリティ・モバイル実機QA → 未実施
4. GitHubリモート設定 + push → 未実施（Codex経由で実行する運用）
5. Vercel環境変数設定 → push 後

### その他
- Geminiの「Gem」出力スキーマにYouTube関連3フィールド（youtube_url/youtube_channel_name/
  youtube_confirmed）を追記（ユーザー側でGemini Web UIの設定変更が必要）。
- 月夜行路3スポットの暫定座標を正確な値に更新。

## Next Best Action

**GitHubリモート設定 + push に進むこと。**
デザイン刷新・YouTube埋め込み機能ともに完了し、ビルドも安定している。次のマイルストーンは
リリース準備（push → Vercelデプロイ）。

## Suggested Next-Chat Prompt

```text
C:\Users\Haruki\Projects\MadPilgrim の作業を続けてください。

最初に MadPilgrim_引き継ぎメモ_2026-06-18.md をUTF-8で全文確認してください。
デザイン刷新（フォント/カラー）、デザイン品質向上5項目、YouTube公式動画埋め込み機能は完了済みです。
次はGitHubリモート設定 + push（必ずCodex経由で実行）に進んでください。

秘密情報や .env.local の内容は表示・コミットしないでください。
Codexの利用量制限に当たった場合、軽微な実装はClaude Codeが直接行っても構いません。
```
