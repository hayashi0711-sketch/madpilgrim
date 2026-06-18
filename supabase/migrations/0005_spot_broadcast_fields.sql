-- Add broadcaster, release_year, scene_number to spots table
alter table public.spots add column if not exists broadcaster text;
alter table public.spots add column if not exists release_year integer;
alter table public.spots add column if not exists scene_number varchar(80);

-- Recreate public_spots view to expose new columns
drop view if exists public.public_spots;

create view public.public_spots
with (security_invoker = true)
as
select
  id::text,
  title,
  title_en,
  category,
  spot_name,
  spot_name_en,
  slug,
  prefecture,
  city,
  st_y(geom::geometry) as latitude,
  st_x(geom::geometry) as longitude,
  description_ja,
  description_en,
  description_ko,
  description_zh,
  seo_title_ja,
  seo_title_en,
  visit_tips_ja,
  visit_tips_en,
  scene_timestamp,
  scene_timestamp_en,
  scene_number,
  broadcaster,
  release_year,
  confidence_score,
  source_type,
  status,
  og_image_url,
  created_at,
  updated_at
from public.spots
where status in ('ai_suggested', 'approved');

grant select on public.public_spots to anon, authenticated;

-- Seed: insert/update the 5 reference-image spots
-- アンナチュラル
insert into public.spots (
  slug, title, title_en, category, spot_name, spot_name_en,
  prefecture, city, geom,
  description_ja, description_en,
  seo_title_ja, seo_title_en,
  visit_tips_ja, visit_tips_en,
  scene_timestamp, scene_timestamp_en, scene_number,
  broadcaster, release_year,
  confidence_score, source_type, status
) values (
  'unnatural-nihonbashi',
  'アンナチュラル', 'Unnatural',
  'drama',
  '中央区 東日本橋', 'Chuo Nihonbashi',
  'tokyo', 'chuo',
  st_setsrid(st_makepoint(139.7836, 35.6893), 4326)::geography,
  '法医解剖医チームが真実を追うシーン。東日本橋の倉庫街が緊迫した夜の撮影地として使用された。建物外観・照明・路地の構成が劇中と一致。',
  'Forensic team night chase scene. The Nihonbashi warehouse district exterior and alley layout match the episode.',
  'アンナチュラル 東日本橋ロケ地情報', 'Unnatural Tokyo Filming Location Guide',
  '倉庫街のため夜間は照明が少ない。昼間の訪問を推奨。', 'Limited street lighting at night. Daytime visits recommended.',
  '23:41', '23:41', '12',
  'TBS', 2018,
  0.97, 'official', 'approved'
)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en,
  category = excluded.category,
  spot_name = excluded.spot_name, spot_name_en = excluded.spot_name_en,
  prefecture = excluded.prefecture, city = excluded.city, geom = excluded.geom,
  description_ja = excluded.description_ja, description_en = excluded.description_en,
  seo_title_ja = excluded.seo_title_ja, seo_title_en = excluded.seo_title_en,
  visit_tips_ja = excluded.visit_tips_ja, visit_tips_en = excluded.visit_tips_en,
  scene_timestamp = excluded.scene_timestamp, scene_timestamp_en = excluded.scene_timestamp_en,
  scene_number = excluded.scene_number,
  broadcaster = excluded.broadcaster, release_year = excluded.release_year,
  confidence_score = excluded.confidence_score, source_type = excluded.source_type,
  status = excluded.status, updated_at = now();

