#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
FIGMA_API = "https://api.figma.com/v1"
DEFAULT_PORT = int(os.environ.get("PORT", "4173"))


MOCK_SUMMARY = {
    "source": "mock",
    "file": {
        "name": "Vercajkovna",
        "lastModified": "2026-03-22T00:00:00Z",
        "version": "mock",
    },
    "pages": [
        {
            "id": "page-market",
            "name": "Market / Home",
            "kind": "CANVAS",
            "frames": [
                {"id": "market-hero", "name": "Hero + Search", "type": "FRAME", "width": 1440, "height": 980},
                {"id": "market-grid", "name": "Grid of Listings", "type": "FRAME", "width": 1440, "height": 1280},
            ],
        },
        {
            "id": "page-detail",
            "name": "Listing Detail",
            "kind": "CANVAS",
            "frames": [
                {"id": "detail-main", "name": "Listing detail", "type": "FRAME", "width": 1440, "height": 1200},
                {"id": "detail-request", "name": "Request drawer", "type": "FRAME", "width": 1440, "height": 1040},
            ],
        },
        {
            "id": "page-auth",
            "name": "Auth + Profile",
            "kind": "CANVAS",
            "frames": [
                {"id": "auth-login", "name": "Login", "type": "FRAME", "width": 1440, "height": 1040},
                {"id": "auth-profile", "name": "Profile", "type": "FRAME", "width": 1440, "height": 1220},
            ],
        },
    ],
}


class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            return self.respond_json({"ok": True, "service": "vercajkovna-demo"})

        if path == "/api/figma/summary":
            return self.handle_figma_summary(parsed.query)

        if path == "/api/figma/images":
            return self.handle_figma_images(parsed.query)

        if path.startswith("/api/"):
            return self.send_error(HTTPStatus.NOT_FOUND, "Unknown API route")

        return self.serve_static(path)

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        return

    def serve_static(self, path: str) -> None:
        safe_path = path.lstrip("/") or "index.html"
        file_path = ROOT / safe_path

        if file_path.is_dir():
            file_path = file_path / "index.html"

        if not file_path.exists():
            file_path = ROOT / "index.html"

        if not file_path.exists():
            return self.send_error(HTTPStatus.NOT_FOUND, "File not found")

        content_type = self.detect_content_type(file_path.suffix)
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def handle_figma_summary(self, query: str) -> None:
        file_key = parse_qs(query).get("file_key", [os.environ.get("FIGMA_FILE_KEY", "")])[0]
        token = os.environ.get("FIGMA_ACCESS_TOKEN", "")

        if not file_key or not token:
            return self.respond_json(MOCK_SUMMARY)

        try:
            data = fetch_json(f"{FIGMA_API}/files/{file_key}", token)
            return self.respond_json(build_summary(data, source="api"))
        except Exception as exc:  # noqa: BLE001
            return self.respond_json(
                {
                    **MOCK_SUMMARY,
                    "source": "mock",
                    "error": str(exc),
                }
            )

    def handle_figma_images(self, query: str) -> None:
        params = parse_qs(query)
        file_key = params.get("file_key", [os.environ.get("FIGMA_FILE_KEY", "")])[0]
        ids = params.get("ids", [""])[0]
        token = os.environ.get("FIGMA_ACCESS_TOKEN", "")

        if not file_key or not token or not ids:
            return self.respond_json({"images": {}, "status": 0})

        try:
            encoded_ids = ids
            scale = params.get("scale", ["1"])[0]
            format_ = params.get("format", ["png"])[0]
            url = f"{FIGMA_API}/images/{file_key}?ids={encoded_ids}&scale={scale}&format={format_}"
            data = fetch_json(url, token)
            return self.respond_json(data)
        except Exception as exc:  # noqa: BLE001
            return self.respond_json({"images": {}, "status": 0, "error": str(exc)})

    def respond_json(self, payload: dict, status: int = 200) -> None:
        data = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    @staticmethod
    def detect_content_type(suffix: str) -> str:
        return {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        }.get(suffix.lower(), "application/octet-stream")


def fetch_json(url: str, token: str) -> dict:
    req = Request(url, headers={"X-Figma-Token": token, "Accept": "application/json"})
    with urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def build_summary(file_payload: dict, source: str = "api") -> dict:
    document = file_payload.get("document", {})
    pages = []
    for page in document.get("children", []):
        if page.get("type") != "CANVAS":
            continue
        frames = []
        for node in page.get("children", []):
            if node.get("type") in {"FRAME", "COMPONENT", "COMPONENT_SET", "SECTION"}:
                box = node.get("absoluteBoundingBox", {})
                frames.append(
                    {
                        "id": node.get("id"),
                        "name": node.get("name"),
                        "type": node.get("type"),
                        "width": round(box.get("width", 0)),
                        "height": round(box.get("height", 0)),
                    }
                )
        pages.append(
            {
                "id": page.get("id"),
                "name": page.get("name"),
                "kind": page.get("type"),
                "frames": frames,
            }
        )

    return {
        "source": source,
        "file": {
            "name": file_payload.get("name"),
            "lastModified": file_payload.get("lastModified"),
            "version": file_payload.get("version"),
        },
        "pages": pages,
    }


def main() -> int:
    server = ThreadingHTTPServer(("127.0.0.1", DEFAULT_PORT), AppHandler)
    print(f"Serving on http://127.0.0.1:{DEFAULT_PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping...", flush=True)
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
