"""Fetch Wikidata location candidates without publishing them as verified spots.

The default mode writes a review CSV only. `--commit-staging` stores candidates
in the private `location_candidates` table. This script never writes to
`public.spots` and never assigns an approved status.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SPARQL_QUERY = """
SELECT DISTINCT ?work ?workLabel ?workTypeLabel ?relation ?place ?placeLabel
  ?coords ?address WHERE {
  VALUES (?property ?relation) {
    (wdt:P840 "narrative_location")
    (wdt:P276 "location")
  }
  ?work ?property ?place .
  ?place wdt:P17 wd:Q17 .
  ?place wdt:P625 ?coords .
  OPTIONAL { ?work wdt:P31 ?workType . }
  OPTIONAL { ?place wdt:P6375 ?address . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
"""

ALLOWED_WORK_TYPES = {
    "film",
    "television series",
    "anime television series",
    "animated film",
    "music video",
    "映画",
    "テレビドラマ",
    "テレビアニメ",
    "アニメ映画",
    "ミュージック・ビデオ",
}


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def fetch_bindings() -> list[dict[str, Any]]:
    query_url = "https://query.wikidata.org/sparql?" + urlencode(
        {"query": SPARQL_QUERY, "format": "json"}
    )
    request = Request(
        query_url,
        headers={"User-Agent": "MadPilgrimBot/2.0 (location candidate review)"},
    )
    with urlopen(request, timeout=60) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("results", {}).get("bindings", [])


def qid(uri: str) -> str:
    return uri.rsplit("/", 1)[-1]


def parse_point(value: str) -> tuple[float, float] | None:
    match = re.fullmatch(r"Point\(([-0-9.]+) ([-0-9.]+)\)", value)
    if not match:
        return None
    longitude = float(match.group(1))
    latitude = float(match.group(2))
    if not (20 <= latitude <= 46 and 122 <= longitude <= 154):
        return None
    return latitude, longitude


def to_candidate(binding: dict[str, Any]) -> dict[str, Any] | None:
    work_type = binding.get("workTypeLabel", {}).get("value", "")
    if work_type.lower() not in {value.lower() for value in ALLOWED_WORK_TYPES}:
        return None

    coordinates = parse_point(binding.get("coords", {}).get("value", ""))
    if not coordinates:
        return None

    work_id = qid(binding["work"]["value"])
    place_id = qid(binding["place"]["value"])
    relation = binding["relation"]["value"]
    latitude, longitude = coordinates
    return {
        "source_name": "wikidata",
        "source_work_id": work_id,
        "source_place_id": place_id,
        "source_relation": relation,
        "work_title": binding.get("workLabel", {}).get("value", ""),
        "place_name": binding.get("placeLabel", {}).get("value", ""),
        "address": binding.get("address", {}).get("value"),
        "latitude": latitude,
        "longitude": longitude,
        "source_url": f"https://www.wikidata.org/wiki/{work_id}",
        "raw_payload": binding,
        "review_status": "pending",
    }


def write_csv(path: Path, candidates: list[dict[str, Any]]) -> None:
    fields = [
        "source_work_id",
        "source_place_id",
        "source_relation",
        "work_title",
        "place_name",
        "address",
        "latitude",
        "longitude",
        "source_url",
        "review_status",
    ]
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows({field: item.get(field) for field in fields} for item in candidates)


def commit_staging(candidates: list[dict[str, Any]]) -> int:
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise SystemExit("Supabase URL and service-role key are required")

    request = Request(
        f"{url}/rest/v1/location_candidates?on_conflict=source_name,source_work_id,source_place_id,source_relation",
        data=json.dumps(candidates).encode("utf-8"),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
        method="POST",
    )
    with urlopen(request, timeout=60):
        return len(candidates)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="wikidata_location_candidates.csv")
    parser.add_argument("--commit-staging", action="store_true")
    args = parser.parse_args()

    load_env(Path(".env.local"))
    candidates = [
        candidate
        for binding in fetch_bindings()
        if (candidate := to_candidate(binding)) is not None
    ]
    write_csv(Path(args.output), candidates)

    result = {
        "candidate_count": len(candidates),
        "output": args.output,
        "published_spots": 0,
        "staged": 0,
    }
    if args.commit_staging:
        result["staged"] = commit_staging(candidates)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
