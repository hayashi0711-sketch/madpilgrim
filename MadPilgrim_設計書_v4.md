# アプリケーション概要設計書：MAD Pilgrim
**〜AI自律駆動型 聖地・ロケ地巡礼 Webサービス〜**

**バージョン:** v4.0  
**最終更新:** 2026年6月  
**ステータス:** MVP設計フェーズ  
**プラットフォーム方針:** Webサイト専用（PWAなし）  
**サービス名:** MAD Pilgrim（マッドピルグリム）  
**コンセプト:** 狂信的なほど愛するファンが、聖地へ向かう

---

## 0. プロダクトビジョン

### サービス名の由来

| 要素 | 意味 |
|---|---|
| **MAD** | 「〜に夢中・狂信的に愛する」（英語慣用句 "mad about"）＋ 日本のファン文化の熱量 |
| **Pilgrim** | 巡礼者。聖地・ロケ地を訪れるファンそのものを指す |
| **組み合わせ** | 「作品に狂おしいほど愛を持つ巡礼者のためのサービス」 |

インバウンド向けには "mad about anime / mad about Japan" という英語慣用句と自然に接続し、説明不要で意味が伝わります。

### コアコンセプト
> **「聖地は、あなたが着く前から、あなたを待っている」**

### ターゲットユーザー

| セグメント | ペルソナ | ニーズ |
|---|---|---|
| コアファン層 | 国内アニメ・アーティストオタク（18〜35歳） | 聖地を深掘り・他ファンと繋がりたい |
| インバウンド観光客 | 東南アジア・欧米のJカルチャーファン | 言語の壁なくロケ地を楽しみたい |
| カジュアル層 | 旅行好きな一般ユーザー（20〜40代） | 旅先で偶然の聖地発見を楽しみたい |
| B2B | 自治体・観光協会・飲食店オーナー | 来客増・インバウンド集客 |

---

## 1. システム全体アーキテクチャ

```
[Web/SNS/ブログ/YouTube/海外プラットフォーム]
          │
          ▼ (Crawl)
  [Python: Scrapy / Playwright / yt-dlp]
          │
          ▼
  [LLM パイプライン (Gemini API ※低コスト)]
     ├─ 聖地データ 構造化JSON抽出
     ├─ 多言語説明文生成（日英韓中）
     ├─ SEOタイトル生成
     └─ 安全性・信頼度スコアリング
          │
          ▼
  [Google Maps Geocoding API]
  [Google Places API（周辺グルメ取得）]
          │
          ▼
  [Supabase (PostgreSQL + PostGIS + pgvector)]
     ├─ Realtime WebSocket（新着ピンをWebへ即時配信）
     └─ Row Level Security（認証・権限管理）
          │
          ▼
  [Next.js 15 App Router（Webフロントエンド）]
     ├─ SSG/ISR による SEOページ自動生成
     ├─ インタラクティブ地図（Mapbox GL JS）
     ├─ 多言語UI（next-intl：日英韓中）
     ├─ 周辺グルメパネル
     └─ 収益化モジュール群
          │
          ▼
  [Vercel（ホスティング＋Edge Functions）]
```

---

## 2. AIデータパイプライン設計

### フェーズ1：データ収集（Extract）

GitHub Actions Cron（無料枠）で定期実行します。

**ターゲットソース:**

| ソースタイプ | 対象 | 優先度 |
|---|---|---|
| プレスリリース | PR TIMES・各レーベル公式 | 高 |
| SNS | X「#聖地巡礼」「#ロケ地」「#filming_location」 | 高 |
| 動画プラットフォーム | YouTube MV概要欄・高評価コメント | 中 |
| アニメ公式サイト | 舞台探訪・スタッフ日記 | 高 |
| 海外ファンサイト | MyAnimeList / AniList / Koreaboo / Weibo | 中 |
| グルメ情報 | Google Places API（聖地周辺500m以内を自動取得） | 高 |

**YouTube解析:**
`yt-dlp` で自動字幕・説明欄を取得し「撮影協力：〇〇」「ロケ地：〇〇」パターンを抽出。

### フェーズ2：AI構造化解析（Transform - 1）

