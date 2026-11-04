import http from "node:http";
import https from "node:https";
import { spawn } from "node:child_process";

const server = process.env.AUDIT_URL ? null : spawn(process.execPath, ["scripts/preview-audit.mjs"], { stdio: "inherit" });
const env = { ...process.env, AUDIT_URL: process.env.AUDIT_URL || "https://127.0.0.1:4173", AUDIT_ASSERT: "1" };
try {
  let ready = false;
  for (let attempt = 0; attempt < 300; attempt++) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) throw new Error("Static server exited before the audit");
    ready = await new Promise(resolve => {
      const url = new URL(env.AUDIT_URL);
      const local = ["localhost", "127.0.0.1"].includes(url.hostname);
      const request = (url.protocol === "https:" ? https : http).request(url, { method: "HEAD", rejectUnauthorized: !local }, response => { response.resume(); resolve(response.statusCode === 200); });
      request.on("error", () => resolve(false)); request.setTimeout(1000, () => request.destroy()); request.end();
    });
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Static export is unavailable; run npm run build first");
  for (const script of ["audit-performance", "audit-interactions", "audit-pwa"]) {
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [`scripts/${script}.mjs`], { env, stdio: "inherit" });
      child.once("error", reject);
      child.once("exit", resolve);
    });
    if (code !== 0) process.exitCode = 1;
  }
} finally { server?.kill(); }
