(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};
  const REPORT_MODEL_VERSION = "1.0.0";

  function clone(value) { return structuredClone(value); }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(value) {
    if (!value) return "nicht angegeben";
    try {
      return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    } catch (_error) {
      return String(value);
    }
  }

  function optionFor(question, answer) {
    return question.options.find(option => option.value === answer) || null;
  }

  function phaseTitle(catalog, phaseId) {
    return catalog.phases.find(phase => phase.id === phaseId)?.title || phaseId;
  }

  function statusFrom(progress, risks) {
    if (risks.some(risk => risk.severity === "critical" && risk.status === "open")) return "blocked";
    return progress === 100 ? "complete" : "incomplete";
  }

  function statementFor(question, option) {
    const label = option?.label || "nicht festgelegt";
    return `Das Projekt muss die Entscheidung „${label}“ für den Punkt „${question.title}“ nachvollziehbar umsetzen.`;
  }

  function architecturePrinciples(decisions) {
    const principles = [
      "Fachlogik, Darstellung, Validierung, Speicherung und Berichte bleiben getrennte Module.",
      "Alle riskanten Änderungen folgen Vorprüfung, Vorschau, Ausführung und Nachprüfung.",
      "Datenmodelle, Exporte und Migrationen erhalten eindeutige Versionsnummern."
    ];
    const byQuestion = new Map(decisions.map(decision => [decision.questionId, decision.selectedValue]));
    if (byQuestion.get("platform.offline") === "yes") principles.push("Der Anwendungskern darf keine verpflichtende Netz-, Cloud- oder CDN-Abhängigkeit besitzen.");
    if (byQuestion.get("users.experience") !== "expert") principles.push("Die Standardbedienung verwendet verständliche Sprache, sichere Vorgaben und sichtbare Hilfen.");
    if (byQuestion.get("project.scope") === "minimal") principles.push("Die Umsetzung beginnt mit einem kleinen, vollständig nutzbaren vertikalen Kern.");
    return principles;
  }

  function architectureComponents(decisions) {
    const byQuestion = new Map(decisions.map(decision => [decision.questionId, decision.selectedValue]));
    const components = [
      { id: "COMP-01", name: "Benutzeroberfläche", responsibility: "Fragen, Hilfen, Status und Berichte verständlich darstellen." },
      { id: "COMP-02", name: "Workflow-Engine", responsibility: "Phasen, Fragenreihenfolge und Fortschritt steuern." },
      { id: "COMP-03", name: "Regel- und Validierungsschicht", responsibility: "Antworten, Konflikte und Datenverträge prüfen." },
      { id: "COMP-04", name: "Speicherschicht", responsibility: "Projektstände, Snapshots, Migrationen und Wiederherstellung transaktional verwalten." },
      { id: "COMP-05", name: "Berichtsschicht", responsibility: "Ein gemeinsames Berichtsmodell in mehrere Ausgabeformate überführen." }
    ];
    if (byQuestion.get("data.storage") === "cloud") {
      components.push({ id: "COMP-06", name: "Onlinedienst-Anbindung", responsibility: "Authentifizierung, Übertragung und Ausfallbehandlung kapseln." });
    }
    return components;
  }

  function buildRequirements(catalog, decisions) {
    return decisions.map((decision, index) => {
      const question = catalog.questions.find(item => item.id === decision.questionId);
      return {
        id: `REQ-${String(index + 1).padStart(3, "0")}`,
        priority: question?.required ? "MUSS" : "SOLL",
        title: question?.title || decision.title,
        statement: statementFor(question || decision, { label: decision.selectedLabel }),
        rationale: question?.why || "Die Entscheidung wurde im Projektworkflow bestätigt.",
        sourceQuestionId: decision.questionId,
        phaseId: decision.phaseId,
        selectedValue: decision.selectedValue,
        selectedLabel: decision.selectedLabel,
        example: question?.example || ""
      };
    });
  }

  function buildRisks(catalog, answers, activeRules) {
    const risks = [];
    for (const rule of activeRules) {
      risks.push({
        id: `RISK-${String(risks.length + 1).padStart(3, "0")}`,
        severity: rule.severity === "critical" ? "critical" : "medium",
        status: "open",
        sourceRuleId: rule.id,
        sourceQuestionId: null,
        description: rule.message,
        mitigation: rule.recommendation
      });
    }
    for (const question of catalog.questions.filter(item => item.required && answers[item.id] === undefined)) {
      risks.push({
        id: `RISK-${String(risks.length + 1).padStart(3, "0")}`,
        severity: "medium",
        status: "open",
        sourceRuleId: null,
        sourceQuestionId: question.id,
        description: `Die Pflichtentscheidung „${question.title}“ ist noch offen.`,
        mitigation: question.recommendation || "Entscheidung vor Entwicklungsbeginn festlegen."
      });
    }
    return risks;
  }

  function buildTests(requirements) {
    const tests = [];
    for (const requirement of requirements) {
      tests.push({
        id: `TEST-${String(tests.length + 1).padStart(3, "0")}`,
        requirementId: requirement.id,
        type: "normal",
        title: `${requirement.title} – Normalfall`,
        preconditions: ["Anwendung ist gestartet.", "Ein gültiger Projektstand ist geladen."],
        steps: ["Die zugehörige Funktion oder Einstellung öffnen.", `Die Auswahl „${requirement.selectedLabel}“ anwenden.`, "Ergebnis und Status prüfen."],
        expectedResult: `Die Anforderung ${requirement.id} ist sichtbar erfüllt und wird ohne Fehlermeldung gespeichert.`
      });
      tests.push({
        id: `TEST-${String(tests.length + 1).padStart(3, "0")}`,
        requirementId: requirement.id,
        type: "error",
        title: `${requirement.title} – Fehlerfall`,
        preconditions: ["Ein kontrolliert ungültiger oder unvollständiger Eingabestand liegt vor."],
        steps: ["Die fehlerhafte Eingabe ausführen.", "Validierungs- und Hilfetext prüfen.", "Korrektur oder sicheren Abbruch ausführen."],
        expectedResult: "Die Anwendung verhindert einen unvollständigen Zustand, erklärt die Ursache und nennt eine nächste Aktion."
      });
    }
    return tests;
  }

  function buildAcceptance(requirements) {
    return requirements.map((requirement, index) => ({
      id: `AC-${String(index + 1).padStart(3, "0")}`,
      requirementId: requirement.id,
      criterion: `${requirement.statement} Der Zustand muss gespeichert, nach einem Neustart wiederherstellbar und durch die zugeordneten Tests nachgewiesen sein.`
    }));
  }

  function buildMilestones(catalog, answers) {
    return catalog.phases.map((phase, index) => {
      const questions = catalog.questions.filter(question => question.phaseId === phase.id);
      const answered = questions.filter(question => answers[question.id] !== undefined).length;
      return {
        id: `MS-${String(index + 1).padStart(2, "0")}`,
        title: phase.title,
        goal: `Alle Entscheidungen der Phase „${phase.title}“ belastbar festlegen und dokumentieren.`,
        deliverables: questions.map(question => question.title),
        exitCriteria: [`${answered} von ${questions.length} Entscheidungen bestätigt.`, "Zugehörige Risiken und Tests sind dokumentiert."],
        status: questions.length > 0 && answered === questions.length ? "complete" : answered > 0 ? "in-progress" : "open"
      };
    });
  }

  function createReportModel(state, activeRules = [], options = {}) {
    const catalog = state?.catalog;
    if (!catalog?.questions || !catalog?.phases) throw new Error("Für den Bericht fehlt ein gültiger Fragenkatalog.");
    const answers = clone(state.answers || {});
    const generatedAt = options.generatedAt || new Date().toISOString();
    const decisions = catalog.questions
      .filter(question => answers[question.id] !== undefined)
      .map((question, index) => {
        const option = optionFor(question, answers[question.id]);
        return {
          id: `DEC-${String(index + 1).padStart(3, "0")}`,
          questionId: question.id,
          phaseId: question.phaseId,
          phaseTitle: phaseTitle(catalog, question.phaseId),
          title: question.title,
          selectedValue: answers[question.id],
          selectedLabel: option?.label || String(answers[question.id]),
          description: option?.description || "",
          recommendation: question.recommendation || ""
        };
      });
    const requirements = buildRequirements(catalog, decisions);
    const risks = buildRisks(catalog, answers, activeRules);
    const testCases = buildTests(requirements);
    const acceptanceCriteria = buildAcceptance(requirements);
    const openDecisions = catalog.questions
      .filter(question => answers[question.id] === undefined)
      .map((question, index) => ({
        id: `OPEN-${String(index + 1).padStart(3, "0")}`,
        questionId: question.id,
        phaseId: question.phaseId,
        title: question.title,
        reason: question.why,
        recommendation: question.recommendation
      }));
    const progress = catalog.questions.length ? Math.round((decisions.length / catalog.questions.length) * 100) : 0;
    const traceability = requirements.map(requirement => ({
      sourceQuestionId: requirement.sourceQuestionId,
      requirementId: requirement.id,
      testCaseIds: testCases.filter(test => test.requirementId === requirement.id).map(test => test.id),
      acceptanceCriterionIds: acceptanceCriteria.filter(item => item.requirementId === requirement.id).map(item => item.id)
    }));

    return {
      modelVersion: REPORT_MODEL_VERSION,
      generatedAt,
      project: {
        id: state.projectId || "unknown-project",
        name: state.projectName || "PROVOWARE Entwicklungsplan",
        schemaVersion: state.schemaVersion || "unbekannt",
        questionCatalogVersion: state.questionCatalogVersion || catalog.catalogVersion || "unbekannt",
        revision: Number(state.revision || 0),
        progress,
        status: statusFrom(progress, risks)
      },
      summary: {
        totalQuestions: catalog.questions.length,
        answeredQuestions: decisions.length,
        openQuestions: openDecisions.length,
        requirements: requirements.length,
        risks: risks.length,
        criticalRisks: risks.filter(risk => risk.severity === "critical").length,
        tests: testCases.length,
        acceptanceCriteria: acceptanceCriteria.length
      },
      decisions,
      requirements,
      architecture: {
        principles: architecturePrinciples(decisions),
        components: architectureComponents(decisions),
        decisions: decisions.map((decision, index) => ({
          id: `ADR-${String(index + 1).padStart(3, "0")}`,
          sourceQuestionId: decision.questionId,
          title: decision.title,
          decision: decision.selectedLabel,
          consequence: decision.description || decision.recommendation
        })),
        dataFlow: [
          "Nutzer beantwortet eine versionierte Frage.",
          "Validierung und Regeln prüfen die Entscheidung.",
          "Der Zustand wird transaktional mit Snapshot gespeichert.",
          "Das Berichtsmodell leitet Anforderungen, Risiken, Tests und Abnahme daraus ab.",
          "Ein Renderer erzeugt das gewählte Exportformat ohne Inhaltsabweichung."
        ]
      },
      risks,
      testCases,
      acceptanceCriteria,
      milestones: buildMilestones(catalog, answers),
      openDecisions,
      traceability
    };
  }

  function validateReportModel(model) {
    const errors = [];
    if (!model || typeof model !== "object") return ["Das Berichtsmodell ist kein Objekt."];
    if (model.modelVersion !== REPORT_MODEL_VERSION) errors.push("Die Berichtsmodell-Version wird nicht unterstützt.");
    for (const key of ["project", "summary", "architecture"]) {
      if (!model[key] || typeof model[key] !== "object") errors.push(`Berichtsbereich fehlt: ${key}`);
    }
    for (const key of ["decisions", "requirements", "risks", "testCases", "acceptanceCriteria", "milestones", "openDecisions", "traceability"]) {
      if (!Array.isArray(model[key])) errors.push(`Berichtsliste fehlt: ${key}`);
    }
    const requirementIds = new Set((model.requirements || []).map(item => item.id));
    for (const test of model.testCases || []) {
      if (!requirementIds.has(test.requirementId)) errors.push(`Test ${test.id} verweist auf eine unbekannte Anforderung.`);
    }
    for (const item of model.acceptanceCriteria || []) {
      if (!requirementIds.has(item.requirementId)) errors.push(`Abnahmekriterium ${item.id} verweist auf eine unbekannte Anforderung.`);
    }
    return errors;
  }

  function markdownList(values, emptyText = "Keine Einträge.") {
    return values.length ? values.map(value => `- ${value}`).join("\n") : emptyText;
  }

  function renderMarkdown(model) {
    const errors = validateReportModel(model);
    if (errors.length) throw new Error(`Berichtsmodell ungültig: ${errors.join(" ")}`);
    const lines = [
      `# ${model.project.name}`, "", `Erzeugt: ${formatDate(model.generatedAt)}  `,
      `Projekt-ID: \`${model.project.id}\`  `, `Projektschema: \`${model.project.schemaVersion}\`  `,
      `Fragenkatalog: \`${model.project.questionCatalogVersion}\`  `, `Revision: ${model.project.revision}  `,
      `Fortschritt: ${model.project.progress} %  `, `Status: **${model.project.status}**`, "",
      "## Projektbeschreibung", "",
      `Der Entwicklungsplan basiert auf ${model.summary.answeredQuestions} bestätigten von ${model.summary.totalQuestions} verfügbaren Entscheidungen. ${model.summary.openQuestions} Entscheidungen sind noch offen.`, "",
      "## Anforderungen", ""
    ];
    if (!model.requirements.length) lines.push("Noch keine Anforderungen ableitbar.");
    for (const requirement of model.requirements) {
      lines.push(`### ${requirement.id} – ${requirement.title}`, "", `**Priorität:** ${requirement.priority}`, "", requirement.statement, "", `**Begründung:** ${requirement.rationale}`, "", `**Quelle:** \`${requirement.sourceQuestionId}\``, "");
    }
    lines.push("## Architektur", "", "### Prinzipien", "", markdownList(model.architecture.principles), "", "### Komponenten", "");
    for (const component of model.architecture.components) lines.push(`- **${component.id} – ${component.name}:** ${component.responsibility}`);
    lines.push("", "### Datenfluss", "");
    model.architecture.dataFlow.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    lines.push("", "## Risiken", "");
    if (!model.risks.length) lines.push("Keine aktiven Risiken aus dem aktuellen Stand abgeleitet.");
    for (const risk of model.risks) lines.push(`- **${risk.id} · ${risk.severity}:** ${risk.description}\n  - Gegenmaßnahme: ${risk.mitigation}`);
    lines.push("", "## Testfälle", "");
    for (const test of model.testCases) {
      lines.push(`### ${test.id} – ${test.title}`, "", `**Anforderung:** ${test.requirementId}  `, `**Typ:** ${test.type}`, "", "**Schritte:**", ...test.steps.map((step, index) => `${index + 1}. ${step}`), "", `**Erwartetes Ergebnis:** ${test.expectedResult}`, "");
    }
    lines.push("## Abnahmekriterien", "");
    for (const item of model.acceptanceCriteria) lines.push(`- **${item.id} / ${item.requirementId}:** ${item.criterion}`);
    lines.push("", "## Meilensteine", "");
    for (const milestone of model.milestones) lines.push(`- **${milestone.id} – ${milestone.title} (${milestone.status}):** ${milestone.goal}`);
    lines.push("", "## Offene Entscheidungen", "");
    if (!model.openDecisions.length) lines.push("Keine offenen Entscheidungen.");
    for (const item of model.openDecisions) lines.push(`- **${item.id} – ${item.title}:** ${item.reason}\n  - Empfehlung: ${item.recommendation}`);
    lines.push("", "## Rückverfolgbarkeit", "");
    for (const item of model.traceability) lines.push(`- \`${item.sourceQuestionId}\` → ${item.requirementId} → ${item.testCaseIds.join(", ")} → ${item.acceptanceCriterionIds.join(", ")}`);
    return lines.join("\n");
  }

  function renderText(model) {
    const errors = validateReportModel(model);
    if (errors.length) throw new Error(`Berichtsmodell ungültig: ${errors.join(" ")}`);
    const lines = [model.project.name.toUpperCase(), "=".repeat(model.project.name.length),
      `Erzeugt: ${formatDate(model.generatedAt)}`, `Projekt: ${model.project.id} | Schema ${model.project.schemaVersion} | Revision ${model.project.revision}`,
      `Fortschritt: ${model.project.progress} % | Status: ${model.project.status}`, "", "PROJEKTBESCHREIBUNG",
      `Bestätigte Entscheidungen: ${model.summary.answeredQuestions}/${model.summary.totalQuestions}. Offen: ${model.summary.openQuestions}.`, "", "ANFORDERUNGEN"];
    for (const item of model.requirements) lines.push(`${item.id} [${item.priority}] ${item.title}\n${item.statement}\nQuelle: ${item.sourceQuestionId}\n`);
    lines.push("ARCHITEKTUR");
    for (const item of model.architecture.principles) lines.push(`- ${item}`);
    lines.push("", "RISIKEN");
    for (const item of model.risks) lines.push(`${item.id} [${item.severity}] ${item.description}\nGegenmaßnahme: ${item.mitigation}\n`);
    lines.push("TESTFÄLLE");
    for (const item of model.testCases) lines.push(`${item.id} (${item.requirementId}) ${item.title}\n${item.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\nErwartet: ${item.expectedResult}\n`);
    lines.push("ABNAHMEKRITERIEN");
    for (const item of model.acceptanceCriteria) lines.push(`${item.id} (${item.requirementId}): ${item.criterion}`);
    lines.push("", "MEILENSTEINE");
    for (const item of model.milestones) lines.push(`${item.id} [${item.status}] ${item.title}: ${item.goal}`);
    lines.push("", "OFFENE ENTSCHEIDUNGEN");
    if (!model.openDecisions.length) lines.push("Keine offenen Entscheidungen.");
    for (const item of model.openDecisions) lines.push(`${item.id}: ${item.title}\n${item.reason}\nEmpfehlung: ${item.recommendation}\n`);
    lines.push("RÜCKVERFOLGBARKEIT");
    for (const item of model.traceability) lines.push(`${item.sourceQuestionId} -> ${item.requirementId} -> ${item.testCaseIds.join(", ")} -> ${item.acceptanceCriterionIds.join(", ")}`);
    return lines.join("\n");
  }

  function htmlList(items, renderer) {
    return items.length ? `<ul>${items.map(renderer).join("")}</ul>` : "<p>Keine Einträge.</p>";
  }

  function renderHtml(model) {
    const errors = validateReportModel(model);
    if (errors.length) throw new Error(`Berichtsmodell ungültig: ${errors.join(" ")}`);
    const requirements = model.requirements.map(item => `<article><h3>${escapeHtml(item.id)} – ${escapeHtml(item.title)}</h3><p><strong>Priorität:</strong> ${escapeHtml(item.priority)}</p><p>${escapeHtml(item.statement)}</p><p><strong>Begründung:</strong> ${escapeHtml(item.rationale)}</p><p><strong>Quelle:</strong> <code>${escapeHtml(item.sourceQuestionId)}</code></p></article>`).join("");
    const tests = model.testCases.map(item => `<article><h3>${escapeHtml(item.id)} – ${escapeHtml(item.title)}</h3><p><strong>Anforderung:</strong> ${escapeHtml(item.requirementId)} · <strong>Typ:</strong> ${escapeHtml(item.type)}</p><ol>${item.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol><p><strong>Erwartet:</strong> ${escapeHtml(item.expectedResult)}</p></article>`).join("");
    return `<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(model.project.name)} – Entwicklungsbericht</title><style>\n:root{color-scheme:light dark;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.55}body{max-width:72rem;margin:auto;padding:2rem;background:#f3f6f8;color:#17202a}header,section,article{background:#fff;border:1px solid #b9c5d0;border-radius:.8rem;padding:1rem;margin:0 0 1rem}h1,h2,h3{line-height:1.2}code{background:#e7eef5;padding:.1rem .3rem;border-radius:.25rem}.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:.5rem}.badge{display:inline-block;padding:.2rem .5rem;border:1px solid currentColor;border-radius:999px}@media(prefers-color-scheme:dark){body{background:#0d1117;color:#f3f6f8}header,section,article{background:#151b23;border-color:#344150}code{background:#1c2530}}@media print{body{background:#fff;color:#000;max-width:none}header,section,article{break-inside:avoid;border-color:#777}}\n</style></head><body><header><h1>${escapeHtml(model.project.name)}</h1><div class="meta"><span>Projekt: <code>${escapeHtml(model.project.id)}</code></span><span>Schema: ${escapeHtml(model.project.schemaVersion)}</span><span>Revision: ${model.project.revision}</span><span>Fortschritt: ${model.project.progress} %</span><span class="badge">${escapeHtml(model.project.status)}</span></div><p>Erzeugt: ${escapeHtml(formatDate(model.generatedAt))}</p></header>\n<main><section><h2>Projektbeschreibung</h2><p>Der Plan basiert auf ${model.summary.answeredQuestions} von ${model.summary.totalQuestions} Entscheidungen. ${model.summary.openQuestions} Entscheidungen sind noch offen.</p></section>\n<section><h2>Anforderungen</h2>${requirements || "<p>Noch keine Anforderungen ableitbar.</p>"}</section>\n<section><h2>Architektur</h2><h3>Prinzipien</h3>${htmlList(model.architecture.principles, item => `<li>${escapeHtml(item)}</li>`)}<h3>Komponenten</h3>${htmlList(model.architecture.components, item => `<li><strong>${escapeHtml(item.id)} – ${escapeHtml(item.name)}:</strong> ${escapeHtml(item.responsibility)}</li>`)}<h3>Datenfluss</h3><ol>${model.architecture.dataFlow.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>\n<section><h2>Risiken</h2>${htmlList(model.risks, item => `<li><strong>${escapeHtml(item.id)} · ${escapeHtml(item.severity)}:</strong> ${escapeHtml(item.description)}<br><strong>Gegenmaßnahme:</strong> ${escapeHtml(item.mitigation)}</li>`)}</section>\n<section><h2>Testfälle</h2>${tests || "<p>Noch keine Testfälle ableitbar.</p>"}</section>\n<section><h2>Abnahmekriterien</h2>${htmlList(model.acceptanceCriteria, item => `<li><strong>${escapeHtml(item.id)} / ${escapeHtml(item.requirementId)}:</strong> ${escapeHtml(item.criterion)}</li>`)}</section>\n<section><h2>Meilensteine</h2>${htmlList(model.milestones, item => `<li><strong>${escapeHtml(item.id)} – ${escapeHtml(item.title)} (${escapeHtml(item.status)}):</strong> ${escapeHtml(item.goal)}</li>`)}</section>\n<section><h2>Offene Entscheidungen</h2>${htmlList(model.openDecisions, item => `<li><strong>${escapeHtml(item.id)} – ${escapeHtml(item.title)}:</strong> ${escapeHtml(item.reason)}<br><strong>Empfehlung:</strong> ${escapeHtml(item.recommendation)}</li>`)}</section>\n<section><h2>Rückverfolgbarkeit</h2>${htmlList(model.traceability, item => `<li><code>${escapeHtml(item.sourceQuestionId)}</code> → ${escapeHtml(item.requirementId)} → ${escapeHtml(item.testCaseIds.join(", "))} → ${escapeHtml(item.acceptanceCriterionIds.join(", "))}</li>`)}</section></main></body></html>`;
  }

  function renderJson(model) {
    const errors = validateReportModel(model);
    if (errors.length) throw new Error(`Berichtsmodell ungültig: ${errors.join(" ")}`);
    return `${JSON.stringify(model, null, 2)}\n`;
  }

  function createMarkdown(catalog, answers, activeRules) {
    return renderMarkdown(createReportModel({ catalog, answers, projectId: "preview", projectName: "Entwicklungsplan – Vorschau", schemaVersion: "1.2.0", revision: 0 }, activeRules));
  }

  namespace.report = {
    REPORT_MODEL_VERSION, createReportModel, validateReportModel, renderMarkdown,
    renderText, renderHtml, renderJson, createMarkdown, escapeHtml
  };
})();
