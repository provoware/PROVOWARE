import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const AUDIO_FIXTURE = path.resolve("tests/fixtures/media/test-tone.wav");
const VIDEO_FIXTURE = path.resolve("tests/fixtures/media/test-card.webm");

const artifactRoot = (projectName) => path.resolve("artifacts", "browser-e2e", projectName);

const medienBereitAbwarten = async (player, { video = false } = {}) => {
  await expect.poll(async () => player.evaluate((element, istVideo) => {
    const basisBereit = element.readyState >= 1 && Number.isFinite(element.duration) && element.duration > 0;
    if (!basisBereit) return false;
    if (!istVideo) return true;
    return element.videoWidth > 0 && element.videoHeight > 0;
  }, video)).toBe(true);

  return player.evaluate((element) => ({
    readyState: element.readyState,
    duration: element.duration,
    videoWidth: element.videoWidth || 0,
    videoHeight: element.videoHeight || 0,
  }));
};

const echteWiedergabePruefen = async (player) => {
  const ergebnis = await player.evaluate(async (element) => {
    element.muted = true;
    await element.play();
    await new Promise((resolve) => setTimeout(resolve, 140));
    const status = {
      currentTime: element.currentTime,
      duration: element.duration,
      paused: element.paused,
      readyState: element.readyState,
    };
    element.pause();
    return status;
  });

  expect(ergebnis.readyState).toBeGreaterThanOrEqual(2);
  expect(ergebnis.duration).toBeGreaterThan(0);
  expect(ergebnis.currentTime).toBeGreaterThan(0);
  return ergebnis;
};

test("Headquarter spielt echte WAV- und WebM-Fixtures ab und behandelt defekte Medien kontrolliert", async ({ page }, testInfo) => {
  await page.goto("/");

  const dashboard = page.locator("#headquarter-dashboard");
  await expect(dashboard).toBeVisible();

  const inputs = dashboard.locator(".hq-media-input");
  const audioInput = inputs.nth(0);
  const videoInput = inputs.nth(1);
  const audio = dashboard.locator("audio");
  const video = dashboard.locator("video");

  await audioInput.setInputFiles(AUDIO_FIXTURE);
  await expect(dashboard.locator(".hq-media-track", { hasText: "test-tone.wav" })).toHaveCount(1);
  const audioMetadaten = await medienBereitAbwarten(audio);
  expect(audioMetadaten.readyState).toBeGreaterThanOrEqual(1);
  expect(audioMetadaten.duration).toBeGreaterThan(0.2);
  const audioPlayback = await echteWiedergabePruefen(audio);
  expect(audioPlayback.currentTime).toBeGreaterThan(0.02);

  await videoInput.setInputFiles(VIDEO_FIXTURE);
  await expect(dashboard.locator(".hq-media-track", { hasText: "test-card.webm" })).toHaveCount(1);
  const videoMetadaten = await medienBereitAbwarten(video, { video: true });
  expect(videoMetadaten.readyState).toBeGreaterThanOrEqual(1);
  expect(videoMetadaten.duration).toBeGreaterThan(0.5);
  expect(videoMetadaten.videoWidth).toBeGreaterThan(0);
  expect(videoMetadaten.videoHeight).toBeGreaterThan(0);
  const videoPlayback = await echteWiedergabePruefen(video);
  expect(videoPlayback.currentTime).toBeGreaterThan(0.02);

  await audioInput.setInputFiles({
    name: "defekt.mp3",
    mimeType: "audio/mpeg",
    buffer: Buffer.from("PROVOWARE-H1-NOT-A-REAL-MEDIA-FILE", "utf8"),
  });
  const defekt = dashboard.locator(".hq-media-track", { hasText: "defekt.mp3" });
  await expect(defekt).toHaveCount(1);
  await defekt.click();
  await expect(dashboard.locator(".hq-media-status").first()).toContainText("Format oder Codec", {
    ignoreCase: true,
  });

  await expect(dashboard).toBeVisible();
  await expect(dashboard.locator(".hq-lamp[data-tone='active']")).toContainText(/Audio|Video/);

  const directory = artifactRoot(testInfo.project.name);
  await mkdir(directory, { recursive: true });
  await dashboard.screenshot({
    path: path.join(directory, "09-headquarter-real-media.png"),
    animations: "disabled",
  });
});