-- 最愛
insert into public.spots (
  slug, title, title_en, category, spot_name, spot_name_en,
  prefecture, city, geom,
  description_ja, description_en,
  seo_title_ja, seo_title_en,
  visit_tips_ja, visit_tips_en,
  scene_timestamp, scene_timestamp_en, scene_number,
  broadcaster, release_year,
  confidence_score, source_type, status
) values (
  'saiai-daiba',
  '最愛', 'Saiai',
  'drama',
  '港区 台場', 'Minato Daiba',
  'tokyo', 'minato',
  st_setsrid(st_makepoint(139.7753, 35.6275), 4326)::geography,
  '台場の夜景を背景に展開するサスペンスシーン。複数話にわたりロケ地として使用された屋外エリア。',
  'Waterfront Daiba used for key suspense scenes across multiple episodes. Outdoor terrace matches the frame.',
  '最愛 台場ロケ地情報', 'Saiai Daiba Filming Location Guide',
  '夕方以降のライトアップ時間帯が撮影シーンの雰囲気に最も近い。', 'Evening illumination hours most closely match the filmed atmosphere.',
  '16:18', '16:18', '05',
  'TBS', 2021,
  0.95, 'official', 'approved'
)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en,
  category = excluded.category,
  spot_name = excluded.spot_name, spot_name_en = excluded.spot_name_en,
  prefecture = excluded.prefecture, city = excluded.city, geom = excluded.geom,
  description_ja = excluded.description_ja, description_en = excluded.description_en,
  seo_title_ja = excluded.seo_title_ja, seo_title_en = excluded.seo_title_en,
  visit_tips_ja = excluded.visit_tips_ja, visit_tips_en = excluded.visit_tips_en,
  scene_timestamp = excluded.scene_timestamp, scene_timestamp_en = excluded.scene_timestamp_en,
  scene_number = excluded.scene_number,
  broadcaster = excluded.broadcaster, release_year = excluded.release_year,
  confidence_score = excluded.confidence_score, source_type = excluded.source_type,
  status = excluded.status, updated_at = now();

-- MIU404
insert into public.spots (
  slug, title, title_en, category, spot_name, spot_name_en,
  prefecture, city, geom,
  description_ja, description_en,
  seo_title_ja, seo_title_en,
  visit_tips_ja, visit_tips_en,
  scene_timestamp, scene_timestamp_en, scene_number,
  broadcaster, release_year,
  confidence_score, source_type, status
) values (
  'miu404-dogenzaka',
  'MIU404', 'MIU404',
  'drama',
  '渋谷区 道玄坂2丁目', 'Shibuya Dogenzaka',
  'tokyo', 'shibuya',
  st_setsrid(st_makepoint(139.6984, 35.6594), 4326)::geography,
  '渋谷スクランブル交差点から徒歩で追走するシーンの後、伊吹と志摩が入ったラーメン店のカウンター席。店内のレイアウト、メニュー、丼の構成が一致。',
  'After a foot chase from Shibuya Scramble, the ramen counter where Ibuki and Shima sat. Layout, menu, and bowl match.',
  'MIU404 道玄坂ロケ地情報', 'MIU404 Dogenzaka Filming Location Guide',
  '昼のランチ時間は混雑する。開店直後か15時以降が比較的空いている。', 'Lunch rush can be crowded. Try opening time or after 3pm.',
  '21:03', '21:03', '06',
  'TBS', 2020,
  0.98, 'official', 'approved'
)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en,
  category = excluded.category,
  spot_name = excluded.spot_name, spot_name_en = excluded.spot_name_en,
  prefecture = excluded.prefecture, city = excluded.city, geom = excluded.geom,
  description_ja = excluded.description_ja, description_en = excluded.description_en,
  seo_title_ja = excluded.seo_title_ja, seo_title_en = excluded.seo_title_en,
  visit_tips_ja = excluded.visit_tips_ja, visit_tips_en = excluded.visit_tips_en,
  scene_timestamp = excluded.scene_timestamp, scene_timestamp_en = excluded.scene_timestamp_en,
  scene_number = excluded.scene_number,
  broadcaster = excluded.broadcaster, release_year = excluded.release_year,
  confidence_score = excluded.confidence_score, source_type = excluded.source_type,
  status = excluded.status, updated_at = now();

