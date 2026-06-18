# MAD Pilgrim 引き継ぎメモ 2026-06-19

## Current State

MAD Pilgrim は、映像作品を起点に「シーン・ロケ地・作品に関連する食体験」を案内する Web サービスです。

最新のプロダクト方針は `docs/strategy_pivot.md` と `docs/scene_serve_design.md` を優先してください。

現在 Phase 3（コンテンツ信頼性）まで完了・確認済み。旧スポット（STEINS;GATE等）は非表示済み。5件の新スポットのみ表示。

## Workspace / Repository

- Workspace: `C:\Users\Haruki\Projects\MadPilgrim`
- Framework: Next.js 15 App Router / React 19 / TypeScript / Tailwind CSS
- Git branch: `master`
- Git状態: 初回コミット前。全プロジェクトファイルが未追跡。
- `.env.local` は存在するが、内容や秘密値を引き継ぎ文書へ記載しない。
- Dev server: `npm run dev -- --hostname 127.0.0.1 --port 3002`

主要ルート: `/ja` `/en` `/ja/spots/[slug]` `/en/spots/[slug]` `/ja/foods/[spotSlug]`

## Completed Work

### Phase 1: UI完成（完了）

**`src/types/mad-pilgrim.ts`**
- `Spot` 型に `sceneNumber?`, `broadcaster?`, `releaseYear?` を追加

**`src/data/sample-spots.ts`**
- 5件のロケ地（アンナチュラル/最愛/MIU404/君の名は。/呪術廻戦）と3件の nearbyFoods に更新
- ※ Supabase接続中はフォールバックのみ

**`src/components/LocationReceiptDashboard.tsx`**
- カード2行目: `releaseYear / broadcaster` 表示
- SCENE行: `sceneNumber` 対応（数値padStart / 日本語テキストそのまま）
- SELECTED バッジ（選択中カード）
- PLACE行: `spotName[locale]` 使用
- TRAVEL TIME: `♟` → `🚶`

**`src/app/globals.css`**
- `.receipt-selected-badge` 追加
- レスポンシブブレークポイント: `1100px` → `900px`

### Phase 2: 新データモデル接続（完了）

**`src/lib/spots-adapter.ts`**
- `PublicSpotRow` に `scene_number`, `broadcaster`, `release_year` 追加
- `toSpot()` に 3フィールドのマッピング追加
- `listNearbyFoodsForSpots(slugs)` 関数追加（複数スポットの食品データを一括取得）

**`supabase/migrations/0005_spot_broadcast_fields.sql`**（作成済み・適用済み）
- `public.spots` に `broadcaster`, `release_year`, `scene_number` カラム追加
- `public_spots` ビュー再作成
- 5件の新スポット seed SQL 含む（Supabase SQL Editor で適用済み）

### Phase 3: コンテンツ信頼性（コード完了・データ作業残り）

**`src/app/[locale]/page.tsx`**
- `listNearbyFoodsForSpots()` で全スポットの食品データを一括取得
- `foodsBySlug` を `LocationReceiptDashboard` へ渡す

**`src/components/LocationReceiptDashboard.tsx`**
- `foodsBySlug?: Record<string, NearbyFood[]>` prop 追加
- `primaryFood = selectedFoods[0]` で選択スポットの食品を動的表示
- DISH / VENUE / AVAILABLE / PRICE RANGE / SOURCE 行をデータ駆動に変更
- `googleMapsUrl` をフードデータから動的取得
- フッター `SPOTS VERIFIED`: `approvedCount / spots.length` で動的化

## Verification

```powershell
npm run build  # ✓ 成功（2026-06-19）
```

## Important Files

- `src/components/LocationReceiptDashboard.tsx` — LOCATION RECEIPT メイン画面
- `src/app/globals.css` — レイアウト・レスポンシブスタイル
- `src/app/[locale]/page.tsx` — RSC、spots + foodsBySlug を取得して渡す
- `src/data/sample-spots.ts` — フォールバック用サンプルデータ
- `src/types/mad-pilgrim.ts` — 現行フロント型
- `src/lib/spots-adapter.ts` — Supabase ↔ Spot/NearbyFood 型変換
- `supabase/migrations/0005_spot_broadcast_fields.sql` — 新カラム追加・ビュー再作成・seed

## Known Caveats

- **旧スポット（STEINS;GATE等）が Supabase に残っている** → 下記SQLで非表示にする必要がある
- `nearby_foods` Supabase テーブルに新スポット用データ未投入 → `sample-spots.ts` フォールバックで一部表示
- 最愛・呪術廻戦の食品データなし（フードパネルに "—" 表示）
- Unsplash画像を直接 `<img>` で使用（本番では要見直し）
- Gitは初回コミット前

## Remaining Work to Completion

### Phase 3: コンテンツ信頼性 ✅（完了）

1. ~~旧スポット非表示SQL実行~~ → 完了（STEINS;GATE等 → status=hidden）
2. `nearby_foods` Supabase テーブルに最愛・呪術廻戦の食品データを投入 → 任意（現状は "—" 表示で許容）
3. 画像利用権確認（Unsplash直リンクを本番用に差し替え）→ Phase 5 で対応

### Phase 4: ページ・SEO（未着手）

1. 詳細ページも Scene / Serve デザインへ統一
2. metadata, JSON-LD, hreflang, OG画像を新モデルへ対応
3. 日英コピー校正
4. 404 / 空状態 / 取得失敗状態を整備

### Phase 5: リリース準備（未着手）

1. Mapbox live rendering確認
2. Supabase RLS と公開view確認
3. Lighthouse・アクセシビリティ・モバイル実機QA
4. READMEとsetup文書を最新方針へ更新
5. 秘密情報が含まれていないことを確認
6. 初回Gitコミット → remote設定・push
7. Vercel環境変数設定 → preview deployment

## Next Best Action

**Phase 4（ページ・SEO）に着手する。**

詳細ページ（`/ja/spots/[slug]`）を Scene / Serve デザインに合わせてリデザインし、metadata / JSON-LD / hreflang を設定する。

## Suggested Next-Chat Prompt

```text
C:\Users\Haruki\Projects\MadPilgrim の作業を続けてください。

最初に MadPilgrim_引き継ぎメモ_2026-06-18.md をUTF-8で全文確認し、
docs/strategy_pivot.md と docs/scene_serve_design.md を優先方針として扱ってください。

Phase 1〜3 は完了済みです。Phase 4（ページ・SEO）として、
詳細ページ /ja/spots/[slug] を Scene / Serve デザインに合わせてリデザインし、
metadata / JSON-LD / hreflang を設定してください。

秘密情報や .env.local の内容は表示・コミットしないでください。
Gitはまだ初回コミット前です。
```