**※ コスト戦略: Gemini 1.5 Flash（無料枠 or 低価格）をメインLLMとして使用**

```text
あなたは聖地・ロケ地情報の構造化エンジンです。
以下のJSON形式でのみ出力してください。

【制約ルール】
- 確証の持てない情報は空文字にしてください。
- 個人宅・学校敷地内・立入禁止区域は "is_safe": false にしてください。
- 信頼度スコアは 0.0〜1.0 で評価してください。
- description_* は各言語で自然にリライトしてください（直訳不可）。
- seo_title_* はGoogle検索を意識したタイトルにしてください。

【出力JSONフォーマット】
{
  "title": "作品名またはアーティスト名",
  "category": "anime" | "mv" | "drama" | "movie" | "cm",
  "spot_name": "ロケ地・聖地となった場所名",
  "raw_address": "住所（判明している場合のみ）",
  "description_ja": "エピソード（100文字程度）",
  "description_en": "English description",
  "description_ko": "한국어 설명",
  "description_zh": "中文说明",
  "seo_title_ja": "例：「呪術廻戦 渋谷駅スクランブル交差点のロケ地・聖地情報」",
  "seo_title_en": "SEO title for English search",
  "visit_tips_ja": "訪問時の注意点・おすすめ時間帯",
  "scene_timestamp": "第X話 or mm:ss",
  "confidence_score": 0.0〜1.0,
  "source_type": "official" | "fan" | "social" | "inferred",
  "is_safe": true | false
}
```

### フェーズ3：ジオコーディング・周辺グルメ取得・重複排除（Transform - 2）

1. Google Maps Geocoding API で座標化
2. pgvectorによる意味的重複排除（コサイン類似度 > 0.92）
3. 座標中心・半径500mでGoogle Places APIを叩き周辺飲食店を`nearby_foods`へ自動挿入

**バリデーションロジック:**

| 条件 | アクション |
|---|---|
| `is_safe: false` | 即時破棄 |
| `confidence_score < 0.4` | `status = 'unverified'` 保留キューへ |
| 半径5m以内 or ベクトル類似度 > 0.92 | 既存レコードへマージ |
| `confidence_score >= 0.8` かつ `source_type = 'official'` | `status = 'approved'` で直接公開 |
| 上記以外 | `status = 'ai_suggested'` で仮公開 |

### フェーズ4：自動反映（Load）

Supabase Realtimeでマップ上のピンを即時更新。新着は1分あたり最大3件のペースで流量制御します。

---

## 3. データベース設計

**使用拡張:** PostGIS（地理空間）・pgvector（意味的類似検索）

### spots テーブル（聖地メインデータ）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PRIMARY KEY | 固有ID |
| title | VARCHAR(255) | NOT NULL | 作品名 / アーティスト名 |
| category | VARCHAR(50) | NOT NULL | 'anime'/'mv'/'drama'/'movie'/'cm' |
| spot_name | VARCHAR(255) | NOT NULL | 聖地・スポットの名称 |
| slug | VARCHAR(255) | UNIQUE NOT NULL | URLスラッグ（SEO用） |
| geom | GEOGRAPHY(Point, 4326) | NOT NULL | 緯度・経度 |
| description_ja | TEXT | | 日本語エピソード |
| description_en | TEXT | | 英語エピソード |
| description_ko | TEXT | | 韓国語エピソード |
| description_zh | TEXT | | 中国語エピソード |
| seo_title_ja | VARCHAR(255) | | 日本語SEOタイトル |
| seo_title_en | VARCHAR(255) | | 英語SEOタイトル |
| visit_tips_ja | TEXT | | 訪問アドバイス |
| scene_timestamp | VARCHAR(20) | | 「第3話 12:34」等 |
| embedding | VECTOR(1536) | | pgvector重複排除用 |
| confidence_score | FLOAT | DEFAULT 0.5 | AI信頼度スコア |
| source_type | VARCHAR(20) | | 'official'/'fan'/'social'/'inferred' |
| status | VARCHAR(20) | DEFAULT 'ai_suggested' | 'unverified'/'ai_suggested'/'approved'/'hidden' |
| approve_count | INTEGER | DEFAULT 0 | 承認投票数 |
| report_count | INTEGER | DEFAULT 0 | 通報数 |
| view_count | INTEGER | DEFAULT 0 | 閲覧数 |
| og_image_url | TEXT | | OGP画像URL（SNSシェア用） |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 登録日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

