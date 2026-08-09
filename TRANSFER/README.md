# PROVOWARE Transfer V1

**Projektversion:** `0.1.0-dev`  
**Baseline:** `BASELINE-2026-08-09-I006`  
**Transferstandard:** `1.0.0`  
**Status:** repo-integrierter, offline-fähiger, vollautomatischer Transfer- und Installationsweg.

## Größen

Die aktuell validierte Referenzübergabe besitzt:

- Vollständiges Transfer-ZIP: **295,21 MB** (`281,53 MiB`) · 295.210.603 Byte.
- Teil 001–011: jeweils **25,17 MB** (`24,00 MiB`) · 25.165.824 Byte.
- Teil 012: **18,39 MB** (`17,53 MiB`) · 18.386.539 Byte.
- Installer: **0,009 MB** · 8.855 Byte.
- Starter-ZIP: **0,006 MB** · 5.839 Byte.
- I005-Wheelhouse-Nutzinhalt: **294,43 MB** (`280,79 MiB`) · 294.428.822 Byte.
- I006-Evidence-Artefakt: **0,003 MB** · 3.001 Byte.

SHA-256 des validierten Referenz-Gesamtarchivs:

`9b91cd77787ca01ada815b26920967774a918c889b69522f8d00cbc3329a6b17`

## Grundregel

Die `.pvpart`-Dateien niemals einzeln entpacken oder umbenennen. Der Installer prüft jede Datei, rekonstruiert das Originalarchiv, prüft dessen SHA-256 und ZIP-Struktur, validiert die Projektbaseline, sichert einen vorhandenen Zielstand und ersetzt ihn erst danach atomar.

## Installation aus bereits heruntergeladenen Transferteilen

Alle 12 `.pvpart`-Dateien und `PROVOWARE_INSTALLIEREN.sh` in denselben Ordner legen.

### 1. Ordner anlegen

```bash
mkdir -p "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
cd "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
```

### 2. Prüfen, ob alle Teile vorhanden sind

```bash
ls -lh PROVOWARE_INSTALLIEREN.sh PROVOWARE_I006_TRANSFER_V1.teil*.pvpart
```

Es müssen **12 Teilstücke** angezeigt werden.

### 3. Optional: veröffentlichte Prüfsummen vorab prüfen

Falls `SHA256SUMMEN.txt` im Ordner liegt:

```bash
sha256sum -c SHA256SUMMEN.txt
```

### 4. Installer ausführbar machen

```bash
chmod +x PROVOWARE_INSTALLIEREN.sh
```

### 5. Vollautomatische Installation starten

```bash
bash PROVOWARE_INSTALLIEREN.sh
```

Ab diesem Befehl läuft die Installation ohne weitere Eingabe.

Standardziel:

```text
~/PROVOWARE
```

Vorhandene Installation:

```text
~/PROVOWARE_Backup/<Zeitstempel>_PROVOWARE_vor_BASELINE-2026-08-09-I006
```

### 6. Installation danach prüfen

```bash
cd "$HOME/PROVOWARE"
python3 WERKZEUGE/baseline_pruefen.py
cat TRANSFER/INSTALLATIONSNACHWEIS.json
```

## Anderen Zielordner verwenden

```bash
cd "$HOME/Downloads/PROVOWARE_I006_TRANSFER_V1"
PROVOWARE_ZIEL="$HOME/PROVOWARE_TEST" bash PROVOWARE_INSTALLIEREN.sh
cd "$HOME/PROVOWARE_TEST"
python3 WERKZEUGE/baseline_pruefen.py
cat TRANSFER/INSTALLATIONSNACHWEIS.json
```

## Repository lokal holen

```bash
cd "$HOME"
git clone https://github.com/provoware/PROVOWARE.git
cd PROVOWARE
python3 WERKZEUGE/baseline_pruefen.py
```

Besteht der Ordner bereits:

```bash
cd "$HOME/PROVOWARE"
git status
git pull --ff-only
python3 WERKZEUGE/baseline_pruefen.py
```

## Transferpaket lokal aus einem vollständigen ZIP neu teilen

```bash
cd "$HOME/PROVOWARE"
python3 TRANSFER/transferpaket_bauen.py \
  /pfad/zum/PROVOWARE_VOLLSTAENDIG.zip \
  "$HOME/Downloads/PROVOWARE_TRANSFER_NEU" \
  --teil-mib 24 \
  --baseline BASELINE-2026-08-09-I006
```

Danach:

```bash
cd "$HOME/Downloads/PROVOWARE_TRANSFER_NEU"
ls -lh
cat PROVOWARE_TRANSFER_MANIFEST.json
```

## Repo-integrierten Transfer-Workflow per GitHub CLI starten

Voraussetzung: `gh` ist installiert und angemeldet.

```bash
gh auth status
gh workflow run transfer-v1.yml -R provoware/PROVOWARE
gh run list -R provoware/PROVOWARE --workflow transfer-v1.yml --limit 5
```

Nach Ermittlung der Run-ID:

```bash
gh run view RUN_ID -R provoware/PROVOWARE
gh run download RUN_ID -R provoware/PROVOWARE
```

Artefakt direkt in einen Zielordner laden:

```bash
mkdir -p "$HOME/Downloads/PROVOWARE_GITHUB_TRANSFER"
gh run download RUN_ID \
  -R provoware/PROVOWARE \
  -D "$HOME/Downloads/PROVOWARE_GITHUB_TRANSFER"
```

## Manuelle Rückfallprüfung

Backups anzeigen:

```bash
ls -lah "$HOME/PROVOWARE_Backup"
```

Neuestes Backup ermitteln:

```bash
ls -1dt "$HOME"/PROVOWARE_Backup/* 2>/dev/null | head -n 1
```

Der Installer führt seinen Rückfall bei einem Fehler nach der Sicherung automatisch aus. Eine manuelle Wiederherstellung sollte nur durchgeführt werden, wenn der automatische Mechanismus selbst nicht mehr ausführbar ist.

## Repo-Integration großer Binärteile

Die rund **295 MB** Transferdaten werden **nicht als normale Git-Blobs** in die Repository-Historie geschrieben. Das würde jeden Clone dauerhaft aufblähen. Stattdessen erzeugt `.github/workflows/transfer-v1.yml` die vollständige, geprüfte Übergabe aus der Repo-Baseline und den bereits qualifizierten I005/I006-Artefakten und veröffentlicht sämtliche Teilstücke, Installer, Manifest, Prüfsummen und Testnachweise gemeinsam als GitHub-Actions-Artefakt.

Damit sind **alle Bestandteile im Repository-Prozess integriert**, ohne die Git-Historie mit knapp 300 MB Binärdaten pro Iteration zu belasten.
