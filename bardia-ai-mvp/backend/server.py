"""Small local HTTP service for document analysis.

The server uses Python's standard-library HTTP stack, so there is no web
framework to configure and no cloud API key. The only installable packages are
the document readers listed in requirements.txt.
"""

from __future__ import annotations

import json
from email import policy
from email.parser import BytesParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from engine import analyze_document
from parsers import UnsupportedDocumentError, extract_document_text

HOST = "127.0.0.1"
PORT = 8000
MAX_FILE_BYTES = 25 * 1024 * 1024


class LearningForgeHandler(BaseHTTPRequestHandler):
    server_version = "LearningForgeLocal/0.1"

    def do_OPTIONS(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler naming
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/health":
            self._json_response(
                200,
                {"status": "ok", "engine": "local-deterministic-v0.1"},
            )
            return
        self._json_response(404, {"detail": "Not found."})

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/analyze":
            self._json_response(404, {"detail": "Not found."})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            self._json_response(400, {"detail": "The uploaded file is empty."})
            return
        if content_length > MAX_FILE_BYTES + 1_000_000:
            self._json_response(413, {"detail": "The MVP file limit is 25 MB."})
            return

        try:
            filename, content = self._read_multipart_file(content_length)
            if not content:
                raise ValueError("The uploaded file is empty.")
            if len(content) > MAX_FILE_BYTES:
                self._json_response(413, {"detail": "The MVP file limit is 25 MB."})
                return

            extracted = extract_document_text(filename, content)
            result = analyze_document(filename, extracted)
            self._json_response(200, result)
        except UnsupportedDocumentError as error:
            self._json_response(415, {"detail": str(error)})
        except ValueError as error:
            self._json_response(400, {"detail": str(error)})
        except Exception as error:  # Keep the demo alive and return a readable error.
            self._json_response(422, {"detail": f"Document analysis failed: {error}"})

    def _read_multipart_file(self, content_length: int) -> tuple[str, bytes]:
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            raise ValueError("Expected a multipart file upload.")

        body = self.rfile.read(content_length)
        message = BytesParser(policy=policy.default).parsebytes(
            b"Content-Type: "
            + content_type.encode("utf-8")
            + b"\r\nMIME-Version: 1.0\r\n\r\n"
            + body
        )

        for part in message.iter_parts():
            disposition = part.get("Content-Disposition", "")
            if 'name="file"' not in disposition:
                continue
            filename = part.get_filename() or "document"
            return filename, part.get_payload(decode=True) or b""
        raise ValueError("No file field was found in the upload.")

    def _json_response(self, status: int, payload: dict) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "http://127.0.0.1:5174")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, format_string: str, *args) -> None:
        print(f"[local-engine] {self.address_string()} - {format_string % args}")


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), LearningForgeHandler)
    print(f"LearningForge local engine: http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local engine.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
