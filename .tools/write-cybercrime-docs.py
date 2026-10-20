from pathlib import Path

Path('README.md').write_text('''# Recall — IT 401 Cybercrime Offences Reviewer

A browser reviewer following **IT 401 - MIDTERM MODULE - OFFENCES.pdf**. The other subject areas have been removed. There are **408 questions**, covering all 23 offence-table rows, all 13 listed cybercrime forms, the full Section 65 discussion, other listed legal powers, and every Section 77-A compounding rule.

## Open the reviewer

Double-click **`quiz-reviewer/IT401-Reviewer.html`**. This portable file contains the whole app, question bank and original module text. It works offline; opening external research links requires internet access.

Alternatively, run `npm start` and open **http://localhost:4173**. No dependencies, account verification, database or installation are required.

## Question formats and coverage

| Format | Questions |
| --- | ---: |
| Fill in the blank | 112 |
| Matching | 36 |
| Identification | 71 |
| Multiple choice | 137 |
| Situational | 52 |

Every table row is practiced in all five formats. Questions include offence descriptions, maximum imprisonment, repeat convictions, stated fines, bailability, cognizability, and courts where the table names one. Each numbered question is worth one point; every pair in a matching set must be correct to earn that point.

**Module & sources** includes expandable study entries for every offence row and the full extracted text of all six supplied pages, including references and original spelling. The [questionnaire coverage report](quiz-reviewer/docs/questionnaire-review.md) maps the content to question IDs.

Eight researched cases appear in the quiz and reference view: WannaCry, Mirai, the UBS logic-bomb allegations, GameOver Zeus, business email compromise, the Nintendo intrusion, the Twitter account-hijacking charges, and Shreya Singhal. Each links to a primary source. Hypothetical practice scenarios are identified separately; foreign prosecutions are classroom analogies rather than claims of convictions under India's IT Act.

## Historical course wording

Course answers follow the supplied module. Section 66-A is included as an explicitly obsolete historical provision. The Section 65 prose says non-bailable while the table says bailable; questions specify which passage is being recalled. Incomplete fine cells are preserved without inventing amounts. Later amendments are flagged separately, with official legal references in the app.

## Practice and saved scores

Choose a username, focus area, format, session length and timer pace. Questions, choices, matching rows and matching choices shuffle each time. Restart, replay or retry missed questions without limits. Short sessions of 10, 20, 50, 100 or 200 questions are available alongside the full bank.

Progress and scores stay in this browser's local storage. Refreshing preserves a current attempt and its running deadline. Completed scores from older versions remain visible without comparing old answers to new keys; older unfinished attempts must restart. Scores do not sync between devices. Session history supports CSV score export.

## Development and validation

```powershell
npm test
npm run build
```

Tests use Node's built-in runner. `npm run build` regenerates the question bank and coverage report, then rebuilds the portable HTML. `npm run build:standalone` is equivalent; `npm run build:questions` regenerates the bank and report only. These commands work from the repository root or `quiz-reviewer/`.

Edit course content in `quiz-reviewer/src/offences-content.js`; the preserved module transcript is `quiz-reviewer/src/module-text.txt`. Generated questions are in `quiz-reviewer/dist/questions.js`. UI source is in `quiz-reviewer/dist/`. No compilation or dependency installation is needed to serve the static site. Mochi is a decorative inline SVG and respects reduced-motion settings.

The updated Hostinger upload package is **`quiz-reviewer/it401-hostinger.zip`**. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting instructions.
''', encoding='utf-8')

Path('quiz-reviewer/dist/READ-ME.txt').write_text('''RECALL — IT 401 CYBERCRIME OFFENCES REVIEWER

Open index.html in a modern browser, keeping the other files alongside it.
For a single portable offline file, use IT401-Reviewer.html from the project.

408 questions focus exclusively on the complete offences module:
112 fill in the blank, 36 matching, 71 identification,
137 multiple choice, and 52 situational.

All 23 offence-table rows appear in all five formats. The bank also covers all
13 cybercrime forms, Section 65 in detail, other listed legal powers, and all
compounding rules. Module & sources preserves the complete six-page transcript.
Eight researched real-world cases include links to primary sources.

Answers follow the historical course text. Obsolete Section 66-A is labelled.
The conflicting Section 65 prose/table bail statements are assessed explicitly.
Missing fine amounts are not invented. Later legal changes are flagged separately.

Each numbered question is one point. Matching earns its point only when the
whole set is correct. Questions and choices shuffle every attempt. Choose a
shorter session or a particular format or area, and replay without limits.

Scores and unfinished sessions stay in browser local storage. They do not sync.
Version 3 preserves earlier completed scores but requires older attempts to restart.
Usernames are local profile names. Export score summaries from Session history.
External research links require an internet connection; the quiz works offline.
''', encoding='utf-8')

filename = Path('AGENTS.md')
text = filename.read_text(encoding='utf-8')
start = text.index('This repository currently contains')
end = text.index('## Coding Style', start)
text = text[:start] + '''The root Node.js package runs the static reviewer in `quiz-reviewer/`. The server entry point is `quiz-reviewer/index.js`. UI files and the generated question bank live in `quiz-reviewer/dist/`; editable course content and the preserved module transcript live in `quiz-reviewer/src/`. Automated tests are in `quiz-reviewer/tests/`, build scripts in `quiz-reviewer/scripts/`, and the coverage report in `quiz-reviewer/docs/`. `.idea/` contains IDE configuration.

## Build, Test, and Development Commands

- `npm start`: serve the reviewer at http://localhost:4173.
- `npm test`: run the Node.js built-in tests for coverage, grading, timers and the server.
- `npm run build`: regenerate the question bank and coverage report, then rebuild `quiz-reviewer/IT401-Reviewer.html`.
- `npm run build:standalone`: equivalent to `npm run build`.
- `npm run build:questions`: regenerate just the question bank and coverage report.

The same commands work from the root or `quiz-reviewer/`. No dependency installation or lint command is configured. Edit `quiz-reviewer/src/offences-content.js` for question content and run the build before distributing. After final validation, recreate the Hostinger ZIP from `quiz-reviewer/dist/*`; deployment instructions are in `DEPLOYMENT.md`.

''' + text[end:]
start = text.index('There is no testing framework')
end = text.index('## Commit', start)
text = text[:start] + '''Use Node's built-in test runner with `quiz-reviewer/tests/*.test.js`. Cover observable behavior and error cases. Content changes must preserve module fidelity, all 23 offence-table rows, all five requested formats, and all answer keys. Never substitute current legal wording silently for historical course answers. Real-world examples need primary-source references and must distinguish allegations, convictions and classroom analogies.

''' + text[end:]
filename.write_text(text, encoding='utf-8')