### nearby_foods テーブル（周辺グルメ情報）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PRIMARY KEY | 固有ID |
| spot_id | UUID | REFERENCES spots(id) | 紐づく聖地ID |
| place_id | VARCHAR(255) | | Google Place ID |
| name | VARCHAR(255) | NOT NULL | 店舗名 |
| category | VARCHAR(100) | | 'ramen'/'cafe'/'izakaya'/'sweets'等 |
| geom | GEOGRAPHY(Point, 4326) | | 店舗位置 |
| address | TEXT | | 住所 |
| rating | FLOAT | | Googleレビュー評点 |
| price_level | INTEGER | | 価格帯（1〜4） |
| opening_hours | JSONB | | 営業時間 |
| photo_reference | TEXT | | Google Photos参照キー |
| website_url | TEXT | | 公式URL |
| google_maps_url | TEXT | | Googleマップリンク |
| description_ja | TEXT | | AI生成の日本語紹介文 |
| description_en | TEXT | | 英語紹介文 |
| description_ko | TEXT | | 韓国語紹介文 |
| description_zh | TEXT | | 中国語紹介文 |
| is_sponsored | BOOLEAN | DEFAULT false | スポンサー掲載フラグ |
| sponsor_rank | INTEGER | | スポンサー表示順位 |
| last_synced_at | TIMESTAMPTZ | | Places API最終同期日時 |

### user_reviews テーブル（ユーザー口コミ）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PRIMARY KEY | 口コミID |
| spot_id | UUID | REFERENCES spots(id) | 紐づく聖地ID |
| user_id | UUID | NOT NULL | 投稿ユーザーID |
| comment | TEXT | NOT NULL | 口コミ本文 |
| image_url | TEXT | | 現地撮影写真URL |
| lang | VARCHAR(5) | DEFAULT 'ja' | 投稿言語 |
| helpful_count | INTEGER | DEFAULT 0 | 役に立った票数 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 投稿日時 |

### pilgrimage_routes テーブル（巡礼ルート）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PRIMARY KEY | ルートID |
| title | VARCHAR(255) | NOT NULL | ルート名 |
| slug | VARCHAR(255) | UNIQUE NOT NULL | URLスラッグ |
| spot_ids | UUID[] | NOT NULL | 巡回スポットID配列（順序付き） |
| created_by | VARCHAR(20) | | 'ai' または ユーザーID |
| total_distance_km | FLOAT | | 総移動距離 |
| estimated_hours | FLOAT | | 推定所要時間 |
| transport_mode | VARCHAR(20) | | 'walk'/'transit'/'drive' |
| description_ja | TEXT | | ルート説明（日本語） |
| description_en | TEXT | | ルート説明（英語） |
| save_count | INTEGER | DEFAULT 0 | 保存数 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

### sponsored_listings テーブル（収益管理）

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PRIMARY KEY | 掲載ID |
| type | VARCHAR(30) | NOT NULL | 'food_sponsor'/'regional_pr'/'official_partner' |
| target_id | UUID | | spots/nearby_foods のID |
| sponsor_name | VARCHAR(255) | | 広告主名 |
| contract_start | DATE | | 掲載開始日 |
| contract_end | DATE | | 掲載終了日 |
| monthly_fee | INTEGER | | 月額料金（円） |
| impression_count | INTEGER | DEFAULT 0 | 表示回数 |
| click_count | INTEGER | DEFAULT 0 | クリック数 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 登録日時 |

---

## 4. フロントエンド（Webサイト）機能要件

### 技術スタック

