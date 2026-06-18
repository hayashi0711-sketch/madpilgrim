"""Safely ingest validated pipeline output into Supabase.

Preview is the default. A real write requires both --commit and service-role
credentials, keeping local experiments and CI dry-runs non-destructive.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def load_candidates(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    processed = payload.get("processed")
    if not isinstance(processed, list):
        raise ValueError("input must contain a processed array")
    return [
        item["spot"]
        for item in processed
        if item.get("valid") is True and isinstance(item.get("spot"), dict)
    ]


def rpc(url: str, service_role_key: str, function_name: str, payload: dict[str, Any]) -> Any:
    request = Request(
        f"{url.rstrip('/')}/rest/v1/rpc/{function_name}",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase RPC {function_name} failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Supabase RPC {function_name} could not connect: {exc.reason}") from exc
    return json.loads(body) if body else None


def spot_payload(spot: dict[str, Any]) -> dict[str, Any]:
    return {
        "p_slug": spot.get("slug"),
        "p_title": spot.get("title"),
        "p_category": spot.get("category"),
        "p_spot_name": spot.get("spot_name"),
        "p_latitude": spot.get("latitude"),
        "p_longitude": spot.get("longitude"),
        "p_title_en": spot.get("title_en"),
        "p_spot_name_en": spot.get("spot_name_en"),
        "p_description_ja": spot.get("description_ja"),
        "p_description_en": spot.get("description_en"),
        "p_seo_title_ja": spot.get("seo_title_ja"),
        "p_seo_title_en": spot.get("seo_title_en"),
        "p_visit_tips_ja": spot.get("visit_tips_ja"),
        "p_visit_tips_en": spot.get("visit_tips_en"),
        "p_scene_timestamp": spot.get("scene_timestamp"),
        "p_scene_timestamp_en": spot.get("scene_timestamp_en"),
        "p_confidence_score": spot.get("confidence_score", 0.5),
        "p_source_type": spot.get("source_type", "inferred"),
        "p_status": spot.get("status", "ai_suggested"),
        "p_prefecture": spot.get("prefecture"),
        "p_city": spot.get("city"),
        "p_og_image_url": spot.get("og_image_url"),
    }


def food_payload(spot_id: str, food: dict[str, Any]) -> dict[str, Any]:
    return {
        "p_spot_id": spot_id,
        "p_name": food.get("name"),
        "p_place_id": food.get("place_id"),
        "p_category": food.get("category"),
        "p_latitude": food.get("latitude"),
        "p_longitude": food.get("longitude"),
        "p_address": food.get("address"),
        "p_rating": food.get("rating"),
        "p_price_level": food.get("price_level"),
        "p_website_url": food.get("website_url"),
        "p_google_maps_url": food.get("google_maps_url"),
        "p_description_ja": food.get("description_ja"),
        "p_description_en": food.get("description_en"),
        "p_tags": food.get("tags", []),
        "p_is_sponsored": food.get("is_sponsored", False),
    }


def validate_for_ingest(spot: dict[str, Any]) -> list[str]:
    errors = []
    for field in ("slug", "title", "category", "spot_name", "latitude", "longitude"):
        if spot.get(field) in (None, ""):
            errors.append(f"{field} is required")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="pipeline-output.local.json")
    parser.add_argument("--env-file", default=".env.local")
    parser.add_argument("--commit", action="store_true")
    args = parser.parse_args()

    load_env_file(Path(args.env_file))
    candidates = load_candidates(Path(args.input))
    ready: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for spot in candidates:
        errors = validate_for_ingest(spot)
        if errors:
            skipped.append({"slug": spot.get("slug"), "errors": errors})
        else:
            ready.append(spot)

    summary = {
        "mode": "commit" if args.commit else "preview",
        "ready": len(ready),
        "skipped": skipped,
        "spots": [
            {"slug": spot["slug"], "nearby_foods": len(spot.get("nearby_foods", []))}
            for spot in ready
        ],
    }

    if not args.commit:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not service_role_key:
        raise SystemExit(
            "--commit requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        )

    written = []
    for spot in ready:
        spot_id = rpc(url, service_role_key, "upsert_spot_candidate_v2", spot_payload(spot))
        food_ids = [
            rpc(
                url,
                service_role_key,
                "upsert_nearby_food_candidate",
                food_payload(str(spot_id), food),
            )
            for food in spot.get("nearby_foods", [])
            if isinstance(food, dict) and food.get("name")
        ]
        written.append({"slug": spot["slug"], "spot_id": spot_id, "food_ids": food_ids})

    summary["written"] = written
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
