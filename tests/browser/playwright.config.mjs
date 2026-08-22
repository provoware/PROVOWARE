import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.spec.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 8_000,
  },
  outputDir: "../../test-results/browser-e2e",
  reporter: [
    ["line"],
    ["html", { outputFolder: "../../playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1100 },
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
  ],
  webServer: {
    command: "node scripts/browser-e2e-server.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
