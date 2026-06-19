"""ai_suggested スポットの確認・承認スクリプト。

使い方:
  # 未承認スポット一覧を表示
  python scripts/review_spots.py --list

  # 特定のスポットを承認
  python scripts/review_spots.py --approve <slug>

  # 全件承認
  python scripts/review_spots.py --approve-all

  # 特定のスポットを非表示（却下）
  python scripts/review_spots.py --hide <slug>
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def load_env(path: Path = Path(".env.local")) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def get_env() -> tuple[str, str]:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        print("❌ NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です。")
        sys.exit(1)
    return url.rstrip("/"), key


def api_get(base_url: str, key: str, params: dict) -> list[dict]:
    qs = urlencode(params)
    req = Request(
        f"{base_url}/rest/v1/spots?{qs}",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(req, timeout=30) as res:
            return json.loads(res.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GET failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"接続失敗: {exc.reason}") from exc


def api_patch(base_url: str, key: str, params: dict, body: dict) -> None:
    qs = urlencode(params)
    req = Request(
        f"{base_url}/rest/v1/spots?{qs}",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        method="PATCH",
    )
    try:
        with urlopen(req, timeout=30) as res:
            res.read()
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"PATCH failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"接続失敗: {exc.reason}") from exc


def cmd_list(base_url: str, key: str) -> list[dict]:
    spots = api_get(base_url, key, {
        "status": "eq.ai_suggested",
        "select": "slug,title,spot_name,confidence_score,source_type,prefecture,city,created_at",
        "order": "created_at.desc",
    })

    if not spots:
        print("\n  ai_suggested のスポットはありません。")
        return []

    print(f"\n{'='*70}")
    print(f"  未承認スポット一覧  ({len(spots)}件)")
    print(f"{'='*70}")
    print(f"  {'#':>3}  {'信頼':>4}  {'作品／スポット':<32}  {'場所'}")
    print(f"  {'-'*3}  {'-'*4}  {'-'*32}  {'-'*16}")

    score_map = {0.9: "✅", 0.8: "✅", 0.7: "⚠️", 0.6: "❌"}
    for i, s in enumerate(spots, 1):
        score = float(s.get("confidence_score") or 0)
        badge = "✅" if score >= 0.8 else "⚠️" if score >= 0.6 else "❌"
        title = (s.get("title") or "")[:18]
        spot = (s.get("spot_name") or "")[:18]
        loc = f"{s.get('prefecture','')} {s.get('city','')}"
        print(f"  {i:>3}  {badge} {int(score*100):>2}%  {title}/{spot:<22}  {loc}")

    print(f"\n  承認: python scripts/review_spots.py --approve <slug>")
    print(f"  全承認: python scripts/review_spots.py --approve-all")
    print(f"  却下:  python scripts/review_spots.py --hide <slug>")
    print(f"{'='*70}\n")
    return spots


def cmd_approve(base_url: str, key: str, slug: str) -> None:
    spots = api_get(base_url, key, {"slug": f"eq.{slug}", "select": "slug,title,spot_name,status"})
    if not spots:
        print(f"❌ slug '{slug}' が見つかりません。")
        sys.exit(1)
    s = spots[0]
    if s["status"] == "approved":
        print(f"  すでに承認済みです: {s['title']} — {s['spot_name']}")
        return
    api_patch(base_url, key, {"slug": f"eq.{slug}"}, {"status": "approved"})
    print(f"  ✅ 承認しました: {s['title']} — {s['spot_name']}")


def cmd_approve_all(base_url: str, key: str, yes: bool = False) -> None:
    spots = api_get(base_url, key, {
        "status": "eq.ai_suggested",
        "select": "slug,title,spot_name",
    })
    if not spots:
        print("\n  ai_suggested のスポットはありません。")
        return

    print(f"\n以下 {len(spots)}件を全て承認します：")
    for s in spots:
        print(f"  - {s['title']} — {s['spot_name']}")

    if not yes:
        answer = input("\n本当に承認しますか？ [y/N]: ").strip().lower()
        if answer != "y":
            print("キャンセルしました。")
            return

    api_patch(base_url, key, {"status": "eq.ai_suggested"}, {"status": "approved"})
    print(f"\n✅ {len(spots)}件を承認しました。")


def cmd_hide(base_url: str, key: str, slug: str) -> None:
    spots = api_get(base_url, key, {"slug": f"eq.{slug}", "select": "slug,title,spot_name"})
    if not spots:
        print(f"❌ slug '{slug}' が見つかりません。")
        sys.exit(1)
    s = spots[0]
    api_patch(base_url, key, {"slug": f"eq.{slug}"}, {"status": "hidden"})
    print(f"  🚫 非表示にしました: {s['title']} — {s['spot_name']}")


def main() -> None:
    load_env()

    parser = argparse.ArgumentParser(description="ai_suggested スポットの確認・承認")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true", help="未承認スポット一覧を表示")
    group.add_argument("--approve", metavar="SLUG", help="指定slugを承認")
    group.add_argument("--approve-all", action="store_true", help="全件承認（確認あり）")
    parser.add_argument("--yes", "-y", action="store_true", help="確認プロンプトをスキップ")
    group.add_argument("--hide", metavar="SLUG", help="指定slugを非表示（却下）")
    args = parser.parse_args()

    base_url, key = get_env()

    if args.list:
        cmd_list(base_url, key)
    elif args.approve:
        cmd_approve(base_url, key, args.approve)
    elif args.approve_all:
        cmd_approve_all(base_url, key, yes=args.yes)
    elif args.hide:
        cmd_hide(base_url, key, args.hide)


if __name__ == "__main__":
    main()
