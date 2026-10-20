# Recall — IT 401 Cybercrime Offences Reviewer

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

**Sections** lets you select an individual offence section, read its facts, and start a quiz for that section. Section 65 includes its detailed source-code discussion; Section 77-A has its own compounding quiz. Questions that combine unrelated sections are reserved for the full bank. Expand **Module text & references** to read the complete six-page transcript and researched examples. The [questionnaire coverage report](quiz-reviewer/docs/questionnaire-review.md) maps the content to question IDs.

Eight researched cases appear in the quiz and reference view: WannaCry, Mirai, the UBS logic-bomb allegations, GameOver Zeus, business email compromise, the Nintendo intrusion, the Twitter account-hijacking charges, and Shreya Singhal. Each links to a primary source. Hypothetical practice scenarios are identified separately; foreign prosecutions are classroom analogies rather than claims of convictions under India's IT Act.

## Historical course wording

Course answers follow the supplied module. Section 66-A is included as an explicitly obsolete historical provision. The Section 65 prose says non-bailable while the table says bailable; questions specify which passage is being recalled. Incomplete fine cells are preserved without inventing amounts. Later amendments are flagged separately, with official legal references in the app.

## Practice and saved scores

Choose a username, section or focus area, format, session length and timer pace. Questions, choices, matching rows and matching choices shuffle each time. Restart, replay or retry missed questions without limits. Short sessions of 10, 20, 50, 100 or 200 questions are available alongside the full bank.

Headers are compact, with no username/initials banner. During questions, navigation is hidden until you hover over or click the hamburger button; it also works with touch and keyboard controls. A bold live score shows correct answers against the session total at the top.

The theme icon in each page header offers **Garden**, **Island White**, and **Island Black**. The selected theme stays saved across reloads and sessions. Changing themes or opening navigation preserves the current answer, score and running deadline.

Progress and scores stay in this browser's local storage. Refreshing preserves a current attempt and its running deadline. Completed scores from older versions remain visible without comparing old answers to new keys; older unfinished attempts must restart. Scores do not sync between devices. Session history supports CSV score export.

## Development and validation

```powershell
npm test
npm run build
```

Tests use Node's built-in runner. `npm run build` regenerates the question bank and coverage report, then rebuilds the portable HTML. `npm run build:standalone` is equivalent; `npm run build:questions` regenerates the bank and report only. These commands work from the repository root or `quiz-reviewer/`.

Edit course content in `quiz-reviewer/src/offences-content.js`; the preserved module transcript is `quiz-reviewer/src/module-text.txt`. Generated questions are in `quiz-reviewer/dist/questions.js`. UI source is in `quiz-reviewer/dist/`. No compilation or dependency installation is needed to serve the static site. Mochi is a decorative inline SVG and respects reduced-motion settings.

The updated Hostinger upload package is **`quiz-reviewer/it401-hostinger.zip`**. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting instructions.
