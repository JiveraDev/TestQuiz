from pathlib import Path

filename = Path('quiz-reviewer/dist/app.js')
text = filename.read_text(encoding='utf-8')
original = '<div class="setup-grid"><label>Focus<select name="area">'
replacement = '<div class="setup-grid"><label>Section<select name="section">${options(sectionOptions(), settings.section)}</select></label><label>Focus<select name="area">'
assert original in text
text = text.replace(original, replacement)
start = text.index('  function renderCoverage() {')
end = text.index('  function renderHistory() {', start)
text = text[:start] + r'''  function renderCoverage() {
    const rows = coverageSection === 'all' ? bank.tableRows : bank.tableRows.filter(row => row.section === coverageSection);
    const count = core.filterQuestions(bank, { section: coverageSection }).length;
    app.innerHTML = `${heading('', 'Sections', '', '')}
      <div class="section-picker"><label for="coverage-section">Study a section<select id="coverage-section">${options(sectionOptions(), coverageSection)}</select></label><button class="button primary" data-practice-section="${escape(coverageSection)}">${coverageSection === 'all' ? 'Practice all sections' : `Practice Section ${escape(coverageSection)}`}<span>${count}</span>${icon('arrow')}</button></div>
      <section class="module-section section-browser" aria-label="Offence sections"><div class="offence-rows">${rows.map(row => {
        const related = core.filterQuestions(bank, { section: row.section });
        return `<details class="offence-row"${coverageSection !== 'all' ? ' open' : ''}><summary><strong>Section ${escape(row.section)}</strong><span>${escape(row.offence)}</span></summary><div class="offence-row-content"><dl><div><dt>Punishment</dt><dd>${escape(row.punishment)}</dd></div><div><dt>Bailability</dt><dd>${escape(row.bail)}</dd></div><div><dt>Cognizability</dt><dd>${escape(row.cognizability)}</dd></div>${row.court ? `<div><dt>Court as printed</dt><dd>${escape(row.court)}</dd></div>` : ''}</dl>${row.note ? `<p class="course-note">${escape(row.note)}</p>` : ''}<div class="coverage-formats">${Object.entries(bank.types).map(([type,label]) => `<span>${escape(label)} · ${related.filter(q => q.type === type).length}</span>`).join('')}</div><button class="button secondary section-practice" data-practice-section="${escape(row.section)}">Practice this section${icon('arrow')}</button></div></details>`;
      }).join('')}${coverageSection === 'all' || coverageSection === '77-A' ? `<details class="offence-row compounding-row"${coverageSection === '77-A' ? ' open' : ''}><summary><strong>Section 77-A</strong><span>Compounding of offences</span></summary><div class="offence-row-content"><p>Apply through the competent court. Offences punishable with life imprisonment or a term exceeding three years are excluded.</p><p>Additional exclusions: a qualifying previous conviction, an effect on the country's socioeconomic conditions, a child victim below 18, or a woman victim. The historical procedure cites Sections 265-B and 265-C of Cr. P.C.</p><button class="button secondary section-practice" data-practice-section="77-A">Practice compounding${icon('arrow')}</button></div></details>` : ''}</div></section>
      <details class="reference-group"><summary>Module text & references <span>${bank.questions.length} questions · 5 formats</span></summary><div class="reference-content">
      <section class="source-panel"><h2>Course wording</h2><p>Section 66-A is retained as an obsolete historical provision. The Section 65 prose says non-bailable while the table says bailable; questions distinguish those passages. Later amendments affect other provisions, so course punishments are historical.</p><p>Incomplete fine amounts and generic court entries are retained. The source's “Denial of attacks” is accepted alongside the standard term denial-of-service.</p></section>
      <section class="module-section"><div class="section-heading"><div><h2>Complete module text</h2><p>All six supplied pages, with original wording and spelling.</p></div></div>${bank.modulePages.map(page => `<details class="module-page"><summary>Module page ${page.page}</summary><pre>${escape(page.text)}</pre></details>`).join('')}</section>
      <section class="module-section"><div class="section-heading"><div><h2>Real-world examples</h2><p>Primary sources. Foreign prosecutions are classroom analogies.</p></div></div><div class="research-grid">${bank.research.map(item => `<article class="research-card"><span class="eyebrow">${escape(item.publisher)} · ${escape(item.date)}</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><p><strong>Study connection:</strong> ${escape(item.explanation)}</p><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">Read the primary source ↗</a></article>`).join('')}</div></section>
      <section class="source-panel"><h2>Course source</h2><p>${escape(bank.sources.offences.title)} · 6 PDF pages</p><h2>Legal references</h2>${bank.legalSources.map(source => `<p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a> · ${escape(source.publisher)}<span>${escape(source.note)}</span></p>`).join('')}</section></div></details>`;
  }
''' + text[end:]
original = "const topicTitle = bank.areas[settings.area] || 'Complete cybercrime offences';"
assert original in text
text = text.replace(original, "const topicTitle = settings.section !== 'all' ? `Section ${settings.section}` : bank.areas[settings.area] || 'Complete cybercrime offences';")
text = text.replace("    const topic = bank.topics.find(t => t.id === q.topic);", "    closeNavigation();\n    const questionSections = core.sectionsFor(q);")
original = '<button class="quiz-home" data-go="practice" aria-label="Return to practice">${buddy()}<span>recall.</span></button>'
assert original in text
text = text.replace(original, '<div class="quiz-heading"><button class="navigation-toggle" id="navigation-toggle" data-action="toggle-navigation" aria-controls="main-navigation" aria-expanded="false" aria-label="Open navigation">${icon(\'menu\')}</button><span>${settings.section !== \'all\' ? `Section ${escape(settings.section)}` : \'Cybercrime\'}</span></div><div class="quiz-score" role="status" aria-live="polite" aria-atomic="true"><span>Score</span><strong>${correctSoFar}<span> / ${active.ids.length}</span></strong></div>')
text = text.replace('<span class="question-topic">${topic.title}</span>', '${questionSections.length === 1 ? `<span class="question-topic">Section ${escape(questionSections[0])}</span>` : \'\'}')
text = text.replace('            <span class="question-score">${correctSoFar} point${correctSoFar === 1 ? \'\' : \'s\'}</span>\n', '')
text = text.replace("{topic:'all',area:focusArea.dataset.focusArea,type:'all',count:'all'}", "{topic:'all',area:focusArea.dataset.focusArea,section:'all',type:'all',count:'all'}")
text = text.replace("{topic:focusTopic.dataset.focusTopic,area:'all',type:'all',count:'all'}", "{topic:focusTopic.dataset.focusTopic,area:'all',section:'all',type:'all',count:'all'}")
text = text.replace("{topic:'all',area:'all',type:'all',count:'all',pace:'standard'}", "{topic:'all',area:'all',section:'all',type:'all',count:'all',pace:'standard'}")
original = "    if (event.target.closest('#setup-form')) { settings[event.target.name]=event.target.value; updateSelection(); }"
assert original in text
text = text.replace(original, r'''    if (event.target.id === 'coverage-section') {
      coverageSection = event.target.value;
      renderCoverage();
      $('#coverage-section').focus({ preventScroll: true });
      return;
    }
    if (event.target.closest('#setup-form')) {
      settings[event.target.name]=event.target.value;
      if (event.target.name === 'section' && settings.section !== 'all') {
        settings.area='all';
        $('#setup-form [name="area"]').value='all';
      } else if (event.target.name === 'area' && settings.area !== 'all') {
        settings.section='all';
        $('#setup-form [name="section"]').value='all';
      }
      updateSelection();
    }''')
filename.write_text(text, encoding='utf-8')

filename = Path('quiz-reviewer/dist/index.html')
text = filename.read_text(encoding='utf-8')
text = text.replace('?v=4', '?v=5')
text = text.replace('<symbol id="i-cards"', '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>\n    <symbol id="i-cards"')
text = text.replace('<aside class="sidebar">', '<aside class="sidebar" id="main-navigation" aria-label="Navigation">\n    <button class="navigation-close" data-action="close-navigation" aria-label="Close navigation"><svg aria-hidden="true"><use href="#i-close"/></svg></button>')
text = text.replace('Module &amp; sources', 'Sections')
text = text.replace('    <div class="local-note">', '    <button class="profile-switch" id="switch-player">Switch username</button>\n    <div class="local-note">')
start = text.index('<header class="topbar">')
end = text.index('</header>', start) + len('</header>')
text = text[:start] + text[end:]
text = text.replace('  <main id="main"', '  <button class="navigation-backdrop" data-action="close-navigation" aria-label="Close navigation" tabindex="-1"></button>\n  <main id="main"')
filename.write_text(text, encoding='utf-8')
