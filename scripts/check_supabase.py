"""Check MadPilgrim's public Supabase read path without exposing credentials."""

from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
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


def main() -> None:
    load_env_file(Path(".env.local"))
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    anon_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    if not url or not anon_key:
        raise SystemExit("Supabase URL and anon key are not configured")

    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
        "Prefer": "count=exact",
        "Range": "0-99",
    }

    def read_view(view: str, fields: str) -> tuple[list[dict[str, object]], str | None]:
        query = urlencode({"select": fields})
        request = Request(f"{url}/rest/v1/{view}?{query}", headers=headers)
        with urlopen(request, timeout=20) as response:
            records = json.loads(response.read().decode("utf-8"))
            return records, response.headers.get("Content-Range")

    try:
        spots, spots_range = read_view("public_spots", "slug,title,status")
        foods, foods_range = read_view(
            "public_nearby_foods", "spot_slug,name,is_sponsored"
        )
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if exc.code == 404 or "PGRST205" in detail:
            raise SystemExit(
                "Connected to Supabase, but public_spots is unavailable. "
                "Run supabase/migrations/0001_initial.sql in the SQL Editor."
            ) from exc
        raise SystemExit(f"Supabase read failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise SystemExit(f"Could not connect to Supabase: {exc.reason}") from exc

    print(
        json.dumps(
            {
                "connected": True,
                "public_spots_available": True,
                "spot_count": len(spots),
                "food_count": len(foods),
                "spot_content_range": spots_range,
                "food_content_range": foods_range,
                "sample_slugs": [record.get("slug") for record in spots[:5]],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
