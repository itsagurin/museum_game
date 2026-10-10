import { spawn } from "node:child_process";
import { prepareAssets, watchAssets } from "./prepare-assets.mjs";

await prepareAssets();
const stopWatching = watchAssets();
const server = spawn(process.execPath, [
  "node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "0.0.0.0", ...process.argv.slice(2),
], { stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    stopWatching();
    server.kill(signal);
  });
}
server.once("error", (error) => {
  stopWatching();
  console.error("Could not start the development server:", error.message);
  process.exitCode = 1;
});
server.once("exit", (code) => {
  stopWatching();
  process.exitCode = code ?? 0;
});
