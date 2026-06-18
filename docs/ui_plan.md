# MadPilgrim MVP UI / Next.js Implementation Draft

Scope: UI/Next.js draft only. Do not revert or overwrite implementation work by the main Codex agent.

## 1. MVP画面構成

MVPの初回実装対象は、検索流入と現地利用の両方に直結する3画面に限定する。

| 画面 | 想定ルート | 目的 | MVP要素 |
|---|---|---|---|
| ホーム兼マップ | `/[lang]` | 聖地を地図から探す入口 | Mapbox全画面、カテゴリフィルタ、検索、スポットプレビュー、現在地ボタン、言語切替 |
| スポット詳細 | `/[lang]/spots/[slug]` | SEO流入と巡礼判断 | ヒーロー画像、作品/カテゴリ、信頼度、説明、訪問Tips、地図ミニビュー、投票/通報導線 |
| スポット周辺グルメ | `/[lang]/foods/[spot-slug]` または詳細内タブ | 訪問後の行動と収益化 | 周辺500mリスト、PR明示、評価/価格/営業時間、Google Mapsリンク、多言語タグ |

実装メモ:
- App Routerは `app/[lang]/page.tsx`, `app/[lang]/spots/[slug]/page.tsx`, `app/[lang]/foods/[spotSlug]/page.tsx` を基本形にする。
- Mapbox GL JSはクライアントコンポーネントに閉じ込め、SSRページ本体はSEOメタと静的データ表示を優先する。
- next-intl想定で、UI文言は `messages/{ja,en,ko,zh}.json` に逃がせる粒度で設計する。

## 2. 主要コンポーネント分割

### Layout / Shell
- `AppHeader`: ロゴ、検索、言語切替、現在地/マップ復帰。
- `MobileBottomNav`: マップ、詳細、グルメなどの主要導線。MVPではホームと詳細回遊に限定。
- `LocaleSwitcher`: `ja/en/ko/zh` の切替。URL localeを維持。

### Map
- `MapCanvas`: Mapbox初期化、ピン描画、viewport同期。
- `MapControls`: カテゴリフィルタ、承認済みのみ、グルメ表示トグル。
- `SpotMarker`: `unverified`, `ai_suggested`, `approved`, `new`, `food` の状態別ピン。
- `SpotPreviewSheet`: ピン選択時の下部シート。スポット名、作品名、距離、詳細リンク。

### Spot Detail
- `SpotHero`: OGP/モック画像、カテゴリバッジ、作品名、スポット名。
- `TrustBadge`: 信頼度スコア、source type、承認状態を短く表示。
- `SpotStory`: 多言語説明、scene timestamp、訪問Tips。
- `AccessPanel`: 最寄り駅、徒歩目安、営業時間/料金などのインバウンド向け情報。
- `CommunityActions`: 「あってる」「写真投稿」「違う・危険」。MVPはUIのみでも可。
- `MiniMap`: スポット位置の小型地図。

### Foods
- `FoodSection`: スポット詳細下部のグルメ抜粋。
- `FoodListPage`: グルメ専用ページ。スポンサー上位、通常店舗はrating降順。
- `FoodCard`: 写真、PRバッジ、評価、価格帯、営業時間、タグ、Google Mapsリンク。
- `FoodFilterBar`: カフェ/ラーメン/居酒屋/スイーツ、英語メニュー、カード、Halalなど。

### Shared UI
- `CategoryBadge`, `StatusDot`, `RatingStars`, `PriceLevel`, `DistanceLabel`, `ShareButton`, `SkeletonPanel`, `EmptyState`。

## 3. 画像モック生成が必要な3画面のプロンプト案

### ホーム兼マップ
```text
Create a polished desktop and mobile web app mockup for "MAD Pilgrim", an anime and filming-location pilgrimage map service in Japan. The first screen is a full-bleed interactive map of Tokyo with elegant gold, silver, gray, and orange pins, compact filter chips for Anime, MV, Drama, Movie, CM, and food. Include a bottom spot preview sheet on mobile and a side preview panel on desktop. The UI should feel like a serious travel utility for passionate fans, not a marketing landing page. Use clean Japanese/English mixed labels, restrained colors, high readability, Mapbox-like map detail, no fantasy elements.
```

### スポット詳細
```text
Create a responsive web page mockup for a MAD Pilgrim spot detail page. Show a cinematic but realistic hero photo placeholder of a famous urban Japan crossing/station area, then structured detail content: work title, spot name, category badge, confidence/trust badge, scene timestamp, visit tips, community action buttons, and a small embedded map. The layout should be SEO-friendly, dense but elegant, mobile-first, with clear Japanese UI and optional English locale switch. Avoid oversized marketing hero text; make it feel like a practical pilgrimage guide.
```

### スポット周辺グルメ
```text
Create a responsive web app mockup for a MAD Pilgrim "food near this pilgrimage spot" page. Show a compact header with the related spot name, a small map strip, and a ranked list of nearby restaurants within 500m. Food cards include real-photo placeholders, PR badge when sponsored, star rating, price level, opening hours, tags like English menu, credit card, halal, and a Google Maps button. The design should be clean, travel-focused, trustworthy, and useful for inbound visitors in Japan.
```

## 4. CodexからCursorへ渡す軽微修正指示テンプレート

```text
MadPilgrim MVPの軽微修正をお願いします。

対象:
- ファイル:
- 画面:
- 現象:

修正方針:
- 既存のNext.js App Router / TypeScript / Tailwind構成を維持してください。
- UI仕様は docs/ui_plan.md に合わせてください。
- メイン実装中の変更を戻さず、指定箇所以外のリファクタは避けてください。
- Mapbox初期化やnext-intlのルーティングに影響する変更は最小限にしてください。

完了条件:
- TypeScriptエラーが増えていないこと。
- モバイル幅375pxとデスクトップ幅1440pxでテキストやボタンが重ならないこと。
- PR/スポンサー表示、信頼度表示、危険/通報導線などの明示が消えていないこと。

確認コマンド:
- npm run build
- 必要なら npm run dev で該当画面を目視確認
```

## 5. 3日間のUI作業順

### Day 1: 土台とホーム兼マップ
- Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui相当の最小構成を確定。
- `app/[lang]` ルーティングとメッセージ構造を用意。
- ダミー `spots` データで `MapCanvas`, `SpotMarker`, `SpotPreviewSheet`, `MapControls` を実装。
- モバイルでは下部シート、デスクトップでは右/左サイドパネルでスポット概要を表示。

### Day 2: スポット詳細
- `/[lang]/spots/[slug]` の静的詳細ページを作る。
- `SpotHero`, `TrustBadge`, `SpotStory`, `AccessPanel`, `CommunityActions`, `MiniMap` を配置。
- SEOメタ、JSON-LDの差し込み口を用意する。
- `unverified`, `ai_suggested`, `approved` の見え方をUIで確認。

### Day 3: 周辺グルメと仕上げ
- `/[lang]/foods/[spotSlug]` と詳細ページ内 `FoodSection` を作る。
- `FoodCard`, `FoodFilterBar`, PRバッジ、Google Mapsリンクを実装。
- 375px/768px/1440pxでレスポンシブ確認。
- `npm run build` を通し、画像モック差し替え前でも破綻しないSkeleton/placeholderを整える。

## Notes

- MVPではコミュニティ投稿、写真アップロード、投票処理、スポンサー課金処理はUIの入口だけでよい。
- データ取得はまず静的モックまたはSupabase接続用の薄いadapterを想定し、画面コンポーネントとDB実装を密結合しない。
- 個人宅/学校/立入禁止などの安全性表示と通報導線は、MVP段階でも削らない。
