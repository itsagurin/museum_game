import http2 from "node:http2";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { brotliCompressSync, constants } from "node:zlib";

// Local measurement fixture: HTTP/2 and precompressed Brotli, without timing the encoder.
// Its temporary certificate is accepted only by the audit browser on loopback URLs.
const root = resolve(process.env.AUDIT_ROOT || "out");
const port = Number(process.env.AUDIT_PORT || 4173);
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const temporary = mkdtempSync(join(tmpdir(), "dziedzictwo-audit-"));
const key = join(temporary, "key.pem"), cert = join(temporary, "cert.pem");
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert, "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1", "-days", "2"], { stdio: "ignore" });
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".txt": "text/plain" };
const records = new Map();
function compress(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) compress(file);
    else if (/\.(?:html|js|css|json|webmanifest|svg|txt)$/.test(file)) {
      const raw = readFileSync(file);
      records.set(file, { raw, br: brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }) });
    }
  }
}
compress(root);
const server = http2.createSecureServer({ key: readFileSync(key), cert: readFileSync(cert), allowHTTP1: true }, (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); response.end(); return; }
    let pathname = decodeURIComponent(new URL(request.url, "https://localhost").pathname);
    if (base) {
      if (!pathname.startsWith(`${base}/`) && pathname !== base) throw new Error("Outside base path");
      pathname = pathname.slice(base.length) || "/";
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}/`)) throw new Error("Outside export");
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    let record = records.get(file);
    if (!record) { record = { raw: readFileSync(file) }; records.set(file, record); }
    const acceptsBr = /(?:^|,)\s*br(?:\s*,|\s*$)/.test(request.headers["accept-encoding"] || "");
    const body = acceptsBr && record.br ? record.br : record.raw;
    response.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": "no-cache", "vary": "Accept-Encoding", "content-length": body.length, ...(body === record.br ? { "content-encoding": "br" } : {}) });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch { response.writeHead(404); response.end(); }
});
const sessions = new Set();
server.on("session", session => { sessions.add(session); session.on("close", () => sessions.delete(session)); });
const stop = () => { sessions.forEach(session => session.destroy()); server.close(() => rmSync(temporary, { recursive: true, force: true })); };
process.once("SIGINT", stop); process.once("SIGTERM", stop);
server.on("error", error => { rmSync(temporary, { recursive: true, force: true }); throw error; });
server.listen(port, "127.0.0.1", () => console.log(`Audit export ready: https://127.0.0.1:${port}${base}/`));