| レイヤー | 採用技術 | 理由 |
|---|---|---|
| フレームワーク | Next.js 15 App Router | SSG/ISR でSEO最強、Edge対応 |
| 言語 | TypeScript | 型安全 |
| 地図 | Mapbox GL JS | WebGL高速描画・無料枠あり |
| スタイリング | Tailwind CSS + shadcn/ui | 高速開発・Codexとの相性◎ |
| 国際化 | next-intl | 日英韓中の自動ルーティング |
| 認証 | Supabase Auth（Google/X/メール） | 無料枠で十分 |
| 決済 | Stripe | サブスク・スポンサー課金 |
| アナリティクス | Vercel Analytics（無料）+ GA4 | 収益最適化のデータ基盤 |
| ホスティング | Vercel（無料Hobbyプラン → 必要に応じてPro） | 自動デプロイ・CDN |

---

### ① SEO最適化ページ自動生成（集客の柱）

AIパイプラインがデータを追加するたびにNext.js ISRが自動でSEOページを生成します。

**URL構造:**

```
/[lang]/spots/[slug]
  例：/ja/spots/jujutsu-kaisen-shibuya-scramble
  例：/en/spots/jujutsu-kaisen-shibuya-scramble

/[lang]/works/[work-slug]
  例：/ja/works/kimetsu-no-yaiba（作品別 全聖地一覧）

/[lang]/regions/[prefecture]/[city]
  例：/ja/regions/tokyo/shibuya（地域別 聖地一覧）

/[lang]/routes/[slug]
  例：/en/routes/kyoto-anime-pilgrimage-1day

/[lang]/foods/[spot-slug]
  例：/ja/foods/jujutsu-kaisen-shibuya（スポット周辺グルメ）
```

**各ページの自動SEO設定:**
- `<title>` / `<meta description>` → AIが生成したSEOタイトルを使用
- `hreflang` タグ → next-intlが4言語分を自動出力
- JSON-LD構造化データ → `TouristAttraction` / `LocalBusiness` スキーマを自動付与
- サイトマップ → spotデータ増加に連動して自動更新

---

### ② リアルタイム・マルチレイヤーマップ

**ピン種別:**

| ステータス | ピン色 | 説明 |
|---|---|---|
| `unverified` | グレー（半透明） | AI発見・信頼度低 |
| `ai_suggested` | シルバー | AI発見・仮公開 |
| `approved` | ゴールド | コミュニティ承認済み |
| 新着（30分以内） | パルスアニメーション | 生きている情報感を演出 |
| グルメ | オレンジ | 周辺飲食店ピン |

**フィルタリング:**
「すべて」「アニメ」「MV」「ドラマ」「映画」「CM」＋「グルメも表示」＋「承認済みのみ」

**Webならではの機能:**
- URLシェアで現在の地図表示状態（中心座標・ズーム・フィルタ）を再現可能
- 埋め込みiframeコードの発行（ファンサイト・地域観光サイトへの埋め込み）

---

### ③ 周辺グルメ機能

聖地詳細ページの下部に「この聖地の近くで食べる」セクションを設置。

**表示ロジック:**
1. spot.geom 中心・半径500m以内の nearby_foods を取得
2. `is_sponsored: true` の店舗を最上位に表示
3. 残りはGoogleレビュー rating 降順で最大10件

**グルメカードの要素:**
- 店舗写真・★評価・価格帯・営業時間・Googleマップリンク
- AI生成の多言語紹介文
- 「PR」バッジ（スポンサー店舗に明示）

**インバウンド対応:**
- 英語メニューの有無・クレジットカード対応・Halal対応タグ

---

### ④ 多言語対応・インバウンド機能

**言語ルーティング（next-intl）:**
```
ブラウザ言語 en → /en/ へ自動リダイレクト
ブラウザ言語 ko → /ko/ へ自動リダイレクト
ブラウザ言語 zh → /zh/ へ自動リダイレクト
デフォルト    → /ja/
```

**翻訳フォールバック:**
```
description_{lang} が存在 → ネイティブテキストを表示
存在しない場合 → DeepL API でリアルタイム翻訳（結果をDBにキャッシュ）
```

**インバウンド向けアクセス情報パネル:**
- 最寄り駅からの徒歩ルート
- 入場料・営業時間
- 英語・クレジットカード・Wi-Fi対応状況
- 近隣のコンビニ・トイレ・ATM

