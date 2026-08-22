import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  handleProjectDataApi,
  isProtectedProjectDataPath,
} from "./project-data-service.mjs";
import {
  DATA_STUDIO_PRO_RELATIVE_PATH,
  handleDataStudioProApi,
} from "./data-studio-pro-service.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
const STANDARD_PORT = 4173;
const MAX_PORTVERSUCHE = 10;

const MELDUNGEN = Object.freeze({
  start: "Startprüfung -> lokale Voraussetzungen werden geprüft.",
  bereit: "Start abgeschlossen -> PROVOWARE ist lokal erreichbar.",
});

export const optionenLesen = (argumente) => {
  const unbekannt = argumente.filter((wert) => wert !== "--no-browser" && !wert.startsWith("--port="));
  if (unbekannt.length) throw new Error(`Unbekannte Startoption: ${unbekannt[0]}`);
  const portWert = argumente.find((wert) => wert.startsWith("--port="))?.slice(7);
  const port = portWert === undefined ? STANDARD_PORT : Number(portWert);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Der Port muss eine ganze Zahl zwischen 1 und 65535 sein.");
  }
  return { browserOeffnen: !argumente.includes("--no-browser"), port };
};

export const laufzeitAbhaengigkeiten = (paket) => Object.keys(paket.dependencies || {}).sort();

export const nodeVersionPruefen = (version) => {
  const hauptversion = Number(String(version).split(".")[0]);
  if (!Number.isInteger(hauptversion) || hauptversion < 20) {
    throw new Error(`Node.js ${version} ist zu alt. Benötigt wird Node.js 20 oder neuer.`);
  }
};

export const anfragepfadAufloesen = (url = "/") => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  const relativ = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const datei = path.resolve(ROOT, relativ);
  return datei === ROOT || datei.startsWith(`${ROOT}${path.sep}`) ? datei : null;
};

export const inhaltstyp = (datei) => ({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
}[path.extname(datei).toLowerCase()] || "application/octet-stream");

export const isProtectedDataStudioProPath = (filePath, root = ROOT) => {
  const resolved = path.resolve(filePath);
  const proPath = path.resolve(root, DATA_STUDIO_PRO_RELATIVE_PATH);
  return resolved === proPath || resolved.startsWith(`${proPath}.tmp-`);
};

const abhaengigkeitenAufloesen = async () => {
  const paket = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const abhaengigkeiten = laufzeitAbhaengigkeiten(paket);
  if (!abhaengigkeiten.length) {
    console.log("Abhängigkeiten -> keine Laufzeitpakete nötig; Installation übersprungen.");
    return;
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const pruefung = spawnSync(npm, ["ls", "--omit=dev", "--depth=0"], { cwd: ROOT, stdio: "ignore" });
  if (pruefung.status === 0) {
    console.log("Abhängigkeiten -> vollständig vorhanden; Installation übersprungen.");
    return;
  }
  console.log("Abhängigkeiten -> Pakete fehlen; reproduzierbare Installation wird gestartet.");
  const installation = spawnSync(npm, ["install", "--omit=dev", "--no-audit", "--no-fund"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (installation.status !== 0) throw new Error("Paketinstallation fehlgeschlagen. Netzwerk und npm prüfen.");
  console.log("Abhängigkeiten -> Installation erfolgreich; lokaler Start wird fortgesetzt.");
};

const antworten = async (anfrage, antwort) => {
  if (await handleDataStudioProApi(anfrage, antwort, { root: ROOT })) return;
  if (await handleProjectDataApi(anfrage, antwort, { root: ROOT })) return;

  const datei = anfragepfadAufloesen(anfrage.url);
  if (!datei) {
    antwort.writeHead(403).end("Zugriff außerhalb des Projektordners ist nicht erlaubt.");
    return;
  }
  if (isProtectedProjectDataPath(datei, ROOT) || isProtectedDataStudioProPath(datei, ROOT)) {
    antwort.writeHead(403).end("Direkter Zugriff auf lokale Projekt-Laufzeitdaten ist nicht erlaubt.");
    return;
  }
  try {
    if (!(await stat(datei)).isFile()) throw new Error("Kein auslieferbarer Dateipfad");
    antwort.writeHead(200, { "Content-Type": inhaltstyp(datei), "X-Content-Type-Options": "nosniff" });
    createReadStream(datei).pipe(antwort);
  } catch {
    antwort.writeHead(404).end("Datei nicht gefunden.");
  }
};

const serverStarten = (startPort) => new Promise((resolve, reject) => {
  const versuche = (port, rest) => {
    const server = createServer((anfrage, antwort) => void antworten(anfrage, antwort));
    server.once("error", (fehler) => {
      if (fehler.code === "EADDRINUSE" && rest > 1 && port < 65535) versuche(port + 1, rest - 1);
      else reject(fehler);
    });
    server.listen(port, HOST, () => resolve({ port, server }));
  };
  versuche(startPort, MAX_PORTVERSUCHE);
});

const browserStarten = (url) => {
  const befehl = process.platform === "win32"
    ? ["cmd", ["/c", "start", "", url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  const kind = spawn(befehl[0], befehl[1], { detached: true, stdio: "ignore" });
  kind.on("error", () => console.warn(`Browser -> nicht automatisch geöffnet; bitte ${url} aufrufen.`));
  kind.unref();
};

export const starten = async (argumente = process.argv.slice(2)) => {
  const optionen = optionenLesen(argumente);
  console.log(MELDUNGEN.start);
  nodeVersionPruefen(process.versions.node);
  await abhaengigkeitenAufloesen();
  const { port } = await serverStarten(optionen.port);
  const url = `http://${HOST}:${port}/`;
  console.log(`${MELDUNGEN.bereit} ${url}`);
  console.log("Beenden -> dieses Fenster schließen oder Strg+C drücken.");
  if (optionen.browserOeffnen) browserStarten(url);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  starten().catch((fehler) => {
    console.error(`Start fehlgeschlagen -> ${fehler.message} Nächster Schritt: Voraussetzung prüfen und erneut starten.`);
    process.exitCode = 1;
  });
}
