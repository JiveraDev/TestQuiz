const fs = require('node:fs');
const file = 'quiz-reviewer/dist/app.js';
let app = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
function replace(before, after) {
  if (!app.includes(before)) throw new Error(`Missing UI target: ${before.slice(0, 100)}`);
  app = app.replace(before, after);
}
replace("  function source(q) { return `${bank.sources[q.source.doc].short} · p. ${q.source.page}`; }\n", '');
replace('Your two modules, one focused reviewer.', 'Your IT 401 concepts, one focused reviewer.');
replace('Every major topic from both supplied modules is represented.', 'Review network protection, signatures, risk, security testing, and cyber offences.');
replace('All 13 introductory crime examples; Section 65 and its six acts; every section in the handout’s table (65–74, including lettered entries); stated punishments/classifications; outside-India application, confiscation, investigation; and compounding rules.', 'Thirteen forms of cybercrime; Section 65 and its six acts; offences and duties under Sections 65–74; punishment classifications; outside-India application, confiscation, investigation; and Section 77-A compounding rules.');
replace("heading('BUILT FROM YOUR TWO MODULES'", "heading('IT 401 · TOPICS & SOURCES'");
replace('Section 66-A is labelled as a historical handout entry.', 'Section 66-A is obsolete and is excluded from graded questions.');
replace('    active = { id: crypto.randomUUID(), player,', '    active = { bankVersion: bank.version, id: crypto.randomUUID(), player,');
replace('${escape(q.prompt)}</h2>${responseFields(q,layout,feedback)}', '${escape(q.prompt)}</h2>${q.context ? `<p class="question-context">${escape(q.context)}</p>` : \'\'}${responseFields(q,layout,feedback)}');
replace('Use the course term or a standard abbreviation.', 'Name the term described. Standard abbreviations are accepted.');
replace('`${q.items.length} items · any order · no duplicates · the complete list earns 1 point.`', '`Enter one ${escape(q.responseLabel)} per box, in any order. Do not repeat answers. All ${q.items.length} answers are required for this question’s 1 point.`');
replace('`${q.pairs.length} pairs · choose a match for every row · the complete set earns 1 point.`', '`Match each of the ${q.pairs.length} entries to its correct description. All pairs must be correct for this question’s 1 point.`');
replace('${escape(source(q))} · 1 point', 'IT 401 · 1 point');
replace('placeholder="Item ${index + 1}" aria-label="Enumeration item ${index + 1}"', 'placeholder="Type one ${escape(q.responseLabel)}" aria-label="${escape(q.responseLabel)} ${index + 1} of ${q.items.length}"');
replace('    const session = { id: active.id,', '    const session = { bankVersion: active.bankVersion, id: active.id,');
replace('    const s = reviewSession;\n    const missed', '    const s = reviewSession;\n    const currentQuestions = s.bankVersion === bank.version;\n    const missed');
replace('${missed.length ? `<button class="button secondary" data-action="retry-missed">', '${currentQuestions && missed.length ? `<button class="button secondary" data-action="retry-missed">');
replace('      <section class="answers-review">', '      ${!currentQuestions ? \'<section class="source-panel"><h2>This attempt used an earlier questionnaire</h2><p>Questions were revised after this attempt. Your recorded score is unchanged. Play again to use the updated questions.</p></section>\' : `<section class="answers-review">');
replace('${escape(bank.types[q.type])} · ${escape(source(q))}', '${escape(bank.types[q.type])}');
replace("</div>'}</section>`;", "</div>'}</section>`}`;");
replace('    const saved=read(activeKey(),null);\n    const valid=', `    const saved=read(activeKey(),null);
    if (saved && saved.bankVersion !== bank.version) {
      active=null;
      storageWarning('The questions have been revised. Start a new session to use the corrected questions. Your completed scores are still saved.');
      return;
    }
    const valid=`);
fs.writeFileSync(file, app, 'utf8');
console.log('Updated question context, enumeration instructions, neutral question footers, and versioned sessions.');
