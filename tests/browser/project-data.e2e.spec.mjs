import { expect, test } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const artifactRoot = (projectName) => path.resolve("artifacts", "browser-e2e", projectName);

const screenshot = async (page, projectName, filename) => {
  const directory = artifactRoot(projectName);
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, filename),
    fullPage: true,
    animations: "disabled",
  });
};

const selectTemplate = async (page, templateName) => {
  const select = page.locator("[data-template-select]");
  await select.selectOption({ label: templateName });
  await expect(select).toHaveValue(/.+/);
};

const currentRecordInput = (page) => page.locator("[data-record-fields] [data-record-field-id]").first();

const recordItem = (page, text) => page.locator("[data-record-list] .data-studio-record-item", { hasText: text });

const waitForModules = async (page) => {
  await expect(page.locator("#development-note-input")).toBeVisible();
  await expect(page.locator("[data-data-studio-status]")).toContainText("bereit", { ignoreCase: true });
  await expect(page.locator("[data-recovery-status]")).toContainText("bereit", { ignoreCase: true });
};

test.describe.configure({ mode: "serial" });

test("Chromium-first Kernkette: Notiz, CRUD, Reload, Backup, Restore, Export und Import", async ({ page }, testInfo) => {
  const suffix = testInfo.project.name;
  const templateName = `Browser E2E ${suffix}`;
  const fieldLabel = `E2E-Datensatz ${suffix}`;
  const noteText = `Browser-E2E Notiz ${suffix}`;
  const alpha = `Alpha ${suffix}`;
  const beta = `Beta ${suffix}`;
  const gamma = `Gamma ${suffix}`;

  await page.goto("/");
  await waitForModules(page);
  await screenshot(page, suffix, "01-start.png");

  const noteInput = page.locator("#development-note-input");
  await noteInput.fill(noteText);
  await noteInput.press("Enter");
  await expect(page.locator(".development-note-status")).toContainText("gespeichert", { ignoreCase: true });

  const noteResponse = await page.request.get("/data/ENTWICKLUNGSNOTIZEN.txt");
  expect(noteResponse.ok()).toBeTruthy();
  const noteFile = await noteResponse.text();
  expect(noteFile).toContain(noteText);
  expect(noteFile).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);

  await page.locator("[data-action='new-template']").click();
  await page.locator("[data-template-name]").fill(templateName);
  await page.locator(".data-studio-field-label").first().fill(fieldLabel);
  await page.locator("[data-action='save-template']").click();
  await expect(page.locator("[data-data-studio-status]")).toContainText("Vorlage gespeichert", { ignoreCase: true });

  await currentRecordInput(page).fill(alpha);
  await page.locator("[data-record-form]").getByRole("button", { name: "Datensatz speichern" }).click();
  await expect(page.locator("[data-data-studio-status]")).toContainText("Datensatz gespeichert", { ignoreCase: true });
  await expect(recordItem(page, alpha)).toHaveCount(1);
  await screenshot(page, suffix, "02-record-created.png");

  await page.reload();
  await waitForModules(page);
  await selectTemplate(page, templateName);
  await expect(recordItem(page, alpha)).toHaveCount(1);

  await recordItem(page, alpha).getByRole("button", { name: "Bearbeiten" }).click();
  await currentRecordInput(page).fill(beta);
  await page.locator("[data-record-form]").getByRole("button", { name: "Änderungen speichern" }).click();
  await expect(recordItem(page, beta)).toHaveCount(1);

  await page.locator("[data-action='create-backup']").click();
  await expect(page.locator("[data-recovery-status]")).toContainText("Backup erstellt", { ignoreCase: true });
  const backupStatus = await page.locator("[data-recovery-status]").textContent();
  const backupId = backupStatus?.match(/project-data-\d{8}T\d{6}Z-[0-9a-f-]+\.pwbak/)?.[0];
  expect(backupId).toBeTruthy();

  await recordItem(page, beta).getByRole("button", { name: "Bearbeiten" }).click();
  await currentRecordInput(page).fill(gamma);
  await page.locator("[data-record-form]").getByRole("button", { name: "Änderungen speichern" }).click();
  await expect(recordItem(page, gamma)).toHaveCount(1);

  const ownBackup = page.locator("[data-backup-list] .data-studio-record-item", { hasText: backupId });
  await ownBackup.getByRole("button", { name: "Vorschau" }).click();
  await expect(page.locator("[data-restore-preview]")).toContainText(backupId);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("[data-action='confirm-restore']").click();
  await expect(page.locator("[data-recovery-status]")).toContainText("Restore abgeschlossen", { ignoreCase: true });

  await page.locator("[data-action='refresh']").click();
  await selectTemplate(page, templateName);
  await expect(recordItem(page, beta)).toHaveCount(1);
  await expect(recordItem(page, gamma)).toHaveCount(0);
  await screenshot(page, suffix, "03-restored.png");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-action='export']").click();
  const download = await downloadPromise;
  const exportDirectory = artifactRoot(suffix);
  await mkdir(exportDirectory, { recursive: true });
  const exportPath = path.join(exportDirectory, "project-data-export.json");
  await download.saveAs(exportPath);
  const exported = JSON.parse(await readFile(exportPath, "utf8"));
  expect(exported.schemaVersion).toBe(1);
  expect(exported.templates.some((item) => item.name === templateName)).toBeTruthy();

  page.once("dialog", (dialog) => dialog.accept());
  await recordItem(page, beta).getByRole("button", { name: "Löschen" }).click();
  await expect(recordItem(page, beta)).toHaveCount(0);

  await page.locator("[data-import-file]").setInputFiles(exportPath);
  await expect(page.locator("[data-recovery-status]")).toContainText("Import-Vorschau", { ignoreCase: true });
  await expect(page.locator("[data-import-preview]")).toContainText("Schema 1");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("[data-action='confirm-import']").click();
  await expect(page.locator("[data-recovery-status]")).toContainText("Import abgeschlossen", { ignoreCase: true });

  await page.locator("[data-action='refresh']").click();
  await selectTemplate(page, templateName);
  await expect(recordItem(page, beta)).toHaveCount(1);
  await screenshot(page, suffix, "04-import-restored.png");
});

