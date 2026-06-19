"""Gemini Deep Research / NotebookLM の出力JSONをSupabaseに投入するスクリプト。

デフォルトはドライランでプレビューのみ表示。
実際に書き込む場合は --commit フラグが必要。

使い方:
  # プレビュー（書き込みなし）
  python scripts/import_from_gemini.py --input scripts/gemini_output.json

  # 実際に投入
  python scripts/import_from_gemini.py --input scripts/gemini_output.json --commit

入力JSONの形式は scripts/gemini_template.json を参照。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


# ─── 環境変数ロード ───────────────────────────────────────────────────────────

def load_env(path: Path = Path(".env.local")) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


# ─── バリデーション ────────────────────────────────────────────────────────────

REQUIRED_FIELDS = ["title", "spot_name", "category", "prefecture", "city",
                   "description_ja", "source_evidence"]
VALID_CATEGORIES = {"anime", "drama", "movie", "mv", "cm", "manga"}

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:80]

def validate(spot: dict[str, Any], index: int) -> list[str]:
    errors = []
    for field in REQUIRED_FIELDS:
        if not spot.get(field):
            errors.append(f"  [{index}] '{field}' が空です")
    if spot.get("category") not in VALID_CATEGORIES:
        errors.append(f"  [{index}] category '{spot.get('category')}' は無効 (anime/drama/movie/mv/cm/manga)")
    lat = spot.get("latitude")
    lng = spot.get("longitude")
    if lat is None:
        errors.append(f"  [{index}] 'latitude' が空です")
    elif not (-90 <= float(lat) <= 90):
        errors.append(f"  [{index}] latitude が範囲外")
    if lng is None:
        errors.append(f"  [{index}] 'longitude' が空です")
    elif not (100 <= float(lng) <= 180):
        errors.append(f"  [{index}] longitude が日本国内の範囲外")
    score = float(spot.get("confidence_score", 0))
    if not (0 <= score <= 1):
        errors.append(f"  [{index}] confidence_score は 0〜1 の範囲で指定してください")
    return errors


# ─── ユーティリティ ────────────────────────────────────────────────────────────

_SOURCE_TYPE_MAP = {
    "fan_wiki": "fan",
    "fan_site": "fan",
    "news_article": "social",
    "twitter": "social",
    "instagram": "social",
}

def _normalize_source_type(value: str) -> str:
    return _SOURCE_TYPE_MAP.get(value, value)


# ─── Supabase RPC 呼び出し ─────────────────────────────────────────────────────

def call_rpc(url: str, key: str, function_name: str, payload: dict[str, Any]) -> Any:
    req = Request(
        f"{url.rstrip('/')}/rest/v1/rpc/{function_name}",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=30) as res:
            return json.loads(res.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase RPC failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Supabase 接続失敗: {exc.reason}") from exc


# ─── メイン処理 ──────────────────────────────────────────────────────────────

def upsert_spot(url: str, key: str, payload: dict[str, Any]) -> str:
    return str(call_rpc(url, key, "upsert_spot_candidate_v2", payload))


def upsert_nearby_food(url: str, key: str, payload: dict[str, Any]) -> str:
    return str(call_rpc(url, key, "upsert_nearby_food", payload))


def build_rpc_payload(spot: dict[str, Any]) -> dict[str, Any]:
    title = spot["title"]
    slug = spot.get("slug") or slugify(f"{title}-{spot['spot_name']}")
    return {
        "p_slug":              slug,
        "p_title":             title,
        "p_title_en":          spot.get("title_en") or title,
        "p_category":          spot["category"],
        "p_spot_name":         spot["spot_name"],
        "p_spot_name_en":      spot.get("spot_name_en") or spot["spot_name"],
        "p_latitude":          float(spot["latitude"]) if spot.get("latitude") is not None else None,
        "p_longitude":         float(spot["longitude"]) if spot.get("longitude") is not None else None,
        "p_prefecture":        spot.get("prefecture", ""),
        "p_city":              spot.get("city", ""),
        "p_description_ja":    spot.get("description_ja", ""),
        "p_description_en":    spot.get("description_en") or spot.get("description_ja", ""),
        "p_seo_title_ja":      spot.get("seo_title_ja") or f"{title} {spot['spot_name']}のロケ地情報",
        "p_seo_title_en":      spot.get("seo_title_en") or f"{title} {spot['spot_name']} Filming Location",
        "p_visit_tips_ja":     spot.get("visit_tips_ja", ""),
        "p_visit_tips_en":     spot.get("visit_tips_en", ""),
        "p_scene_timestamp":   spot.get("scene_timestamp", ""),
        "p_scene_timestamp_en": spot.get("scene_timestamp_en", ""),
        "p_broadcaster":       spot.get("broadcaster"),
        "p_release_year":      int(spot["release_year"]) if spot.get("release_year") is not None else None,
        "p_scene_number":      spot.get("scene_number"),
        "p_confidence_score":  float(spot.get("confidence_score", 0.6)),
        "p_source_type":       _normalize_source_type(spot.get("source_type", "inferred")),
        "p_status":            "ai_suggested",   # 常に未承認で投入
        # YouTube公式動画は人間が youtube_confirmed: true をセットするまでDBに保存しない。
        # Geminiが提案したURLでも未確認なら自動的に破棄する（誤って二次配信動画を載せないため）。
        "p_youtube_url": spot.get("youtube_url") if spot.get("youtube_confirmed") is True else None,
        "p_youtube_channel_name": spot.get("youtube_channel_name") if spot.get("youtube_confirmed") is True else None,
    }


def price_range_to_level(price_range: Any) -> int | None:
    if price_range is None:
        return None

    text = str(price_range).strip()
    if not text:
        return None

    numbers = []
    for raw_number, unit in re.findall(r"(\d[\d,]*(?:\.\d+)?)\s*(万)?", text):
        value = float(raw_number.replace(",", ""))
        if unit:
            value *= 10000
        numbers.append(value)

    if numbers:
        upper_price = max(numbers)
        if upper_price <= 1000:
            return 1
        if upper_price <= 3000:
            return 2
        if upper_price <= 6000:
            return 3
        return 4

    currency_marks = text.count("¥") + text.count("￥")
    if currency_marks:
        return min(currency_marks, 4)
    return None


def build_nearby_food_payload(
    spot_id: str,
    spot: dict[str, Any],
    food: dict[str, Any],
) -> dict[str, Any]:
    dish_name = str(food.get("dish_name") or "").strip()
    venue_name = str(food.get("venue_name") or dish_name).strip()
    available = str(food.get("available") or "").strip()
    scene_evidence = str(food.get("scene_evidence") or "").strip()
    travel_minutes = food.get("travel_minutes")
    source_url = str(food.get("source_url") or "").strip()
    google_maps_url = str(food.get("google_maps_url") or "").strip()

    description_parts = []
    if dish_name:
        description_parts.append(f"料理: {dish_name}")
    if available:
        description_parts.append(f"提供状況: {available}")
    if travel_minutes is not None:
        description_parts.append(f"スポットから徒歩約{travel_minutes}分")
    if scene_evidence:
        description_parts.append(scene_evidence)

    tags = [
        value
        for value in [
            f"dish:{dish_name}" if dish_name else "",
            f"available:{available}" if available else "",
            f"travel_minutes:{travel_minutes}" if travel_minutes is not None else "",
            f"source:{source_url}" if source_url else "",
        ]
        if value
    ]

    return {
        "p_spot_id":         spot_id,
        "p_name":            venue_name,
        "p_category":        food.get("category") or "food",
        "p_latitude":        float(food.get("latitude") if food.get("latitude") is not None else spot["latitude"]),
        "p_longitude":       float(food.get("longitude") if food.get("longitude") is not None else spot["longitude"]),
        "p_address":         food.get("address"),
        "p_price_level":     price_range_to_level(food.get("price_range")),
        "p_description_ja":  " / ".join(description_parts) or None,
        "p_description_en":  food.get("description_en"),
        "p_tags":            tags,
        "p_google_maps_url": google_maps_url or None,
        "p_is_sponsored":    bool(food.get("is_sponsored", False)),
    }


def print_preview(spot: dict[str, Any], index: int) -> None:
    title = spot.get("title", "?")
    slug = spot.get("slug") or slugify(f"{title}-{spot.get('spot_name','')}")
    broadcaster = spot.get("broadcaster", "")
    year = spot.get("release_year", "")
    scene = spot.get("scene_number", "")
    evidence = spot.get("source_evidence", "（根拠なし）")
    score = float(spot.get("confidence_score", 0.6))

    badge = "✅" if score >= 0.8 else "⚠️" if score >= 0.6 else "❌"
    print(f"""
  [{index+1:02d}] {badge} {title}  {year}/{broadcaster}
       スポット : {spot.get('spot_name')}（{spot.get('prefecture')} {spot.get('city')}）
       シーン   : {f'#{scene}  ' if scene else ''}{spot.get('scene_timestamp','')}
       座標     : {spot.get('latitude')}, {spot.get('longitude')}
       信頼度   : {int(score*100)}%  source={spot.get('source_type','inferred')}
       根拠     : {evidence[:80]}
       slug     : {slug}""")


def main() -> None:
    load_env()

    parser = argparse.ArgumentParser(description="Gemini出力JSONをSupabaseに投入")
    parser.add_argument("--input", required=True, help="入力JSONファイルパス")
    parser.add_argument("--commit", action="store_true", help="実際にSupabaseへ書き込む")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ ファイルが見つかりません: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        data = json.loads(input_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"❌ JSON解析エラー: {exc}", file=sys.stderr)
        sys.exit(1)

    spots = data.get("spots", [])
    if not spots:
        print("❌ spots 配列が空です。gemini_template.json を参照してください。")
        sys.exit(1)

    work_title = data.get("work_title", "不明")
    print(f"\n{'='*60}")
    print(f"  MAD Pilgrim - Geminiデータ取込")
    print(f"  作品: {work_title}  |  件数: {len(spots)}件")
    print(f"  モード: {'🔴 COMMIT（Supabaseに書き込み）' if args.commit else '🔵 DRY RUN（プレビューのみ）'}")
    print(f"{'='*60}")

    # バリデーション
    all_errors: list[str] = []
    for i, spot in enumerate(spots):
        all_errors.extend(validate(spot, i+1))

    if all_errors:
        print("\n⚠️  バリデーションエラー:")
        for err in all_errors:
            print(err)
        print("\n修正後に再実行してください。")
        sys.exit(1)

    # プレビュー表示
    print("\n■ 投入予定データ:")
    for i, spot in enumerate(spots):
        print_preview(spot, i)

    nearby_food_count = sum(len(spot.get("nearby_foods") or []) for spot in spots)
    print(f"\n  nearby_foods 投入予定: {nearby_food_count}件")

    if not args.commit:
        print(f"\n{'='*60}")
        print(f"  DRY RUN 完了。{len(spots)}件のプレビューを表示しました。")
        print(f"  実際に投入するには --commit を追加してください。")
        print(f"  投入後は Supabase Dashboard で ai_suggested → approved に承認してください。")
        print(f"{'='*60}\n")
        return

    # Supabase 接続確認
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        print("\n❌ NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です。")
        print("   .env.local を確認してください。")
        sys.exit(1)

    # 投入実行
    print(f"\n■ Supabaseへ投入中...")
    ok, ng = 0, 0
    food_ok, food_ng = 0, 0
    for i, spot in enumerate(spots):
        payload = build_rpc_payload(spot)
        try:
            spot_id = upsert_spot(supabase_url, service_key, payload)
            print(f"  ✅ [{i+1:02d}] {spot['title']} — {spot['spot_name']}")
            ok += 1

            for food in spot.get("nearby_foods") or []:
                food_payload = build_nearby_food_payload(spot_id, spot, food)
                try:
                    upsert_nearby_food(supabase_url, service_key, food_payload)
                    print(f"       ✅ FOOD: {food_payload['p_name']}")
                    food_ok += 1
                except RuntimeError as exc:
                    print(f"       ❌ FOOD: {food_payload['p_name']} — {exc}")
                    food_ng += 1
        except RuntimeError as exc:
            print(f"  ❌ [{i+1:02d}] {spot['title']} — {exc}")
            ng += 1

    print(f"\n{'='*60}")
    print(f"  完了: 成功 {ok}件 / 失敗 {ng}件")
    print(f"  nearby_foods: 成功 {food_ok}件 / 失敗 {food_ng}件")
    print(f"  投入データは status='ai_suggested'（非公開）です。")
    print(f"  Supabase Dashboard の SQL Editor で承認してください:")
    print(f"")
    print(f"    SELECT slug, title, spot_name, confidence_score")
    print(f"    FROM public.spots WHERE status = 'ai_suggested'")
    print(f"    ORDER BY created_at DESC;")
    print(f"")
    print(f"    -- 確認OKなら:")
    print(f"    UPDATE public.spots SET status = 'approved' WHERE slug = 'xxx';")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