---

### ⑤ コミュニティ機能

| ボタン | 効果 |
|---|---|
| ⭐「あってる！」 | 累計10票で `status = 'approved'`・ピンがゴールドに昇格 |
| 📸「写真を投稿」 | 現地写真投稿でコミュニティ信頼度アップ |
| ⚠️「違う・危険」 | 累計5票で自動非表示・運営レビューへ |

**AI巡礼ルート自動生成:**
- 「今いる場所」「移動手段」「観たい作品」「利用時間」を入力
- AIが最適ルートを生成しシェアURLを発行（SNS拡散→集客）

---

## 5. 収益モデル設計

### 収益構造全体図

```
[自然検索流入（SEO）] → [SNSシェア流入] → [インバウンド直接アクセス]
          │
          ▼
  ① ディスプレイ広告（Google AdSense）
  ② プレミアム会員サブスクリプション
  ③ 周辺グルメ スポンサー掲載
  ④ 公式パートナー・自治体タイアップ
  ⑤ アフィリエイト（旅行予約・ホテル）
  ⑥ データ提供（匿名集計）
  ⑦ 地図埋め込みライセンス
```

### ① ディスプレイ広告（最速で収益化）

- Google AdSense：聖地詳細ページの記事下・サイドバー
- 月間PV 10万超を目標（アニメ聖地系は検索ボリュームが高い）
- インバウンド向けページはCPMが高い（訪日観光客ターゲット広告ニーズ大）

### ② プレミアム会員サブスクリプション

| プラン | 月額 | 主な特典 |
|---|---|---|
| Free | 無料 | 基本マップ閲覧・口コミ閲覧 |
| Premium | ¥480 | 広告非表示・高度フィルタ・先行公開スポット |
| Inbound Premium | $3.99 | 英語UI完全対応・多言語ルート生成 |

### ③ 周辺グルメ スポンサー掲載

| プラン名 | 月額 | 掲載内容 |
|---|---|---|
| ベーシック掲載 | ¥5,000/月 | グルメリスト上位3位以内に表示 |
| プレミアム掲載 | ¥15,000/月 | 最上位固定＋「PR」バッジ＋クーポン表示 |
| インバウンドPRプラス | ¥25,000/月 | 上記＋4言語対応紹介文AI生成 |

### ④ 公式パートナー・自治体タイアップ

- アニメ制作会社・レーベルとの公式提携（月額¥50,000〜¥200,000）
- 自治体・観光協会との地域PR特設ページ制作

### ⑤ アフィリエイト

| プログラム | 紹介先 | 報酬 |
|---|---|---|
| 楽天トラベル | 周辺ホテル・旅館 | 予約額の1〜3% |
| Booking.com | インバウンド向けホテル | 予約額の3〜6% |
| KKday / Klook | 体験ツアー・観光スポット | 販売額の3〜8% |
| Amazonアソシエイト | 作品Blu-ray・グッズ | 3〜5% |

### ⑥ 匿名データ提供

| データ種別 | 提供先 | 価格帯 |
|---|---|---|
| 聖地訪問ヒートマップ（月次） | 自治体・観光協会 | ¥30,000〜¥100,000/月 |
| インバウンド訪問傾向レポート | JNTO・旅行代理店 | ¥50,000〜¥200,000/回 |

### ⑦ 地図埋め込みライセンス

| ライセンス | 月額 | 対象 |
|---|---|---|
| 個人・ファンサイト | 無料（広告表示あり） | ファンコミュニティ |
| 商用サイト | ¥3,000/月 | メディア・観光サイト |
| 自治体・公共機関 | 要見積もり | 観光協会HP等 |

### 収益KPIロードマップ

| フェーズ | 目標月間PV | 目標月間収益 | 主要収益源 |
|---|---|---|---|
| Phase 1（〜3ヶ月） | 5,000 | ¥5,000〜¥15,000 | AdSense |
| Phase 2（〜6ヶ月） | 30,000 | ¥30,000〜¥80,000 | AdSense＋グルメスポンサー |
| Phase 3（〜12ヶ月） | 100,000 | ¥150,000〜¥400,000 | 全収益源稼働 |
| Phase 4（1年以上） | 500,000+ | ¥800,000〜¥2,000,000 | タイアップ・データ販売が主力 |

