const fs = require('node:fs');
const file = 'quiz-reviewer/dist/app.js';
let app = fs.readFileSync(file, 'utf8');
const start = app.indexOf('    app.innerHTML = ', app.indexOf('  function renderQuestion()'));
const end = app.indexOf("    $('#question-title').focus", start);
if (start < 0 || end < 0) throw new Error('Question view not found');
const markup = '    app.innerHTML = `' + `
      <div class="quiz-toolbar">
        <button class="quiz-home" data-go="practice" aria-label="Return to practice">\${buddy()}<span>recall.</span></button>
        <div class="quiz-session-actions">
          <button class="button secondary" data-action="restart">\${icon('restart')}Restart</button>
          <button class="button text" data-action="end">End session</button>
        </div>
      </div>
      <article class="question-card" aria-labelledby="question-title">
        <div class="question-card-top">
          <div class="question-meta">
            <span class="question-number">Question \${active.position + 1} of \${active.ids.length}</span>
            <span class="question-type">\${bank.types[q.type]}</span>
            <span class="question-topic">\${topic.title}</span>
          </div>
          <div class="question-status">
            <span class="question-score">\${correctSoFar} point\${correctSoFar === 1 ? '' : 's'}</span>
            <div class="question-timer \${feedback ? 'stopped' : ''}" role="timer" aria-label="Time remaining">\${icon('clock')}<span id="timer-text">\${feedback ? 'Answered' : clock(Math.ceil((active.deadline - Date.now()) / 1000))}</span></div>
          </div>
        </div>
        <div class="quiz-progress-track" role="progressbar" aria-label="Questions reviewed" aria-valuemin="0" aria-valuemax="\${active.ids.length}" aria-valuenow="\${active.position + (feedback ? 1 : 0)}"><span style="width:\${(active.position + (feedback ? 1 : 0)) / active.ids.length * 100}%"></span></div>
        <form id="answer-form" novalidate>
          <h1 class="question-prompt" id="question-title" tabindex="-1">\${escape(q.prompt)}</h1>
          \${q.context ? '<p class="question-context">' + escape(q.context) + '</p>' : ''}
          \${responseFields(q,layout,feedback)}
          \${q.type === 'identification' ? '<p class="answer-hint">Standard terms and abbreviations accepted. Case and punctuation do not matter.</p>' : q.type === 'enumeration' ? '<p class="answer-hint">Enter one ' + escape(q.responseLabel) + ' per box, in any order. Do not repeat answers. All ' + q.items.length + ' answers are required for this question’s 1 point.</p>' : q.type === 'matching' ? '<p class="answer-hint">Match all ' + q.pairs.length + ' pairs correctly to earn 1 point.</p>' : ''}
          <p class="form-error" id="answer-error" role="alert"></p>
          \${feedback ? answerFeedback(q,feedback) : ''}
          <div class="question-actions">
            \${feedback ? '<div class="feedback-buddy">' + buddy() + '<span>' + (feedback.correct ? 'Mochi approves.' : 'A little wiser already.') + '</span></div><button type="button" class="button primary" data-action="next">' + (active.position === active.ids.length - 1 ? 'See my score' : 'Next question') + icon('arrow') + '</button>' : '<button type="button" class="button text" data-action="skip">Skip & show answer</button><button type="submit" class="button primary">Check answer' + icon('arrow') + '</button>'}
          </div>
        </form>
      </article>` + '`;\n';
app = app.slice(0,start) + markup + app.slice(end);
const marker = "  function render() {\n    clearInterval(timer);";
if (!app.includes(marker)) throw new Error('Render state marker not found');
app = app.replace(marker, marker + "\n    document.body.classList.toggle('quiz-mode', view === 'quiz' && !!active);");
fs.writeFileSync(file,app,'utf8');
console.log('Question view now uses a compact toolbar and question-first layout.');
