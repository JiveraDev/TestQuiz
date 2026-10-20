from pathlib import Path

filename = Path('quiz-reviewer/dist/app.js')
text = filename.read_text(encoding='utf-8')
start = text.index('  function renderCoverage() {')
end = text.index('  function renderHistory() {', start)
text = text[:start] + r'''  function renderCoverage() {
    app.innerHTML = `${heading('IT 401 · MODULE & SOURCES','Know your <em>coverage.</em>', `${bank.questions.length} questions. All 23 table rows. The complete offences module.`)}
      <div class="format-strip">${Object.entries(bank.types).map(([type,label]) => `<span><strong>${bank.questions.filter(q => q.type === type).length}</strong>${escape(label)}</span>`).join('')}</div>
      <section class="source-panel"><h2>Follow the supplied course wording</h2><p>Questions cover the introductory discussion, all 13 cybercrime forms, every offence-table row and column, the detailed Section 65 explanation, listed legal powers, and all Section 77-A rules.</p><div class="source-note"><strong>Historical wording and source conflicts</strong><p>Section 66-A is retained for complete course coverage and labelled obsolete. The Section 65 prose says non-bailable; its table says bailable. Questions explicitly distinguish those passages. Later amendments affect several other provisions, so the course punishments are historical.</p><p>Some fine cells end without a complete amount. Those cells are preserved as printed; missing amounts are not invented. Generic “Court” entries remain generic. The typo “Denial of attacks” is retained, with denial-of-service accepted as the standard term.</p></div></section>
      <section class="module-section"><div class="section-heading"><div><h2>Every offence-table row</h2><p>Each row is practiced in all five formats. Expand a row to study its facts.</p></div></div><div class="offence-rows">${bank.tableRows.map(row => {
        const related = bank.questions.filter(q => q.coverage.includes(`section-${row.section}`));
        return `<details class="offence-row"><summary><strong>Section ${escape(row.section)}</strong><span>${escape(row.offence)}</span></summary><div class="offence-row-content"><dl><div><dt>Punishment</dt><dd>${escape(row.punishment)}</dd></div><div><dt>Bailability</dt><dd>${escape(row.bail)}</dd></div><div><dt>Cognizability</dt><dd>${escape(row.cognizability)}</dd></div>${row.court ? `<div><dt>Court as printed</dt><dd>${escape(row.court)}</dd></div>` : ''}</dl>${row.note ? `<p class="course-note">${escape(row.note)}</p>` : ''}<div class="coverage-formats">${Object.entries(bank.types).map(([type,label]) => `<span>${escape(label)} · ${related.filter(q => q.type === type).length}</span>`).join('')}</div></div></details>`;
      }).join('')}</div></section>
      <section class="module-section"><div class="section-heading"><div><h2>Read the complete module text</h2><p>All six PDF pages are preserved below, including references and the closing page. Original wording and spelling are retained.</p></div></div>${bank.modulePages.map(page => `<details class="module-page"><summary>Module page ${page.page}</summary><pre>${escape(page.text)}</pre></details>`).join('')}</section>
      <section class="module-section"><div class="section-heading"><div><h2>Real-world examples</h2><p>Documented events are linked to primary sources. Classroom analogies do not imply a conviction under India’s IT Act.</p></div></div><div class="research-grid">${bank.research.map(item => `<article class="research-card"><span class="eyebrow">${escape(item.publisher)} · ${escape(item.date)}</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><p><strong>Study connection:</strong> ${escape(item.explanation)}</p><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Read the primary source ↗</a></article>`).join('')}</div></section>
      <section class="source-panel"><h2>Course source</h2><p>${escape(bank.sources.offences.title)} · 6 PDF pages</p><h2>Legal and historical references</h2>${bank.legalSources.map(source => `<p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a> · ${escape(source.publisher)}<span>${escape(source.note)}</span></p>`).join('')}</section>
      <button class="button primary" data-action="practice">Start practicing${icon('arrow')}</button>`;
  }
''' + text[end:]
replacements = {
    "const topicTitle = bank.topics.find(t => t.id === settings.topic)?.title || 'Full midterm mix';": "const topicTitle = bank.areas[settings.area] || 'Complete cybercrime offences';",
    "q.type === 'identification' ? '<p class=\"answer-hint\">Standard terms and abbreviations accepted. Case and punctuation do not matter.</p>'": "['identification','fill'].includes(q.type) ? '<p class=\"answer-hint\">Enter the missing term, number, or section. Standard abbreviations accepted; case and punctuation do not matter.</p>'",
    "if (q.type === 'identification') return `<label": "if (q.type === 'identification' || q.type === 'fill') return `<label",
    "if (q.type === 'identification') return `<p>": "if (q.type === 'identification' || q.type === 'fill') return `<p>",
    'Type the term here…': 'Type the term, number, or section…',
    "const rows=s.results.filter(r => byId.get(r.id).type === type);": "const rows=currentQuestions ? s.results.filter(r => byId.get(r.id)?.type === type) : [];",
    'Each complete enumeration or matching set is 1 question and 1 point.': 'Each complete matching set is 1 question and 1 point.',
    "if (action==='play-again' && reviewSession) startSession(reviewSession.settings,reviewSession.results.map(r=>r.id),reviewSession.title);": "if (action==='play-again' && reviewSession) {\n      if (reviewSession.bankVersion === bank.version) startSession(reviewSession.settings,reviewSession.results.map(r=>r.id),reviewSession.title);\n      else startSession({topic:'all',area:'all',type:'all',count:'all',pace:'standard'});\n    }",
    "startSession({topic:focusTopic.dataset.focusTopic,type:'all',count:'all'})": "startSession({topic:focusTopic.dataset.focusTopic,area:'all',type:'all',count:'all'})",
    "const focusTopic = event.target.closest('[data-focus-topic]');": "const focusArea = event.target.closest('[data-focus-area]');\n    if (focusArea) { startSession({topic:'all',area:focusArea.dataset.focusArea,type:'all',count:'all'}); return; }\n    const focusTopic = event.target.closest('[data-focus-topic]');",
}
for original, replacement in replacements.items():
    if original not in text:
        raise RuntimeError(f'Missing expected fragment: {original}')
    text = text.replace(original, replacement)
