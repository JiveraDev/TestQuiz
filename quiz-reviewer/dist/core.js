(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Recall = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }
  function grade(question, response) {
    if (question.options) {
      return { correct: Number.isInteger(response) && response === question.answer, matched: response === question.answer ? 1 : 0, total: 1 };
    }
    if (question.type === 'identification') {
      const correct = !!normalize(response) && question.aliases.some(alias => normalize(alias) === normalize(response));
      return { correct, matched: correct ? 1 : 0, total: 1 };
    }
    if (question.type === 'matching') {
      const values = Array.isArray(response) ? response : [];
      const details = question.pairs.map((pair, index) => values[index] === pair.right);
      return { correct: details.every(Boolean), matched: details.filter(Boolean).length, total: details.length, details };
    }
    const values = Array.isArray(response) ? response : [];
    const owner = Array(question.items.length).fill(-1);
    function assign(input, visited) {
      if (!normalize(values[input])) return false;
      for (let target = 0; target < question.items.length; target++) {
        if (visited.has(target) || !question.items[target].aliases.some(alias => normalize(alias) === normalize(values[input]))) continue;
        visited.add(target);
        if (owner[target] === -1 || assign(owner[target], visited)) {
          owner[target] = input;
          return true;
        }
      }
      return false;
    }
    for (let index = 0; index < values.length; index++) assign(index, new Set());
    const details = owner.map(input => input !== -1);
    return { correct: details.every(Boolean), matched: details.filter(Boolean).length, total: details.length, details };
  }
  function secondsFor(question, pace = 'standard') {
    const base = question.type === 'enumeration' ? Math.max(120, question.items.length * 25)
      : question.type === 'matching' ? Math.max(90, question.pairs.length * 20)
      : { identification: 60, multiple: 45, boolean: 30, situational: 90 }[question.type];
    return Math.round(base * ({ standard: 1, relaxed: 1.5, challenge: 0.6 }[pace] || 1));
  }
  function summarize(results, total = results.length) {
    const correct = results.filter(result => result.correct).length;
    return { correct, total, answered: results.length, percent: total ? Math.round(correct / total * 100) : 0 };
  }
  function validateBank(bank) {
    const errors = [];
    if (bank.questions.length !== 100) errors.push('The bank must contain exactly 100 questions.');
    const ids = new Set();
    for (const q of bank.questions) {
      if (ids.has(q.id)) errors.push(`Duplicate ID: ${q.id}`);
      ids.add(q.id);
      if (!bank.types[q.type] || !bank.topics.some(t => t.id === q.topic)) errors.push(`Invalid classification: ${q.id}`);
      if (!q.prompt || !q.explanation || !bank.sources[q.source?.doc] || !q.source.page) errors.push(`Missing content: ${q.id}`);
      if (q.options && (q.options.length < 2 || new Set(q.options).size !== q.options.length || !Number.isInteger(q.answer) || !q.options[q.answer])) errors.push(`Invalid choices: ${q.id}`);
      if (q.type === 'identification' && (!q.aliases?.length || !q.answer)) errors.push(`Missing aliases: ${q.id}`);
      if (q.type === 'enumeration' && (!q.items?.length || q.items.some(item => !item.label || !item.aliases.length))) errors.push(`Missing items: ${q.id}`);
      if (q.type === 'matching' && (!q.pairs?.length || new Set(q.pairs.map(pair => pair.right)).size !== q.pairs.length)) errors.push(`Invalid matching set: ${q.id}`);
    }
    return errors;
  }
  return { normalize, shuffle, grade, secondsFor, summarize, validateBank };
});
