import { spawn } from "node:child_process";

// Collect every report even when one of the strict budgets fails.
for (const script of ["audit:lhci", "audit:scenes"]) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", resolve);
  });
  if (code !== 0) process.exitCode = 1;
}
