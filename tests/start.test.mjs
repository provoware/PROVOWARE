import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, mkdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import test from "node:test";
import {
  anfragepfadAufloesen,
  inhaltstyp,
  laufzeitAbhaengigkeiten,
  nodeVersionPruefen,
  optionenLesen,
  statischenDateipfadPruefen,
} from "../scripts/start.mjs";

test("Startoptionen verwenden sichere Vorgaben und prüfen den Port", () => {
  assert.deepEqual(optionenLesen([]), { browserOeffnen: true, port: 4173 });
  assert.deepEqual(optionenLesen(["--no-browser", "--port=4200"]), { browserOeffnen: false, port: 4200 });
  assert.throws(() => optionenLesen(["--port=0"]), /zwischen 1 und 65535/);
  assert.throws(() => optionenLesen(["--falsch"]), /Unbekannte Startoption/);
});

test("Abhängigkeitsliste enthält ausschließlich sortierte Laufzeitpakete", () => {
  assert.deepEqual(laufzeitAbhaengigkeiten({ dependencies: { z: "1", a: "1" }, devDependencies: { test: "1" } }), ["a", "z"]);
  assert.deepEqual(laufzeitAbhaengigkeiten({}), []);
});

test("Startprüfung lehnt eine zu alte Node-Version verständlich ab", () => {
  assert.doesNotThrow(() => nodeVersionPruefen("20.0.0"));
  assert.throws(() => nodeVersionPruefen("18.20.0"), /Node.js 20 oder neuer/);
});

test("Serverpfade bleiben im Projekt und die Startseite ist index.html", () => {
  assert.equal(path.basename(anfragepfadAufloesen("/")), "index.html");
  assert.equal(path.basename(anfragepfadAufloesen("/assets/styles.css")), "styles.css");
  assert.equal(anfragepfadAufloesen("/%2e%2e%2f%2e%2e%2fetc/passwd"), null);
  assert.equal(anfragepfadAufloesen("/%E0%A4%A"), null);
});

test("Server verweigert versteckte interne Dateien und Ordner", () => {
  for (const url of ["/.git/config", "/.env", "/data/.secret", "/%2Egit/config", "/data/%2Esecret"]) {
    assert.equal(anfragepfadAufloesen(url), null, url);
  }
  assert.equal(path.basename(anfragepfadAufloesen("/assets/styles.css")), "styles.css");
});

test("Lokale Dateien erhalten nachvollziehbare Inhaltstypen", () => {
  assert.equal(inhaltstyp("index.html"), "text/html; charset=utf-8");
  assert.equal(inhaltstyp("assets/app.js"), "text/javascript; charset=utf-8");
  assert.equal(inhaltstyp("datei.bin"), "application/octet-stream");
});

test("Kanonische statische Pfade bleiben auf öffentliche Projektdateien begrenzt", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "provoware-static-"));
  try {
    await mkdir(path.join(root, "assets"));
    const publicFile = path.join(root, "assets", "public.js");
    await writeFile(publicFile, "public");
    assert.equal(await statischenDateipfadPruefen(publicFile, root), await realpath(publicFile));
    assert.equal(await statischenDateipfadPruefen(root, root), null);
    assert.equal(await statischenDateipfadPruefen(path.dirname(root), root), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Statischer Serverpfad verweigert Symlinks auf externe, versteckte und geschützte Ziele", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "provoware-static-"));
  const external = await mkdtemp(path.join(tmpdir(), "provoware-private-"));
  try {
    await mkdir(path.join(root, "assets"));
    await mkdir(path.join(root, "data"));
    await mkdir(path.join(root, "data", "recovery"));
    const publicFile = path.join(root, "assets", "public.js");
    const externalFile = path.join(external, "private.txt");
    await writeFile(publicFile, "public");
    await writeFile(externalFile, "private");
    await writeFile(path.join(root, ".secret"), "private");
    await writeFile(path.join(root, "data", "project-data.json"), "{}");
    await writeFile(path.join(root, "data", "data-studio-pro.json"), "{}");
    await writeFile(path.join(root, "data", "recovery", "recovery-envelope-journal.json"), "{}");

    const links = [
      ["external.txt", externalFile],
      ["hidden.txt", path.join(root, ".secret")],
      ["database.json", path.join(root, "data", "project-data.json")],
      ["pro.json", path.join(root, "data", "data-studio-pro.json")],
      ["journal.json", path.join(root, "data", "recovery", "recovery-envelope-journal.json")],
      ["public-alias.js", publicFile],
    ];
    try {
      for (const [name, target] of links) {
        await symlink(target, path.join(root, "assets", name), "file");
      }
    } catch (error) {
      if (["EPERM", "EACCES", "ENOSYS", "ENOTSUP"].includes(error.code)) {
        t.skip("Symbolische Links sind auf diesem Testsystem nicht erlaubt.");
        return;
      }
      throw error;
    }

    for (const name of ["external.txt", "hidden.txt", "database.json", "pro.json", "journal.json"]) {
      assert.equal(await statischenDateipfadPruefen(path.join(root, "assets", name), root), null, name);
    }
    assert.equal(
      await statischenDateipfadPruefen(path.join(root, "assets", "public-alias.js"), root),
      await realpath(publicFile),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(external, { recursive: true, force: true });
  }
});
