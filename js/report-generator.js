(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  function createMarkdown(catalog, answers, activeRules) {
    const lines = ["# Entwicklungsplan – Vorschau", "", "## Entscheidungen", ""];
    const answeredQuestions = catalog.questions.filter(question => answers[question.id] !== undefined);
    if (!answeredQuestions.length) lines.push("Noch keine Entscheidung getroffen.");

    for (const question of answeredQuestions) {
      const option = question.options.find(item => item.value === answers[question.id]);
      lines.push(`- **${question.title}**: ${option?.label || answers[question.id]}`);
    }

    lines.push("", "## Hinweise", "");
    if (!activeRules.length) lines.push("Keine aktiven Konflikte oder Zusatzempfehlungen.");
    for (const rule of activeRules) {
      lines.push(`- **${rule.severity === "critical" ? "Konflikt" : "Empfehlung"}:** ${rule.message}`);
      lines.push(`  - Nächste Maßnahme: ${rule.recommendation}`);
    }

    return lines.join("\n");
  }

  namespace.report = { createMarkdown };
})();