text = text.replace("<p class=\"feedback-explanation\">${escape(q.explanation)}</p>", "<p class=\"feedback-explanation\">${escape(q.explanation)}</p>${researchLinks(q)}")
text = text.replace("<p class=\"review-explanation\">${escape(q.explanation)}</p>", "<p class=\"review-explanation\">${escape(q.explanation)}</p>${researchLinks(q)}")
insertion = text.index('  function answerFeedback(q, result) {')
text = text[:insertion] + r'''  function researchLinks(q) {
    const ids = q.researchIds || (q.researchId ? [q.researchId] : []);
    return ids.length ? `<div class="research-links"><strong>Documented real-world example</strong>${ids.map(id => {
      const source = bank.research.find(item => item.id === id);
      return `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}: ${escape(source.title)} ↗</a>`;
    }).join('')}</div>` : '';
  }
''' + text[insertion:]
filename.write_text(text, encoding='utf-8')

filename = Path('quiz-reviewer/dist/index.html')
text = filename.read_text(encoding='utf-8')
text = text.replace('An IT 401 midterm reviewer: 100 source-based questions, six question types, timed practice, unlimited retakes, and scores for each username.', 'A cybercrime offences reviewer covering the complete IT 401 offences module, all 23 table rows, five question formats, and researched real-world examples.')
text = text.replace('IT 401 Midterm Reviewer', 'IT 401 Cybercrime Offences Reviewer')
text = text.replace('?v=3', '?v=4')
text = text.replace('IT 401 / MIDTERM', 'IT 401 / CYBERCRIME')
text = text.replace('Topics &amp; sources', 'Module &amp; sources').replace('Topics & sources', 'Module &amp; sources')
text = text.replace('Information Assurance & Security 2', 'Cybercrime Offences & Penalties')
text = text.replace('<span>IT 401 midterm · 100 questions · Unlimited practice</span>', '<span id="bank-summary">Cybercrime offences · Unlimited practice</span>')
text = text.replace('YOUR MIDTERM STUDY SPACE', 'YOUR CYBERCRIME STUDY SPACE')
filename.write_text(text, encoding='utf-8')
