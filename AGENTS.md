# AGENTS.md

## Geltungsbereich

Diese Regeln gelten für alle Entwickler, Automationen und KI-Agenten, die an diesem Repository arbeiten.

## Arbeitsprinzip

1. Vor jeder Änderung Ziel, betroffene Dateien, Abhängigkeiten und Risiken bestimmen.
2. Nur den kleinsten sinnvollen Patch umsetzen.
3. Keine fremden oder nicht zugehörigen Änderungen mitnehmen.
4. Vorhandene Datenformate, IDs und Migrationspfade erhalten.
5. Nach jeder Änderung die kleinste passende Prüfung ausführen.
6. Fehler nicht verdecken, sondern Ursache, Auswirkung und Restunsicherheit dokumentieren.

## Pflichtanforderungen

- vollständig offline nutzbarer Kern
- keine CDN- oder Cloud-Pflicht
- klare Modulgrenzen und kleine Funktionen
- verständliche deutsche Hilfetexte ohne unnötigen Fachjargon
- Beispiele, Pro, Contra, Alternative und Empfehlung bei wichtigen Entscheidungen
- Tastaturbedienung und sichtbarer Fokus
- Vorvalidierung, Vorschau, Ausführung und Nachprüfung bei riskanten Aktionen
- versionierte Datenmodelle, Snapshots und Wiederherstellung
- keine destruktive Aktion ohne Sicherung oder Git-Historie

## Prüfklassen

- **L0:** Syntax, JSON, Format und Dateipfade
- **L1:** betroffene Unit- und Regeltests
- **L2:** repräsentativer Workflow- oder Browser-Smoke-Test
- **L3:** vollständige Release-, Migrations- und Barrierefreiheitsabnahme

Nicht jede Änderung benötigt L3. Umfangreiche Prüfungen nur an Meilensteinen oder bei querschnittlichen Änderungen ausführen.

## Commit-Regeln

- ein fachlich zusammenhängender Zweck pro Commit
- kurze, eindeutige Commit-Nachricht
- generierte Dateien nur zusammen mit Quelle und Buildnachweis aktualisieren
- keine geheimen Daten, Nutzerdaten, temporären Artefakte oder lokalen Caches committen

## Abschlussformat jeder Iteration

- erledigte Änderungen
- ausgeführte Prüfungen
- offene Risiken
- direkt folgender technischer Schritt
- alternative Verbesserung mit hohem Nutzen und geringem Risiko
