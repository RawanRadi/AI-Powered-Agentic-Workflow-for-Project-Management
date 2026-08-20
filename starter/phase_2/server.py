"""
server.py - Minimal web app for the agentic workflow.
 
Serves an HTML page where a user can upload a BRD / Product Spec file
(e.g. Product-Spec-Email-Router.txt or a .docx Word document) or paste text, runs the agentic
workflow (agentic_workflow.generate_report), and returns the three agents'
output to be shown on the same page.
 
Uses only the Python standard library (http.server) - no extra dependencies.
 
Run from the starter/phase_2 directory:
 
    python server.py
 
Then open http://localhost:8000 in your browser.
 
Requires an OpenAI API key available to the agents (OPENAI_API_KEY, e.g. in
starter/phase_2/tests/.env), because the agents call the OpenAI API.
"""
import base64
import io
import json
import os
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from agentic_workflow import DEFAULT_SPEC_FILE, generate_report

HOST = "localhost"
PORT = int(os.getenv("PORT", "8000"))

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX_FILE = os.path.join(HERE, "index.html")
DOCX_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def _extract_docx_text(docx_bytes):
    """Extract plain text from a .docx Word document."""
    with ZipFile(io.BytesIO(docx_bytes)) as archive:
        try:
            document_xml = archive.read("word/document.xml")
        except KeyError as exc:
            raise ValueError("Invalid .docx file: missing word/document.xml") from exc

    root = ET.fromstring(document_xml)
    paragraphs = []
    for paragraph in root.findall(".//w:p", DOCX_NS):
        parts = []
        for text_node in paragraph.findall(".//w:t", DOCX_NS):
            if text_node.text:
                parts.append(text_node.text)
        paragraph_text = "".join(parts).strip()
        if paragraph_text:
            paragraphs.append(paragraph_text)

    return "\n\n".join(paragraphs).strip()


def _resolve_input_text(payload):
    input_type = (payload.get("inputType") or "text").lower()
    content = (payload.get("content") or "").strip()
    file_name = (payload.get("fileName") or "").strip().lower()
    encoded = (payload.get("fileDataBase64") or "").strip()

    looks_like_docx = (
        input_type == "docx"
        or file_name.endswith(".docx")
        or (input_type in ("file", "upload") and encoded)
    )

    if not looks_like_docx:
        return content

    if content:
        return content

    if not encoded:
        raise ValueError("No Word document data provided.")

    try:
        docx_bytes = base64.b64decode(encoded)
    except (ValueError, TypeError) as exc:
        raise ValueError("Invalid Word document data.") from exc

    text = _extract_docx_text(docx_bytes)
    if not text:
        raise ValueError("The uploaded Word document appears to be empty.")
    return text


class Handler(BaseHTTPRequestHandler):
    # ---- helpers ---------------------------------------------------------

    def _send(self, status, body, content_type="application/json"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body)
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):  # quieter logging
        print("[server]", fmt % args)

    # ---- routes ----------------------------------------------------------

    def do_OPTIONS(self):
        self._send(204, "")

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            try:
                with open(INDEX_FILE, "r", encoding="utf-8") as f:
                    html = f.read()
                self._send(200, html, "text/html; charset=utf-8")
            except FileNotFoundError:
                self._send(500, {"error": "index.html not found next to server.py"})
            return

        # Convenience endpoint: load the bundled default product spec text.
        if self.path == "/api/default-spec":
            spec_path = os.path.join(HERE, DEFAULT_SPEC_FILE)
            try:
                with open(spec_path, "r", encoding="utf-8") as f:
                    content = f.read()
                self._send(200, {"content": content, "fileName": DEFAULT_SPEC_FILE})
            except FileNotFoundError:
                self._send(404, {"error": f"{DEFAULT_SPEC_FILE} not found."})
            return

        self._send(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/api/agentic-workflow/generate":
            self._send(404, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            payload = json.loads(raw.decode("utf-8") or "{}")
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "Invalid JSON body."})
            return

        try:
            content = _resolve_input_text(payload)
        except ValueError as exc:
            self._send(400, {"error": str(exc)})
            return

        if not content:
            self._send(400, {"error": "No BRD content provided."})
            return

        try:
            print("[server] Running agentic workflow on submitted BRD...")
            report = generate_report(content)
            print("[server] Workflow completed.")
            self._send(200, report)
        except Exception as exc:  # surface a readable error to the page
            traceback.print_exc()
            self._send(500, {"error": f"{type(exc).__name__}: {exc}"})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"\nRequirements workflow server running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
