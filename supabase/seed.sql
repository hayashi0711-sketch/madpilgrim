insert into public.spots (
  title,
  category,
  spot_name,
  slug,
  prefecture,
  city,
  geom,
  description_ja,
  description_en,
  seo_title_ja,
  seo_title_en,
  visit_tips_ja,
  visit_tips_en,
  scene_timestamp,
  confidence_score,
  source_type,
  status
) values
(
  '呪術廻戦',
  'anime',
  '渋谷スクランブル交差点',
  'jujutsu-kaisen-shibuya-scramble',
  'tokyo',
  'shibuya',
  st_setsrid(st_makepoint(139.7005, 35.6595), 4326),
  '渋谷事変を想起させる東京屈指の交差点。',
  'One of Tokyo''s most recognizable crossings, associated with Shibuya-set anime scenes.',
  '呪術廻戦 渋谷スクランブル交差点の聖地情報',
  'Jujutsu Kaisen Shibuya Scramble Crossing Pilgrimage Guide',
  '早朝は撮影しやすく、夕方以降は街のネオンと人波を楽しめます。',
  'Early morning is easier for photos, while evening gives the full neon atmosphere.',
  'Shibuya arc',
  0.88,
  'fan',
  'approved'
)
on conflict (slug) do nothing;