-- 君の名は。
insert into public.spots (
  slug, title, title_en, category, spot_name, spot_name_en,
  prefecture, city, geom,
  description_ja, description_en,
  seo_title_ja, seo_title_en,
  visit_tips_ja, visit_tips_en,
  scene_timestamp, scene_timestamp_en, scene_number,
  broadcaster, release_year,
  confidence_score, source_type, status
) values (
  'your-name-shinjuku-south',
  '君の名は。', 'Your Name',
  'movie',
  '新宿区 新宿駅南口', 'Shinjuku South Exit',
  'tokyo', 'shinjuku',
  st_setsrid(st_makepoint(139.7006, 35.6896), 4326)::geography,
  '映画終盤の東京シーン。新宿駅南口ペデストリアンデッキからの視点が作中と一致。夕方の光の角度も再現性が高い。',
  'The final Tokyo search sequence. The pedestrian deck view from Shinjuku South Exit matches the film composition.',
  '君の名は。新宿ロケ地情報', 'Your Name Shinjuku Filming Location Guide',
  'デッキからの眺めは夕方が映画の光に最も近い。週末は混雑するため平日推奨。', 'Evening light on the deck most closely matches the film. Weekday visits recommended.',
  '東京シーン', 'Tokyo scene', '終盤',
  '東宝', 2016,
  0.93, 'official', 'approved'
)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en,
  category = excluded.category,
  spot_name = excluded.spot_name, spot_name_en = excluded.spot_name_en,
  prefecture = excluded.prefecture, city = excluded.city, geom = excluded.geom,
  description_ja = excluded.description_ja, description_en = excluded.description_en,
  seo_title_ja = excluded.seo_title_ja, seo_title_en = excluded.seo_title_en,
  visit_tips_ja = excluded.visit_tips_ja, visit_tips_en = excluded.visit_tips_en,
  scene_timestamp = excluded.scene_timestamp, scene_timestamp_en = excluded.scene_timestamp_en,
  scene_number = excluded.scene_number,
  broadcaster = excluded.broadcaster, release_year = excluded.release_year,
  confidence_score = excluded.confidence_score, source_type = excluded.source_type,
  status = excluded.status, updated_at = now();

-- 呪術廻戦
insert into public.spots (
  slug, title, title_en, category, spot_name, spot_name_en,
  prefecture, city, geom,
  description_ja, description_en,
  seo_title_ja, seo_title_en,
  visit_tips_ja, visit_tips_en,
  scene_timestamp, scene_timestamp_en, scene_number,
  broadcaster, release_year,
  confidence_score, source_type, status
) values (
  'jujutsu-kaisen-roppongi',
  '呪術廻戦', 'Jujutsu Kaisen',
  'anime',
  '港区 六本木', 'Minato Roppongi',
  'tokyo', 'minato',
  st_setsrid(st_makepoint(139.7317, 35.6628), 4326)::geography,
  '六本木の夜の街並みがアニメの都市描写の参考とされたエリア。ミッドタウン周辺の交差点が特に一致度が高い。',
  'Roppongi nightscape referenced in the anime''s urban background art. Midtown intersection has the highest visual match.',
  '呪術廻戦 六本木ロケ地情報', 'Jujutsu Kaisen Roppongi Filming Location Guide',
  '夜間の撮影は光量が多く映えるが、深夜は周囲の状況に注意。', 'Night shots have good light but stay aware of surroundings late at night.',
  '12:07', '12:07', '03',
  'MBS', 2020,
  0.95, 'official', 'approved'
)
on conflict (slug) do update set
  title = excluded.title, title_en = excluded.title_en,
  category = excluded.category,
  spot_name = excluded.spot_name, spot_name_en = excluded.spot_name_en,
  prefecture = excluded.prefecture, city = excluded.city, geom = excluded.geom,
  description_ja = excluded.description_ja, description_en = excluded.description_en,
  seo_title_ja = excluded.seo_title_ja, seo_title_en = excluded.seo_title_en,
  visit_tips_ja = excluded.visit_tips_ja, visit_tips_en = excluded.visit_tips_en,
  scene_timestamp = excluded.scene_timestamp, scene_timestamp_en = excluded.scene_timestamp_en,
  scene_number = excluded.scene_number,
  broadcaster = excluded.broadcaster, release_year = excluded.release_year,
  confidence_score = excluded.confidence_score, source_type = excluded.source_type,
  status = excluded.status, updated_at = now();
