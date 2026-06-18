"""Day 2 pipeline skeleton for MAD Pilgrim.

The script is safe to run without API keys. In dry-run mode it demonstrates the
data contract and validation flow. Real Gemini, Geocoding, Places, and Supabase
calls can be attached behind the same interfaces on Day 3.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict, field
import argparse
import json
import os
import re
from pathlib import Path
from typing import Any


@dataclass
class StructuredSpot:
    title: str
    category: str
    spot_name: str
    raw_address: str
    description_ja: str
    description_en: str
    seo_title_ja: str
    seo_title_en: str
    visit_tips_ja: str
    scene_timestamp: str
    confidence_score: float
    source_type: str
    is_safe: bool
    source_url: str = ""
    status: str = "ai_suggested"
    slug: str = ""
    latitude: float | None = None
    longitude: float | None = None
    nearby_foods: list[dict[str, Any]] = field(default_factory=list)


ALLOWED_CATEGORIES = {"anime", "mv", "drama", "movie", "cm"}
ALLOWED_SOURCE_TYPES = {"official", "fan", "social", "inferred"}


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return normalized or "untitled-spot"


def validate_spot(spot: StructuredSpot) -> bool:
    if not spot.is_safe:
        return False
    if spot.category not in ALLOWED_CATEGORIES:
        return False
    if spot.source_type not in ALLOWED_SOURCE_TYPES:
        return False
    if not 0 <= spot.confidence_score <= 1:
        return False
    if spot.confidence_score < 0.4:
        return True
    return bool(spot.title and spot.spot_name)


def assign_status(spot: StructuredSpot) -> str:
    if not spot.is_safe:
        return "hidden"
    if spot.confidence_score < 0.4:
        return "unverified"
    if spot.confidence_score >= 0.8 and spot.source_type == "official":
        return "approved"
    return "ai_suggested"


def simulate_gemini_extract(source: dict[str, Any]) -> StructuredSpot:
    """Temporary deterministic extractor until Gemini API is wired."""
    source_text = str(source.get("raw_text", ""))
    source_type = str(source.get("source_type", "fan"))
    title_match = re.search(r"([A-Z][A-Za-z0-9 !:;.'-]{2,40})", source_text)
    spot_match = re.search(r"(around|near|at) ([A-Z][A-Za-z0-9 ]{2,40})", source_text)
    title = str(source.get("expected_title") or (title_match.group(1).strip() if title_match else "Demo Work"))
    spot_name = str(source.get("expected_spot_name") or (spot_match.group(2).strip() if spot_match else "Demo Station"))
    category = str(source.get("expected_category") or ("mv" if "music video" in source_text.lower() else "anime"))
    raw_address = str(source.get("expected_address") or ("Tokyo" if "Tokyo" in source_text else ""))
    confidence = 0.82 if source_type == "official" else 0.62
    spot = StructuredSpot(
        title=title,
        category=category,
        spot_name=spot_name,
        raw_address=raw_address,
        description_ja=f"{spot_name}周辺で確認された巡礼候補です。公開エリアを短時間で訪問する想定です。",
        description_en=f"A pilgrimage candidate around {spot_name}. Visit briefly and stay within public areas.",
        seo_title_ja=f"{title} {spot_name}の聖地情報",
        seo_title_en=f"{title} {spot_name} Pilgrimage Guide",
        visit_tips_ja="歩行者や近隣施設の迷惑にならないよう注意してください。",
        scene_timestamp="",
        confidence_score=confidence,
        source_type=source_type if source_type in ALLOWED_SOURCE_TYPES else "fan",
        is_safe=not any(word in source_text.lower() for word in ["private home", "school grounds", "restricted"]),
        source_url=str(source.get("source_url", "")),
    )
    spot.status = assign_status(spot)
    spot.slug = slugify(f"{spot.title}-{spot.spot_name}")
    return spot


def geocode_placeholder(spot: StructuredSpot) -> StructuredSpot:
    """Attach deterministic demo coordinates until Google Geocoding is connected."""
    if "tokyo" in spot.raw_address.lower() or "station" in spot.spot_name.lower():
        spot.latitude = 35.6812
        spot.longitude = 139.7671
    return spot


def places_placeholder(spot: StructuredSpot) -> StructuredSpot:
    if spot.latitude is None or spot.longitude is None:
        return spot
    spot.nearby_foods = [
        {
          "name": "Demo Cafe",
          "category": "cafe",
          "rating": 4.1,
          "price_level": 2,
          "is_sponsored": False,
        }
    ]
    return spot


def load_sources(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def env_report() -> dict[str, bool]:
    return {
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "google_maps": bool(os.getenv("GOOGLE_MAPS_API_KEY")),
        "supabase_url": bool(os.getenv("NEXT_PUBLIC_SUPABASE_URL")),
        "supabase_service_role": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
    }


def run_pipeline(input_path: Path, dry_run: bool) -> dict[str, Any]:
    sources = load_sources(input_path)
    processed: list[dict[str, Any]] = []
    for source in sources:
        spot = simulate_gemini_extract(source)
        spot = geocode_placeholder(spot)
        spot = places_placeholder(spot)
        processed.append({"valid": validate_spot(spot), "spot": asdict(spot)})
    return {"dry_run": dry_run, "env": env_report(), "processed": processed}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="scripts/sample_sources.json")
    parser.add_argument("--output", default="")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    result = run_pipeline(Path(args.input), args.dry_run)
    output = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(output + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
