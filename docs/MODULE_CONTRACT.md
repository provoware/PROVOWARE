# Modulvertrag – PROVOWARE ALL-IN 2026

## Zweck

Der Modulvertrag legt fest, welche Mindestangaben ein späteres Tool liefern muss und wie es sich im laufenden System verhält. Dadurch bleibt die Hauptoberfläche unabhängig von einzelnen Werkzeugen.

## Begriffe in einfacher Sprache

- **Manifest (Steckbrief):** beschreibt ein Modul, ohne es auszuführen.
- **Registry (Modulverzeichnis):** kennt alle erlaubten Modul-Steckbriefe.
- **Implementation (Ausführungsteil):** enthält die Funktionen, die beim Aktivieren, Deaktivieren und Entfernen ausgeführt werden.
- **API-Version (Vertragsversion):** zeigt, welche Fassung des Modulvertrags ein Modul erwartet.
- **Lifecycle (Lebenszyklus):** feste Reihenfolge der Zustände eines Moduls.

## Vertragsversion

Aktuell: `1`

Ein Modul mit einer anderen `apiVersion` wird abgewiesen, bevor es geladen wird.

## Manifest

Jeder spätere Registry-Eintrag muss mindestens diese Angaben enthalten:

| Feld | Pflicht | Bedeutung |
| --- | --- | --- |
| `id` | ja | dauerhafte technische Modul-ID in Kleinbuchstaben und Bindestrichen |
| `name` | ja | sichtbarer Klarname, 1 bis 80 Zeichen |
| `version` | ja | Modulversion im Schema `MAJOR.MINOR.PATCH` |
| `apiVersion` | ja | Version des PROVOWARE-Modulvertrags, aktuell `1` |
| `entry` | ja | lokaler JavaScript-Einstiegspunkt unter `modules/<id>/` |
| `enabledByDefault` | ja | legt fest, ob das Modul beim Registry-Start automatisch aktiviert wird |
| `description` | nein | kurze Beschreibung |
| `slots` | nein | erlaubte spätere Arbeitsflächen-Ziele |
| `capabilities` | nein | ausdrücklich deklarierte Fähigkeiten |

## Schematisches Beispiel

Das folgende Beispiel ist nur Dokumentation und wird nicht als reales Modul registriert:

```js
{
  id: "beispiel-tool",
  name: "Beispiel Tool",
  version: "1.0.0",
  apiVersion: "1",
  entry: "modules/beispiel-tool/module.js",
  enabledByDefault: false,
  description: "Nur schematisches Beispiel.",
  slots: ["arbeitsbereich"],
  capabilities: []
}
```

## Laufzeitvertrag

Ein geladenes Modul muss sich während des Ladens exakt einmal mit seiner bekannten `id` definieren.

Schematisch:

```js
window.PROVOWARE_MODULES.define("beispiel-tool", {
  async activate(context) {
    // Modul aktivieren.
  },

  async deactivate(context) {
    // Laufende Funktion sauber stoppen.
  },

  async dispose(context) {
    // Ereignisse, Timer oder eigene Laufzeitobjekte vollständig aufräumen.
  }
});
```

Alle drei Methoden sind Pflicht. Das verhindert Module, die zwar gestartet, aber nicht sauber beendet oder entfernt werden können.

## Lebenszyklus

Normaler Weg:

`registered -> loading -> loaded -> active -> inactive -> registered`

Bedeutung:

1. `registered` – Modul ist bekannt, aber nicht geladen.
2. `loading` – Einstiegspunkt wird gerade geladen.
3. `loaded` – Code wurde geladen und hat den Vertrag erfüllt.
4. `active` – Modul ist aktiv.
5. `inactive` – Modul ist geladen, aber gestoppt.
6. `registered` – nach `remove()` wurde Laufzeitcode entfernt; der Katalogeintrag bleibt bekannt.
7. `error` – ein kontrollierter Fehler ist aufgetreten.

## Öffentliche Registry-Funktionen

- `initialize()` – validiert den leeren oder später gefüllten Katalog.
- `define(id, implementation)` – verbindet einen geladenen Einstiegspunkt mit seinem Laufzeitteil.
- `load(id)` – lädt ein bekanntes Modul genau über seinen lokalen Einstiegspfad.
- `activate(id)` – lädt bei Bedarf und aktiviert das Modul.
- `deactivate(id)` – stoppt ein aktives Modul.
- `remove(id)` – räumt Laufzeitdaten auf und entfernt den geladenen Script-Knoten.
- `getSnapshot()` – liefert einen schreibgeschützten Überblick über bekannte Module und Zustände.
- `setLogger(fn)` – verbindet die Registry mit dem vorhandenen PROVOWARE-Logging.
- `validateManifest(manifest)` – prüft einen einzelnen Steckbrief gegen Vertragsversion 1.

## Sicherheits- und Robustheitsgrenzen

- Einstiegspunkte dürfen das Projekt nicht über `..` verlassen.
- Einstiegspunkte müssen unter `modules/<id>/` liegen.
- Remote-URLs sind als Moduleinstieg nicht erlaubt.
- doppelte IDs sind verboten.
- automatische Aktivierung ist nur mit `enabledByDefault: true` erlaubt.
- fehlende Lebenszyklusmethoden führen zu einem kontrollierten Vertragsfehler.
- Fehler eines Moduls dürfen die übrige Anwendung nicht unkontrolliert stoppen.

## Bewusst noch nicht enthalten

- keine Berechtigungsdialoge
- keine Remote-Module
- keine Paketinstallation
- keine signierten Plugins
- keine UI-Komponentenregistrierung
- keine Speicherung von Modulzuständen

Diese Funktionen werden erst ergänzt, wenn ein realer Anwendungsfall sie benötigt.
