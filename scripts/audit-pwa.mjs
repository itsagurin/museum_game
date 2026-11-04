import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const target = new URL(process.env.AUDIT_URL || "http://127.0.0.1:3101");
const localTLS = target.protocol === "https:" && ["localhost", "127.0.0.1"].includes(target.hostname);
const browser = await chromium.launch({ args: localTLS ? ["--ignore-certificate-errors"] : [] });
try {
  const page = await browser.newPage();
  await page.goto(process.env.AUDIT_URL || "http://127.0.0.1:3101");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  const session = await page.context().newCDPSession(page);
  const { installabilityErrors } = await session.send("Page.getInstallabilityErrors");
  const manifest = await session.send("Page.getAppManifest");
  const result = { installabilityErrors, manifestErrors: manifest.errors, manifest: JSON.parse(manifest.data), note: "Chromium installability check; physical Android/iOS installation remains manual" };
  const output = process.env.AUDIT_OUTPUT || ".lighthouseci/pwa";
  await mkdir(output, { recursive: true });
  await writeFile(`${output}/installability.json`, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ installabilityErrors, manifestErrors: manifest.errors }));
  if (installabilityErrors.length || manifest.errors.length) process.exitCode = 1;
} finally { await browser.close(); }