---

## 6. 技術スタック整理

| レイヤー | 技術選定 | 月額コスト目安 |
|---|---|---|
| Webフロントエンド | Next.js 15 App Router + TypeScript | 無料 |
| スタイリング | Tailwind CSS + shadcn/ui | 無料 |
| 地図 | Mapbox GL JS | 無料枠（5万MAU）→超過後$0.50/1000リクエスト |
| 国際化 | next-intl | 無料 |
| バックエンドDB | Supabase（PostgreSQL + PostGIS + pgvector） | 無料枠→Pro $25/月 |
| 認証 | Supabase Auth | 無料枠に含む |
| AIパイプライン LLM | Gemini 1.5 Flash API | 無料枠大→超過後激安 |
| スクレイピング | Python（Scrapy + Playwright） | 無料 |
| 実行基盤 | GitHub Actions（Cron） | 無料枠（2000分/月） |
| 地図・ジオコーディング | Google Maps Platform | $200/月クレジット（無料枠） |
| グルメ情報 | Google Places API | 上記クレジットに含む |
| 翻訳 | DeepL API Free枠 → 超過後Pro | 無料枠→¥2,750/月〜 |
| 決済 | Stripe | 手数料3.6%のみ（固定費なし） |
| ホスティング | Vercel Hobby（無料）→ Pro $20/月 | 無料〜$20 |
| アナリティクス | Vercel Analytics + GA4 | 無料 |

**MVP期の月額固定費：ほぼ¥0〜¥3,000程度**（トラフィック増加後に段階的にスケール）

---

## 7. 開発ロードマップ

### Phase 1：Webサイト＋静的DB構築（1〜1.5ヶ月）

- Next.js プロジェクト立ち上げ（多言語ルーティング込み）
- Supabase セットアップ（PostGIS・pgvector有効化）
- 手動収集した聖地データ100件をCSVでインポートし、マップ表示テスト
- 聖地詳細ページのSSG化・SEOメタタグ設定
- Google AdSense 申請

### Phase 2：AIパイプライン＋グルメ機能（1〜1.5ヶ月）

- Pythonスクレイピング → Gemini構造化 → Geocoding → DB挿入の自動化
- Google Places APIによる周辺グルメ情報の自動取得・紐付け
- Supabase Realtimeによるピン自動増殖
- グルメスポンサー掲載の受付開始

### Phase 3：コミュニティ・収益化フル稼働（1〜1.5ヶ月）

- ユーザー口コミ投稿・写真アップロード
- 「あってる！」投票 → ピン昇格ロジック
- Stripe連携によるプレミアム会員プランのリリース
- アフィリエイト掲載の本格稼働

### Phase 4：スケール・B2B展開（1〜2ヶ月）

- AI巡礼ルート自動生成のリリース
- 自治体・観光協会向け掲載プランの営業開始
- 地図埋め込みライセンスの外部販売
- 匿名データレポートの商品化

---

## 8. リスク管理・倫理ガイドライン

| リスク | 対策 |
|---|---|
| 個人宅・学校敷地内への迷惑訪問 | `is_safe: false` 即時破棄＋通報機能＋初回アクセス時マナーガイドモーダル表示 |
| スクレイピングによる著作権問題 | 公開情報のみ収集・robots.txt遵守・AIによるリライト（原文保存なし） |
| AI生成の誤情報拡散 | 信頼度スコアの可視化・コミュニティ検証・`unverified`ステータスの明示 |
| グルメ情報の陳腐化（閉店等） | Google Places API週次再同期＋ユーザー通報で即時フラグ |
| スポンサー表示の透明性 | `is_sponsored: true` の店舗は必ず「PR」バッジを明示（景品表示法遵守） |
| インバウンド集中による過密 | 「分散型聖地推薦」モード開発（混雑ピン回避ルート提案）をPhase 4で実装 |
| 個人情報（位置情報） | 位置情報はブラウザローカルで処理、サーバーへは匿名化統計データのみ送信 |
