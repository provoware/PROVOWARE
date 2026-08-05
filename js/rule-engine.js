(() => {
  "use strict";
  const namespace = window.Provoware = window.Provoware || {};

  function conditionMatches(condition, answers) {
    return answers[condition.questionId] === condition.equals;
  }

  function groupMatches(group, answers) {
    if (Array.isArray(group.all)) return group.all.every(condition => conditionMatches(condition, answers));
    if (Array.isArray(group.any)) return group.any.some(condition => conditionMatches(condition, answers));
    return false;
  }

  function evaluate(rules, answers) {
    return rules.filter(rule => groupMatches(rule.when, answers));
  }

  namespace.rules = { evaluate };
})();