test("HTML-Mirror bildet die echte UI geometrisch proportional ab und erzeugt Screenshot-Evidenz", async ({ page }, testInfo) => {
  await page.goto("/tests/browser/ui-mirror.html");

  const status = page.locator("[data-mirror-status]");
  await expect(status).toHaveAttribute("data-state", "pass", { timeout: 15_000 });
  await expect(status).toContainText("PASS");

  const evidence = await page.evaluate(() => window.PROVOWARE_MIRROR_EVIDENCE);
  expect(evidence.pass).toBe(true);
  expect(evidence.sourceViewport).toEqual([1366, 900]);
  expect(evidence.mirroredViewport).toEqual([1366, 900]);
  expect(evidence.requestedScale).toBe(0.5);
  expect(evidence.measuredScale).toBe(0.5);
  expect(evidence.keyGeometryIdentical).toBe(true);

  const scaled = page.locator("#mirror-scaled");
  const intrinsic = await scaled.evaluate((frame) => ({
    width: frame.clientWidth,
    height: frame.clientHeight,
  }));
  const visual = await scaled.boundingBox();
  expect(intrinsic).toEqual({ width: 1366, height: 900 });
  expect(Math.round(visual.width)).toBe(683);
  expect(Math.round(visual.height)).toBe(450);

  const directory = artifactRoot(testInfo.project.name);
  await mkdir(directory, { recursive: true });
  await page.locator(".mirror-page").screenshot({
    path: path.join(directory, "05-ui-mirror-pipeline.png"),
    animations: "disabled",
  });
  await page.locator("#mirror-scaled-wrap").screenshot({
    path: path.join(directory, "06-ui-mirror-scaled.png"),
    animations: "disabled",
  });
});
