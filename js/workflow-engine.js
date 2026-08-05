(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  const fallbackQuestions = {
    catalogVersion: "1.0.0",
    phases: [
      { id: "project", title: "Projektkern" },
      { id: "users", title: "Nutzer" },
      { id: "platform", title: "Plattform" },
      { id: "data", title: "Daten" }
    ],
    questions: [
      {
        id: "project.goal_clarity", phaseId: "project", type: "single", required: true,
        title: "Wie klar ist das Hauptziel des Projekts?",
        shortHelp: "Wähle, wie genau das gewünschte Ergebnis bereits beschrieben werden kann.",
        why: "Ein klares Ziel verhindert, dass Funktionen ohne gemeinsamen Zweck gesammelt werden.",
        example: "Das Tool soll Bilder und Audiodateien offline zu einem Video verbinden.",
        pro: "Klare Ziele erleichtern Priorisierung, Tests und Abnahme.",
        contra: "Zu frühe Details können sinnvolle Varianten unnötig ausschließen.",
        alternative: "Mit einer kurzen Problemformulierung starten und das Ziel später schärfen.",
        recommendation: "Ein messbares Ziel in einem Satz festlegen.",
        details: "Ein Hauptziel beschreibt Ergebnis, Zielgruppe und erkennbaren Nutzen. Technische Lösungen gehören erst in spätere Entscheidungen.",
        recommendedValue: "measurable",
        options: [
          { value: "idea", label: "Nur eine Idee", description: "Das Problem ist bekannt, das Ergebnis aber noch offen." },
          { value: "rough", label: "Grob beschrieben", description: "Zweck und wichtigste Funktion sind erkennbar." },
          { value: "measurable", label: "Messbar beschrieben", description: "Ergebnis und Erfolgskriterium sind eindeutig." }
        ]
      },
      {
        id: "project.scope", phaseId: "project", type: "single", required: true,
        title: "Wie soll der erste Funktionsumfang begrenzt werden?",
        shortHelp: "Bestimme, ob zuerst ein kleiner Kern oder sofort ein großer Gesamtumfang entstehen soll.",
        why: "Ein begrenzter erster Umfang senkt Fehlerrisiko und beschleunigt verwertbare Ergebnisse.",
        example: "Version 1 importiert Dateien, prüft sie und erzeugt einen Bericht; Bearbeitung folgt später.",
        pro: "Kleine Releases sind leichter prüfbar und rückbaubar.",
        contra: "Einige Komfortfunktionen stehen zunächst nicht zur Verfügung.",
        alternative: "Großen Zielumfang dokumentieren, aber nur einen vertikalen Kern umsetzen.",
        recommendation: "Mit einem minimalen, vollständig nutzbaren Kern beginnen.",
        details: "Ein vertikaler Kern enthält einen kompletten Nutzerablauf von Eingabe bis Ergebnis, aber nur wenige Funktionen.",
        recommendedValue: "minimal",
        options: [
          { value: "minimal", label: "Minimaler Kern", description: "Nur zwingende Funktionen für einen vollständigen Ablauf." },
          { value: "balanced", label: "Ausgewogener Start", description: "Kern plus wenige Komfortfunktionen." },
          { value: "broad", label: "Breiter Startumfang", description: "Viele Funktionen werden gleichzeitig geplant." }
        ]
      },
      {
        id: "users.experience", phaseId: "users", type: "single", required: true,
        title: "Wie technisch erfahren sind die späteren Nutzer?",
        shortHelp: "Die Antwort bestimmt Sprache, Führung, Standardwerte und Fehlerhilfen.",
        why: "Ein Tool kann fachlich korrekt und trotzdem praktisch unbedienbar sein.",
        example: "Ein Nutzer soll Dateien über Auswahldialoge wählen, ohne Pfade eintippen zu müssen.",
        pro: "Eine klare Zielgruppe macht Bedienentscheidungen nachvollziehbar.",
        contra: "Zu starke Vereinfachung kann Experten ausbremsen.",
        alternative: "Einfacher Standardmodus plus optionaler Expertenbereich.",
        recommendation: "Für gemischte Nutzer einen geführten Standardmodus vorsehen.",
        details: "Erfahrungsstufe beeinflusst Hilfetiefe, Fehlermeldungen, sichtbare Optionen, Sicherheitsabfragen und Tastaturwege.",
        recommendedValue: "mixed",
        options: [
          { value: "beginner", label: "Überwiegend Anfänger", description: "Keine technischen Kenntnisse voraussetzen." },
          { value: "mixed", label: "Gemischte Kenntnisse", description: "Einfache Führung mit optionalen Fachdetails." },
          { value: "expert", label: "Überwiegend Experten", description: "Direkter Zugriff auf technische Einstellungen." }
        ]
      },
      {
        id: "platform.offline", phaseId: "platform", type: "single", required: true,
        title: "Muss der Anwendungskern vollständig offline funktionieren?",
        shortHelp: "Lege fest, ob wesentliche Funktionen ohne Internet verfügbar sein müssen.",
        why: "Offline-Nutzung beeinflusst Abhängigkeiten, Speicherung, Updates und Datenschutz.",
        example: "Alle Fragen, Berichte und Projektstände funktionieren ohne Cloud oder CDN.",
        pro: "Hohe Datensouveränität und verlässliche Nutzung ohne Netz.",
        contra: "Online-Dienste und automatische Synchronisation sind eingeschränkt.",
        alternative: "Offline-Kern mit ausdrücklich optionalen Online-Erweiterungen.",
        recommendation: "Den Kern offline halten und Netzwerkfunktionen klar trennen.",
        details: "Jede externe Laufzeitabhängigkeit muss bei Offline-Pflicht lokal mitgeliefert oder vollständig optional sein.",
        recommendedValue: "yes",
        options: [
          { value: "yes", label: "Ja, vollständig", description: "Kernfunktionen benötigen keinerlei Internetzugriff." },
          { value: "optional", label: "Offline-Kern, Online optional", description: "Netzfunktionen verbessern nur Komfort oder Austausch." },
          { value: "no", label: "Internet ist erforderlich", description: "Wesentliche Funktionen dürfen Onlinedienste benötigen." }
        ]
      },
      {
        id: "platform.target", phaseId: "platform", type: "single", required: true,
        title: "Welche Hauptplattform soll zuerst zuverlässig unterstützt werden?",
        shortHelp: "Wähle eine klare Erstplattform, bevor weitere Systeme ergänzt werden.",
        why: "Zu viele Plattformen gleichzeitig vervielfachen Test- und Supportaufwand.",
        example: "Zuerst aktuelle Browser unter Kubuntu, danach mobile Browser.",
        pro: "Eine Erstplattform ermöglicht konkrete Abnahmetests.",
        contra: "Andere Systeme erhalten später Unterstützung.",
        alternative: "Webstandards nutzen, aber nur eine Plattform verbindlich abnehmen.",
        recommendation: "Eine Hauptplattform und konkrete Mindestversion festlegen.",
        details: "Unterstützung umfasst nicht nur Darstellung, sondern Dateizugriff, Speicherung, Tastatur, Druck und Fehlerfälle.",
        recommendedValue: "browser-linux",
        options: [
          { value: "browser-linux", label: "Browser unter Linux", description: "Desktop-Browser auf Kubuntu oder Ubuntu." },
          { value: "desktop-linux", label: "Linux-Desktop-Anwendung", description: "Eigenständige native oder Python-basierte Oberfläche." },
          { value: "mobile", label: "Mobile Browser", description: "iPhone, iPad oder Android als Erstplattform." }
        ]
      },
      {
        id: "data.storage", phaseId: "data", type: "single", required: true,
        title: "Wo sollen Projektstände dauerhaft gespeichert werden?",
        shortHelp: "Bestimme die primäre Speicherung für Antworten, Versionen und Sicherungen.",
        why: "Die Wahl beeinflusst Datenschutz, Wiederherstellung und Übertragbarkeit.",
        example: "Projektstände liegen lokal in IndexedDB und können als JSON exportiert werden.",
        pro: "Lokale Speicherung ist schnell und datensparsam.",
        contra: "Browserdaten können bei falscher Bereinigung verloren gehen.",
        alternative: "Lokale Speicherung plus regelmäßiger manueller Sicherungsexport.",
        recommendation: "IndexedDB mit Snapshots und geprüftem JSON-Export verwenden.",
        details: "Eine robuste Lösung trennt aktuellen Stand, unveränderliche Snapshots, Migrationsprotokoll und Exportdateien.",
        recommendedValue: "local",
        options: [
          { value: "local", label: "Nur lokal", description: "Daten bleiben vollständig auf dem Gerät." },
          { value: "hybrid", label: "Lokal plus optionaler Austausch", description: "Lokale Hauptdaten mit bewusstem Export oder Sync." },
          { value: "cloud", label: "Cloud als Hauptspeicher", description: "Dauerhafte Nutzung benötigt einen Onlinedienst." }
        ]
      }
    ]
  };

  const fallbackRules = {
    catalogVersion: "1.0.0",
    rules: [
      {
        id: "rule.offline-cloud-conflict",
        severity: "critical",
        when: { all: [
          { questionId: "platform.offline", equals: "yes" },
          { questionId: "data.storage", equals: "cloud" }
        ] },
        message: "Vollständige Offline-Nutzung widerspricht einer Cloud als Hauptspeicher.",
        recommendation: "Lokale Speicherung oder einen nur optionalen Austausch wählen."
      },
      {
        id: "rule.beginner-guidance",
        severity: "recommendation",
        when: { any: [
          { questionId: "users.experience", equals: "beginner" },
          { questionId: "users.experience", equals: "mixed" }
        ] },
        message: "Für diese Zielgruppe sind Auswahldialoge, sichere Standardwerte und mehrstufige Hilfen sinnvoll.",
        recommendation: "Manuelle Pfadeingaben und unkommentierte Fachbegriffe vermeiden."
      }
    ]
  };

  const fallbackTemplates = {
    catalogVersion: "1.0.0",
    templates: [{ id: "template.offline-html", title: "Offline-HTML-Werkzeug", answerDefaults: {
      "project.scope": "minimal", "users.experience": "mixed", "platform.offline": "yes",
      "platform.target": "browser-linux", "data.storage": "local"
    }}]
  };

  const fallbackPrompts = {
    catalogVersion: "1.0.0",
    prompts: [{ id: "prompt.minimal-patch", category: "Entwicklung", title: "Minimalen Patch planen", text: "Analysiere Ziel, betroffene Dateien, Risiken und kleinste passende Prüfungen. Setze nur den kleinsten fachlich vollständigen Patch um." }]
  };

  function getFallbackCatalogs() {
    return structuredClone({
      questions: fallbackQuestions,
      rules: fallbackRules,
      templates: fallbackTemplates,
      prompts: fallbackPrompts
    });
  }

  function getQuestionById(catalog, questionId) {
    return catalog?.questions.find(question => question.id === questionId) || null;
  }

  function getCurrentIndex(catalog, questionId) {
    return Math.max(0, catalog.questions.findIndex(question => question.id === questionId));
  }

  function getNextQuestionId(catalog, questionId, direction = 1) {
    const index = getCurrentIndex(catalog, questionId);
    const nextIndex = Math.min(Math.max(index + direction, 0), catalog.questions.length - 1);
    return catalog.questions[nextIndex]?.id || null;
  }

  function getPhaseQuestions(catalog, phaseId) {
    return catalog.questions.filter(question => question.phaseId === phaseId);
  }

  namespace.workflow = { getFallbackCatalogs, getQuestionById, getCurrentIndex, getNextQuestionId, getPhaseQuestions };
})();
