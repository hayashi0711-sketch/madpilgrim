# MAD Pilgrim

映像作品のロケ地（聖地）を起点に、撮影場所・作品シーン・関連する食体験を案内する screen tourism Web サービス。

## Quick Start

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 --port 3002
```

`http://127.0.0.1:3002/ja` を開く。

## Routes

| パス | 内容 |
|---|---|
| `/ja` `/en` | LOCATION RECEIPT ダッシュボード（3カラム） |
| `/ja/spots/[slug]` | ロケ地詳細・SCENE RECEIPT |
| `/en/spots/[slug]` | 同上 英語版 |
| `/ja/foods/[spotSlug]` | 周辺の Screen-to-Table 食体験 |

## Environment

`.env.example` をコピーして `.env.local` に実際の値を設定:

```text
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx       # Mapbox GL JS トークン
NEXT_PUBLIC_SUPABASE_URL=https://xxx  # Supabase プロジェクト URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # サーバー専用（公開しない）
```

`.env.local` は `.gitignore` 済み。コミットしないこと。

## Supabase Migrations

```powershell
# Supabase CLI がある場合
supabase db push

# または Supabase ダッシュボードの SQL Editor で
# supabase/migrations/ 内の SQL を 0001 → 0005 の順に実行
```

マイグレーション一覧:

| ファイル | 内容 |
|---|---|
| `0001_initial.sql` | spots / nearby_foods テーブル・ビュー・RLS |
| `0002_spot_localized_names.sql` | 日英ロケール対応カラム追加 |
| `0003_wikidata_candidate_staging.sql` | Wikidata 候補ステージングテーブル |
| `0004_screen_tourism_content_model.sql` | 新コンテンツモデル（Work/Scene/FilmingLocation） |
| `0005_spot_broadcast_fields.sql` | broadcaster / release_year / scene_number 追加・seed |

## Build

```powershell
npm run build
npm run start
```

## Design Policy

- UI は「LOCATION RECEIPT」デザイン — monospace / Impact / oxblood red (#ff360b)
- filming-location tourism / screen tourism を軸にする
- 根拠のない周辺飲食店データは掲載しない
- 詳細は `docs/strategy_pivot.md` と `docs/scene_serve_design.md` を参照
