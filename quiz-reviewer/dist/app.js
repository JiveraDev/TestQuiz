(() => {
  'use strict';
  const bank = window.IT401_BANK;
  const core = window.Recall;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const buddy = (className = '') => `<svg class="buddy ${className}" aria-hidden="true"><use href="#i-buddy"/></svg>`;
  const keyFor = name => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const prefix = 'recall-it401-v1-';
  const byId = new Map(bank.questions.map(q => [q.id, q]));
  const app = $('#app');
  let player = read('username', '');
  if (typeof player !== 'string') player = '';
  let history = read('history', []).filter(validHistory);
  let active = null;
  let view = 'practice';
  let timer;
  let toastTimer;
  let reviewSession = null;
  let showMissedOnly = false;
  let settings = { topic: 'all', type: 'all', count: 'all', pace: 'standard' };

  function storageWarning(message) {
    const warning = $('#storage-warning');
    warning.textContent = message;
    warning.hidden = false;
  }
  function read(key, fallback) {
    try {
      const value = localStorage.getItem(prefix + key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      setTimeout(() => storageWarning('Some saved data could not be read. You can still practice during this visit.'), 0);
      return fallback;
    }
  }
  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(prefix + key);
      else localStorage.setItem(prefix + key, JSON.stringify(value));
      return true;
    } catch {
      storageWarning('This browser could not save your latest changes. Keep this tab open and export your scores before leaving.');
      return false;
    }
  }
  function validHistory(session) {
    return session && typeof session.id === 'string' && typeof session.player === 'string' && typeof session.playerKey === 'string'
      && Number.isFinite(Date.parse(session.date)) && Number.isInteger(session.total) && session.total > 0
      && Array.isArray(session.results) && session.results.every(result => result && byId.has(result.id) && typeof result.correct === 'boolean')
      && Number.isInteger(session.correct) && session.correct >= 0 && session.correct <= session.total;
  }
  function playerHistory() { return history.filter(session => session.playerKey === keyFor(player)); }
  function activeKey() { return `active-${encodeURIComponent(keyFor(player))}`; }
  function persistActive() { if (active) write(activeKey(), active); }
  function source(q) { return `${bank.sources[q.source.doc].short} · p. ${q.source.page}`; }
  function clock(seconds) {
    const value = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3300);
  }
  function heading(eyebrow, title, subtitle, aside = '') {
    return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${title}</h1><p class="subtitle">${subtitle}</p></div>${aside}</div>`;
  }
  function navigate(next, focus = true) {
    if (active && view === 'quiz') {
      confirmAction('Leave this session?', 'Your current attempt will stay available to resume. The current question’s timer will continue.', 'Leave session', () => { clearInterval(timer); view = next; render(); });
      return;
    }
    view = next;
    render();
    if (focus) app.querySelector('h1')?.focus({ preventScroll: true });
  }
  function render() {
    clearInterval(timer);
    document.body.classList.remove('answer-correct', 'answer-missed');
    document.querySelectorAll('.nav-item').forEach(button => {
      const current = button.dataset.go === view;
      button.classList.toggle('active', current);
      if (current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    $('#player-label').textContent = player || 'Choose a username';
    $('#avatar').textContent = player ? [...player][0].toUpperCase() : 'R';
    $('#buddy-message').innerHTML = 'One question at a time.<br>You’ve got company.';
    if (view === 'quiz' && active) renderQuestion();
    else if (view === 'results' && reviewSession) renderResults();
    else if (view === 'coverage') renderCoverage();
    else if (view === 'history') renderHistory();
    else renderHome();
  }
  function options(values, selected) {
    return values.map(([value, label]) => `<option value="${escape(value)}" ${value === selected ? 'selected' : ''}>${escape(label)}</option>`).join('');
  }
  function availableQuestions() {
    return bank.questions.filter(q => (settings.topic === 'all' || q.topic === settings.topic) && (settings.type === 'all' || q.type === settings.type));
  }
  function selectedCount() {
    const length = availableQuestions().length;
    return settings.count === 'all' ? length : Math.min(Number(settings.count), length);
  }
  function renderHome() {
    const sessions = playerHistory();
    const total = sessions.reduce((sum, s) => sum + s.total, 0);
    const correct = sessions.reduce((sum, s) => sum + s.correct, 0);
    const average = total ? Math.round(correct / total * 100) : null;
    app.innerHTML = `${heading('IT 401 · YOUR MIDTERM STUDY SPACE', 'Make it <em>stick.</em>', `Welcome${player ? `, ${escape(player)}` : ''}. Your two modules, one focused reviewer.`, '<button class="button secondary" data-action="coverage">Explore the topics' + icon('arrow') + '</button>')}
      ${active ? `<div class="resume-banner"><div><strong>You have a session in progress.</strong><p>${escape(active.title)} · ${active.position + 1} of ${active.ids.length} · ${escape(active.player)}</p></div><button class="button primary" data-action="resume">Resume quiz${icon('arrow')}</button></div>` : ''}
      <div class="hero-grid"><article class="practice-hero"><div class="hero-copy"><span class="pill">100 QUESTIONS · 6 FORMATS</span><h2>Your midterm.<br>One question at a time.</h2><p>Identify it. List it. Match it. Apply it.<br>Then understand the answer.</p><button class="button primary" type="submit" form="setup-form" id="start-button">Start 100-question quiz${icon('arrow')}</button><span class="hero-footnote">Fresh shuffle every time. Unlimited restarts.</span></div><div class="hero-art study-art" aria-hidden="true">${buddy('hero-buddy')}<span class="buddy-caption">Mochi is ready.<br><em>Are you?</em></span></div></article>
      <article class="progress-card"><div class="section-label">YOUR PRACTICE SO FAR</div><h3>Every attempt counts.</h3><div class="progress-ring" style="--score:${average || 0}%"><div><strong>${average === null ? '—' : average + '%'}</strong><span>overall accuracy</span></div></div><div class="progress-stats"><div><strong>${sessions.length}</strong><span>sessions recorded</span></div><div><strong>${sessions.reduce((sum, s) => sum + s.answered, 0)}</strong><span>questions attempted</span></div></div><p>${sessions.length ? 'Your own pace. Your own progress.' : 'Your first quiz is a great place to start.'}</p></article></div>
      <form id="setup-form" class="session-setup"><div class="section-heading"><div><h2>Choose your session</h2><p>Full midterm or a little focused practice. It’s up to you.</p></div><span class="set-count" id="selection-count">100 available</span></div><div class="setup-grid"><label>Topic<select name="topic">${options([['all','All five topics'], ...bank.topics.map(t => [t.id,t.title])], settings.topic)}</select></label><label>Question format<select name="type">${options([['all','All six formats'], ...Object.entries(bank.types)], settings.type)}</select></label><label>Session length<select name="count">${options([['all','All available questions'],['10','10 questions'],['20','20 questions'],['50','50 questions']], settings.count)}</select></label><label>Timer pace<select name="pace">${options([['standard','Standard'],['relaxed','Relaxed · 50% more time'],['challenge','Challenge · 40% less time']], settings.pace)}</select></label></div><div class="setup-note">${icon('clock')}<p>Time adjusts to the format: 30–90 seconds for short questions, longer for lists and matching. <strong>Every numbered question = 1 point.</strong></p></div><p id="setup-error" class="form-error" role="alert"></p></form>
      <section class="sets-section"><div class="section-heading"><div><h2>Find your next focus</h2><p>Every major topic from both supplied modules is represented.</p></div><span class="set-count">5 TOPICS</span></div><div class="topic-list">${bank.topics.map(t => `<button class="topic-row" data-focus-topic="${t.id}"><span class="topic-mark ${t.color}">${t.mark}</span><span class="topic-copy"><strong>${t.title}</strong><span>${t.subtitle}</span></span><span class="topic-count">${bank.questions.filter(q => q.topic === t.id).length} questions</span>${icon('arrow')}</button>`).join('')}</div></section><div class="bottom-tip"><p><strong>Understanding beats memorizing.</strong> Read each explanation, then play again with a fresh shuffle. Enumeration and matching sets each count as one question.</p></div>`;
    updateSelection();
  }
  function updateSelection() {
    const count = selectedCount();
    const start = $('#start-button');
    if (start) { start.innerHTML = `Start ${count}-question quiz${icon('arrow')}`; start.disabled = !count; }
    if ($('#selection-count')) $('#selection-count').textContent = `${availableQuestions().length} available`;
    if ($('#setup-error')) $('#setup-error').textContent = count ? '' : 'No questions match this combination. Choose another topic or format.';
  }
  function renderCoverage() {
    const details = {
      network: 'Network security; active, passive, preventative, and UTM devices; hardware/software firewalls and DHCP; antivirus; web/email filtering; intrusion detection and prevention.',
      signatures: 'Digital versus electronic signatures; known origin and non-repudiation; knowledge, physical-feature, and possession factors; all seven technologies, from PKI to clickable acceptance.',
      risk: 'Four management stages; supplier, resource, and budget risks; probability and impact; matrix levels; four response strategies; six process steps; triggers, contingency plans, assignment, register, threats, and opportunities.',
      testing: 'All six principles and all ten listed testing techniques, including XSS, CSRF, injection, IDOR, access control, misconfiguration, exposure, vulnerable components, and redirects.',
      offences: 'All 13 introductory crime examples; Section 65 and its six acts; every section in the handout’s table (65–74, including lettered entries); stated punishments/classifications; outside-India application, confiscation, investigation; and compounding rules.'
    };
    app.innerHTML = `${heading('BUILT FROM YOUR TWO MODULES','Know your <em>coverage.</em>','100 numbered questions. Six formats. Five areas to review.')}
      <div class="format-strip">${Object.entries(bank.types).map(([type,label]) => `<span><strong>${bank.questions.filter(q => q.type === type).length}</strong>${label}</span>`).join('')}</div><div class="coverage-list">${bank.topics.map(t => `<article><span class="topic-mark ${t.color}">${t.mark}</span><div><h2>${t.title}<span>${bank.questions.filter(q => q.topic === t.id).length} questions</span></h2><p>${details[t.id]}</p></div></article>`).join('')}</div>
      <section class="source-panel"><h2>The source material</h2>${Object.values(bank.sources).map(s => `<p><strong>${s.short}</strong><span>${escape(s.title)} · ${s.pages} PDF pages</span></p>`).join('')}<div class="source-note"><strong>A note about the handouts</strong><p>Legal questions review the supplied historical course material, rather than current law. The Section 65 bailability statements conflict between the prose and table, so that detail is not graded. Section 66-A is labelled as a historical handout entry. Risk “qualification” and “quantification” are both accepted.</p><p>Page references use the PDF page number. Cover, closing, duplicate, and blank pages do not add separate topics. Situations are new practice examples applying the supplied concepts.</p></div></section><button class="button primary" data-action="practice">Start practicing${icon('arrow')}</button>`;
  }
  function renderHistory() {
    const sessions = playerHistory().slice().reverse();
    app.innerHTML = heading('A SEPARATE SCORE FOR EVERY SESSION','Practice adds <em>up.</em>', `Sessions for ${escape(player)}. Play again as often as you like.`, sessions.length ? `<button class="button secondary" data-action="export">${icon('download')}Export scores</button>` : '')
      + (sessions.length ? `<div class="history-summary"><span>${sessions.length} recorded sessions</span><span>Saved on this browser only</span></div>${sessions.map(s => `<article class="history-row"><span class="history-score">${Math.round(s.correct / s.total * 100)}%</span><div class="history-detail"><h3>${escape(s.title)}</h3><p>${s.correct}/${s.total} points · ${clock(s.duration)} elapsed · ${escape(s.status === 'completed' ? 'Completed' : 'Ended early')}</p><span>${escape(new Date(s.date).toLocaleString())}</span></div><button class="button secondary" data-review="${escape(s.id)}">Review${icon('arrow')}</button></article>`).join('')}` : `<div class="empty-state">${buddy()}<h2>Your story starts with one quiz.</h2><p>Finish a session and its score, time, and answers will appear here under your username.</p><button class="button primary" data-action="practice">Start practicing${icon('arrow')}</button></div>`)
      + '<p class="privacy-footnote">Names are not verified. Scores are local to this browser and device; clearing browser data removes them.</p>';
  }
  function prepareLayout(q) {
    return { options: q.options ? core.shuffle(q.options.map((_, index) => index)) : [], rows: q.pairs ? core.shuffle(q.pairs.map((_,index) => index)) : [], choices: q.pairs ? core.shuffle(q.pairs.map(pair => pair.right)) : [] };
  }
  function startSession(overrides = null, ids = null, title = null) {
    if (!player) { $('#login-dialog').showModal(); return; }
    if (overrides) settings = { ...settings, ...overrides };
    const available = ids ? ids.map(id => byId.get(id)).filter(Boolean) : availableQuestions();
    const count = ids || settings.count === 'all' ? available.length : Math.min(Number(settings.count), available.length);
    if (!count) return;
    const selected = core.shuffle(available).slice(0, count);
    const topicTitle = bank.topics.find(t => t.id === settings.topic)?.title || 'Full midterm mix';
    active = { id: crypto.randomUUID(), player, playerKey: keyFor(player), ids: selected.map(q => q.id), layouts: Object.fromEntries(selected.map(q => [q.id,prepareLayout(q)])), position: 0, results: [], draft: null, feedback: null, started: Date.now(), deadline: 0, questionStarted: 0, pace: settings.pace, settings: { ...settings }, title: title || topicTitle };
    startQuestion();
    view = 'quiz';
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function startQuestion() {
    const q = byId.get(active.ids[active.position]);
    active.draft = q.type === 'enumeration' ? Array(q.items.length).fill('') : q.type === 'matching' ? Array(q.pairs.length).fill('') : q.options ? null : '';
    active.feedback = null;
    active.questionStarted = Date.now();
    active.deadline = active.questionStarted + core.secondsFor(q, active.pace) * 1000;
    persistActive();
  }
  function renderQuestion() {
    const q = byId.get(active.ids[active.position]);
    const layout = active.layouts[q.id];
    const feedback = active.feedback;
    const topic = bank.topics.find(t => t.id === q.topic);
    const correctSoFar = active.results.filter(r => r.correct).length;
    app.innerHTML = `<div class="quiz-page-header"><div><p class="eyebrow">${escape(active.title)}</p><h1>One question.<br><em>Give it your best.</em></h1></div><div class="quiz-session-actions"><button class="button secondary" data-action="restart">${icon('restart')}Restart</button><button class="button text" data-action="end">End session</button></div></div><article class="question-card"><div class="question-card-top"><div><span class="question-type">${bank.types[q.type]}</span><span class="question-topic">${topic.title}</span></div><div class="question-timer ${feedback ? 'stopped' : ''}" role="timer" aria-label="Time remaining">${icon('clock')}<span id="timer-text">${feedback ? 'Answered' : clock(Math.ceil((active.deadline - Date.now()) / 1000))}</span></div></div><div class="question-progress"><div><span>Question ${active.position + 1} of ${active.ids.length}</span><span>${correctSoFar} point${correctSoFar === 1 ? '' : 's'} so far</span></div><div class="quiz-progress-track"><span style="width:${(active.position + (feedback ? 1 : 0)) / active.ids.length * 100}%"></span></div></div><form id="answer-form" novalidate><h2 class="question-prompt" id="question-title" tabindex="-1">${escape(q.prompt)}</h2>${responseFields(q,layout,feedback)}<p class="answer-hint">${q.type === 'identification' ? 'Capitalization and punctuation do not matter. Use the course term or a standard abbreviation.' : q.type === 'enumeration' ? `${q.items.length} items · any order · no duplicates · the complete list earns 1 point.` : q.type === 'matching' ? `${q.pairs.length} pairs · choose a match for every row · the complete set earns 1 point.` : 'Choose the best answer, then check it.'}</p><p class="form-error" id="answer-error" role="alert"></p>${feedback ? answerFeedback(q,feedback) : ''}<div class="question-actions">${feedback ? `<div class="feedback-buddy">${buddy()}<span>${feedback.correct ? 'Mochi approves.' : 'A little wiser already.'}</span></div><button type="button" class="button primary" data-action="next">${active.position === active.ids.length - 1 ? 'See my score' : 'Next question'}${icon('arrow')}</button>` : `<button type="button" class="button text" data-action="skip">Skip & show answer</button><button type="submit" class="button primary">Check answer${icon('arrow')}</button>`}</div></form><div class="question-source">${icon('book')}<span>${escape(source(q))} · ${q.id} · 1 point</span></div></article><div class="quiz-under-note"><span>Unlimited restarts. A fresh shuffle every attempt.</span><span>${escape(active.player)} · ${active.pace} pace</span></div>`;
    $('#question-title').focus({ preventScroll: true });
    if (feedback) {
      document.body.classList.add(feedback.correct ? 'answer-correct' : 'answer-missed');
      $('#buddy-message').textContent = feedback.correct ? 'Nice work. Keep that one.' : 'Now you know a little more.';
    } else {
      tick();
      if (!active.feedback) timer = setInterval(tick, 250);
    }
  }
  function responseFields(q, layout, feedback) {
    const disabled = feedback ? 'disabled' : '';
    if (q.options) return `<div class="answer-options" role="group" aria-label="Answer choices">${layout.options.map((index, position) => {
      const selected = active.draft === index;
      const className = feedback ? index === q.answer ? 'correct' : selected ? 'wrong' : '' : selected ? 'selected' : '';
      return `<button type="button" class="answer-option ${className}" data-choice="${index}" aria-pressed="${selected}" ${disabled}><span class="answer-letter">${String.fromCharCode(65 + position)}</span><span>${escape(q.options[index])}</span>${feedback && (index === q.answer || selected) ? icon(index === q.answer ? 'check' : 'close') : ''}</button>`;
    }).join('')}</div>`;
    if (q.type === 'identification') return `<label class="written-answer">Your answer<input name="response" maxlength="250" autocomplete="off" spellcheck="false" placeholder="Type the term here…" value="${escape(active.draft)}" ${disabled}></label>`;
    if (q.type === 'enumeration') return `<div class="enumeration-inputs">${q.items.map((_, index) => `<label><span>${index + 1}</span><input name="item${index}" data-item="${index}" maxlength="250" autocomplete="off" placeholder="Item ${index + 1}" aria-label="Enumeration item ${index + 1}" value="${escape(active.draft[index])}" ${disabled}></label>`).join('')}</div>`;
    return `<div class="matching-inputs">${layout.rows.map(index => `<label><span>${escape(q.pairs[index].left)}</span><select data-match="${index}" aria-label="Match: ${escape(q.pairs[index].left)}" ${disabled}><option value="">Choose a match…</option>${layout.choices.map(value => `<option value="${escape(value)}" ${active.draft[index] === value ? 'selected' : ''}>${escape(value)}</option>`).join('')}</select></label>`).join('')}</div>`;
  }
  function modelAnswer(q) {
    if (q.options) return `<p><strong>${escape(q.options[q.answer])}</strong></p>`;
    if (q.type === 'identification') return `<p><strong>${escape(q.answer)}</strong></p>`;
    if (q.type === 'enumeration') return `<ol>${q.items.map(item => `<li>${escape(item.label)}</li>`).join('')}</ol>`;
    return `<dl class="matching-key">${q.pairs.map(pair => `<div><dt>${escape(pair.left)}</dt><dd>${escape(pair.right)}</dd></div>`).join('')}</dl>`;
  }
  function answerFeedback(q, result) {
    return `<div class="answer-feedback ${result.correct ? '' : 'incorrect'}" role="status"><strong>${result.timedOut ? 'Time’s up. Here’s the answer.' : result.skipped ? 'One to come back to.' : result.correct ? 'That’s right. Nicely done.' : 'Not quite. Let’s make it stick.'}</strong><span>${result.correct ? '1 point earned' : '0 points'}${result.total > 1 ? ` · ${result.matched}/${result.total} ${q.type === 'matching' ? 'pairs' : 'items'} correct` : ''}</span><div class="model-answer">${modelAnswer(q)}</div><p class="feedback-explanation">${escape(q.explanation)}</p>${result.total > 1 && !result.correct ? '<p class="grading-note">The full list or matching set must be correct to earn its single point. Item counts are feedback, not extra questions.</p>' : ''}</div>`;
  }
  function tick() {
    if (!active || active.feedback || view !== 'quiz') return;
    const remaining = Math.max(0, Math.ceil((active.deadline - Date.now()) / 1000));
    const text = $('#timer-text');
    if (text) { text.textContent = clock(remaining); text.closest('.question-timer').classList.toggle('urgent', remaining <= 10); }
    if (!remaining) submitAnswer({ timedOut: true });
  }
  function submitAnswer({ timedOut = false, skipped = false } = {}) {
    if (!active || active.feedback) return;
    if (!timedOut && !skipped && Date.now() >= active.deadline) { submitAnswer({ timedOut: true }); return; }
    const q = byId.get(active.ids[active.position]);
    const response = skipped ? q.options ? null : q.items || q.pairs ? [] : '' : structuredClone(active.draft);
    const blank = q.options ? response === null : Array.isArray(response) ? !response.some(value => String(value).trim()) : !String(response).trim();
    if (!timedOut && !skipped && blank) { $('#answer-error').textContent = 'Enter or choose an answer first, or use “Skip & show answer.”'; return; }
    clearInterval(timer);
    const result = { id: q.id, response, ...core.grade(q,response), timedOut, skipped, seconds: Math.min(core.secondsFor(q,active.pace), Math.max(0, Math.round((Date.now() - active.questionStarted) / 1000))) };
    active.feedback = result;
    active.results.push(result);
    persistActive();
    renderQuestion();
    $('#answer-form .answer-feedback')?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  function finishSession(status = 'completed') {
    if (!active) return;
    clearInterval(timer);
    const results = active.results.slice();
    for (const id of active.ids) if (!results.some(r => r.id === id)) results.push({ id, response: null, correct: false, matched: 0, total: byId.get(id).items?.length || byId.get(id).pairs?.length || 1, unanswered: true });
    const summary = core.summarize(results, active.ids.length);
    const session = { id: active.id, player: active.player, playerKey: active.playerKey, title: active.title, date: new Date().toISOString(), correct: summary.correct, total: summary.total, answered: active.results.length, duration: Math.max(0, Math.round((Date.now() - active.started) / 1000)), results, status, settings: active.settings };
    const saved = read('history', []);
    const merged = Array.isArray(saved) ? saved.filter(validHistory) : [];
    const all = new Map([...merged,...history,session].map(s => [s.id,s]));
    history = [...all.values()].sort((a,b) => new Date(a.date) - new Date(b.date));
    write('history', history);
    write(activeKey(), null);
    active = null;
    reviewSession = session;
    showMissedOnly = false;
    view = 'results';
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function displayResponse(q,response) {
    if (q.options) return Number.isInteger(response) ? q.options[response] : 'No answer';
    if (Array.isArray(response)) return response.filter(Boolean).join(' · ') || 'No answer';
    return response || 'No answer';
  }
  function renderResults() {
    const s = reviewSession;
    const missed = s.results.filter(r => !r.correct);
    const percent = Math.round(s.correct / s.total * 100);
    const shown = showMissedOnly ? missed : s.results;
    app.innerHTML = `${heading('SESSION COMPLETE · ' + escape(s.player), percent >= 80 ? 'Look at you <em>go.</em>' : 'A little wiser <em>already.</em>', 'Every attempt is practice. Your next one gets a fresh shuffle.')}
      <div class="result-layout"><article class="session-result"><div><span class="eyebrow">YOUR SESSION SCORE</span><div class="result-score">${s.correct}<span> / ${s.total}</span></div><p>${percent}% accuracy · ${clock(s.duration)} elapsed</p><span class="result-status">${s.status === 'completed' ? 'All questions reviewed' : `Ended early · ${s.total - s.answered} unanswered count as 0`}</span></div>${buddy()}<div class="result-buttons"><button class="button primary" data-action="play-again">${icon('restart')}Play again</button>${missed.length ? `<button class="button secondary" data-action="retry-missed">Retry ${missed.length} missed${icon('arrow')}</button>` : ''}<button class="button text" data-action="practice">Change session</button></div></article><article class="result-breakdown"><h2>By question format</h2>${Object.entries(bank.types).map(([type,label]) => { const rows=s.results.filter(r => byId.get(r.id).type === type); return rows.length ? `<div><span>${label}</span><strong>${rows.filter(r=>r.correct).length} / ${rows.length}</strong></div>` : ''; }).join('')}<p>Each complete enumeration or matching set is 1 question and 1 point.</p></article></div>
      <section class="answers-review"><div class="section-heading"><div><h2>Understand your answers</h2><p>Your answer, the key, and the explanation.</p></div><button class="button secondary" data-action="toggle-missed">${showMissedOnly ? 'Show all answers' : 'Show missed only'}</button></div>${shown.length ? shown.map(result => { const q=byId.get(result.id); return `<details class="review-item ${result.correct ? '' : 'missed'}"><summary><span class="review-status">${result.correct ? 'Correct · 1 pt' : result.unanswered ? 'Unanswered · 0 pts' : result.timedOut ? 'Time expired · 0 pts' : 'Review · 0 pts'}</span><strong>${escape(q.prompt)}</strong><span class="review-source">${escape(bank.types[q.type])} · ${escape(source(q))} · ${q.id}</span></summary><div class="review-content"><p><strong>Your answer:</strong> ${escape(displayResponse(q,result.response))}</p><div class="review-model"><strong>Answer key</strong>${modelAnswer(q)}</div><p class="review-explanation">${escape(q.explanation)}</p></div></details>`; }).join('') : '<div class="empty-state"><h2>No missed answers in this session.</h2><p>Ready for another round?</p></div>'}</section>`;
    $('#buddy-message').textContent = percent >= 80 ? 'Mochi is proud of that practice.' : 'Every attempt helps. Let’s try again.';
  }
  function confirmAction(title, message, label, onConfirm) {
    const dialog = $('#confirm-dialog');
    $('#confirm-content').innerHTML = `<div class="quit-confirm"><h2 id="confirm-title">${escape(title)}</h2><p>${escape(message)}</p><div><button class="button secondary" id="cancel-confirm">Keep studying</button><button class="button primary" id="accept-confirm">${escape(label)}</button></div></div>`;
    $('#cancel-confirm').onclick = () => dialog.close();
    $('#accept-confirm').onclick = () => { dialog.close(); onConfirm(); };
    dialog.showModal();
  }
  function exportScores() {
    const rows = [['Username','Date','Session','Correct','Total','Percent','Seconds','Status'], ...playerHistory().map(s => [s.player,s.date,s.title,s.correct,s.total,Math.round(s.correct/s.total*100),s.duration,s.status])];
    const csv = rows.map(row => row.map(value => '"' + String(value).replace(/^[=+@-]/, "'$&").replace(/"/g,'""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href=url; link.download='it401-session-scores.csv'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) { event.preventDefault(); navigate(go.dataset.go); return; }
    const focusTopic = event.target.closest('[data-focus-topic]');
    if (focusTopic) { startSession({topic:focusTopic.dataset.focusTopic,type:'all',count:'all'}); return; }
    const choice = event.target.closest('[data-choice]');
    if (choice && active && !active.feedback) {
      if (Date.now() >= active.deadline) { tick(); return; }
      active.draft=Number(choice.dataset.choice); persistActive();
      app.querySelectorAll('[data-choice]').forEach(button => { const selected=Number(button.dataset.choice)===active.draft; button.classList.toggle('selected',selected); button.setAttribute('aria-pressed',String(selected)); });
      $('#answer-error').textContent=''; return;
    }
    const review = event.target.closest('[data-review]');
    if (review) { reviewSession=history.find(s=>s.id===review.dataset.review && s.playerKey===keyFor(player)); showMissedOnly=false; view='results'; render(); window.scrollTo({top:0,behavior:'instant'}); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (['practice','coverage','history'].includes(action)) navigate(action);
    if (action==='resume' && active) { view='quiz'; render(); }
    if (action==='skip') submitAnswer({skipped:true});
    if (action==='next' && active?.feedback) { if (active.position===active.ids.length-1) finishSession(); else { active.position++; startQuestion(); renderQuestion(); window.scrollTo({top:0,behavior:'instant'}); } }
    if (action==='restart' && active) confirmAction('Start a fresh round?', 'This unfinished attempt will be replaced. Completed session scores stay in your history. You can restart as often as you like.', 'Restart quiz', () => startSession(active.settings, active.ids, active.title));
    if (action==='end' && active) confirmAction('Finish this attempt now?', 'Your score will be saved. Unanswered questions count as zero. You can play again right away.', 'Save & finish', () => finishSession('ended'));
    if (action==='play-again' && reviewSession) startSession(reviewSession.settings,reviewSession.results.map(r=>r.id),reviewSession.title);
    if (action==='retry-missed' && reviewSession) startSession(reviewSession.settings,reviewSession.results.filter(r=>!r.correct).map(r=>r.id),'Retry missed questions');
    if (action==='toggle-missed') { showMissedOnly=!showMissedOnly; renderResults(); }
    if (action==='export') exportScores();
  });
  app.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.id==='setup-form') {
      if (active) confirmAction('Start a new session?', 'Your unfinished session will be replaced with a fresh shuffle. Completed scores will stay saved.', 'Start new session', () => startSession());
      else startSession();
    }
    if (event.target.id==='answer-form') submitAnswer();
  });
  app.addEventListener('change', event => {
    if (event.target.closest('#setup-form')) { settings[event.target.name]=event.target.value; updateSelection(); }
    if (event.target.matches('[data-match]') && active && !active.feedback) { active.draft[Number(event.target.dataset.match)]=event.target.value; persistActive(); }
  });
  app.addEventListener('input', event => {
    if (!active || active.feedback || view!=='quiz') return;
    if (event.target.name==='response') active.draft=event.target.value;
    else if (event.target.hasAttribute('data-item')) active.draft[Number(event.target.dataset.item)]=event.target.value;
    else return;
    persistActive(); $('#answer-error').textContent='';
  });
  $('#switch-player').addEventListener('click', () => {
    if (active && view==='quiz') confirmAction('Switch players?', 'This username’s attempt stays available to resume. Its current question timer keeps running.', 'Switch username', () => { clearInterval(timer); $('#username').value=''; $('#login-dialog').showModal(); });
    else { $('#username').value=''; $('#login-dialog').showModal(); }
  });
  $('#login-dialog').addEventListener('cancel', event => { if (!player) event.preventDefault(); });
  $('#login-dialog').addEventListener('close', () => { if (view==='quiz' && active && !active.feedback) { clearInterval(timer); tick(); if (!active.feedback) timer=setInterval(tick,250); } });
  $('#login-form').addEventListener('submit', event => {
    event.preventDefault();
    const username=$('#username').value.trim().replace(/\s+/g,' ');
    if (!username || username.length>30) { $('#login-error').textContent='Enter a username between 1 and 30 characters.'; return; }
    player=username; write('username',player); loadActive(); $('#login-error').textContent=''; view='practice'; $('#login-dialog').close(); render(); toast(`Welcome, ${player}. Ready when you are.`);
  });
  function loadActive() {
    const saved=read(activeKey(),null);
    const valid=saved && saved.playerKey===keyFor(player) && Array.isArray(saved.ids) && saved.ids.length>0 && saved.ids.every(id=>byId.has(id)) && new Set(saved.ids).size===saved.ids.length
      && Number.isInteger(saved.position) && saved.position>=0 && saved.position<saved.ids.length && Array.isArray(saved.results) && saved.layouts && Number.isFinite(saved.deadline)
      && saved.ids.every(id=>saved.layouts[id] && Array.isArray(saved.layouts[id].options) && Array.isArray(saved.layouts[id].rows) && Array.isArray(saved.layouts[id].choices));
    active=valid?saved:null;
    if (valid) { settings={...settings,...saved.settings}; if (typeof active.draft!=='string' && !Number.isInteger(active.draft) && !Array.isArray(active.draft) && active.draft!==null) active=null; }
    if (saved && !active) storageWarning('An unfinished session could not be restored. Your completed scores are still available.');
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.addEventListener('focus', tick);
  if (core.validateBank(bank).length) { app.innerHTML='<p class="app-error">The question bank could not be loaded. Please reload the page.</p>'; return; }
  if (player) loadActive();
  render();
  if (!player) $('#login-dialog').showModal();
})();
