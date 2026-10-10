import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 3000);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 40000,
  workers: 4,
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --listen ${port} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
