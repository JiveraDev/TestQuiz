# Repository Guidelines

## Project Structure & Module Organization

The root Node.js package runs the static reviewer in `quiz-reviewer/`. The server entry point is `quiz-reviewer/index.js`. UI files and the generated question bank live in `quiz-reviewer/dist/`; editable course content and the preserved module transcript live in `quiz-reviewer/src/`. Automated tests are in `quiz-reviewer/tests/`, build scripts in `quiz-reviewer/scripts/`, and the coverage report in `quiz-reviewer/docs/`. `.idea/` contains IDE configuration.

## Build, Test, and Development Commands

- `npm start`: serve the reviewer at http://localhost:4173.
- `npm test`: run the Node.js built-in tests for coverage, grading, timers and the server.
- `npm run build`: regenerate the question bank and coverage report, then rebuild `quiz-reviewer/IT401-Reviewer.html`.
- `npm run build:standalone`: equivalent to `npm run build`.
- `npm run build:questions`: regenerate just the question bank and coverage report.

The same commands work from the root or `quiz-reviewer/`. No dependency installation or lint command is configured. Edit `quiz-reviewer/src/offences-content.js` for question content and run the build before distributing. After final validation, recreate the Hostinger ZIP from `quiz-reviewer/dist/*`; deployment instructions are in `DEPLOYMENT.md`.

## Coding Style & Naming Conventions

Use two-space indentation, consistent with `package.json`. Write JavaScript using CommonJS (`require` and `module.exports`) unless deliberately migrating the package configuration. Prefer `camelCase` for variables and functions, `PascalCase` for classes, and descriptive `kebab-case.js` module filenames.

No formatter or linter is configured. Keep changes consistent and avoid unrelated formatting edits.

## Testing Guidelines

Use Node's built-in test runner with `quiz-reviewer/tests/*.test.js`. Cover observable behavior and error cases. Content changes must preserve module fidelity, all 23 offence-table rows, all five requested formats, and all answer keys. Never substitute current legal wording silently for historical course answers. Real-world examples need primary-source references and must distinguish allegations, convictions and classroom analogies.

## Commit & Pull Request Guidelines

No Git metadata or commit history is available in this checkout, so no established message convention can be inferred. Use short, imperative commit subjects, such as `Add application entry point`.

Pull requests should explain the change and its purpose, link relevant issues, and report validation commands and results. Identify any remaining testing gaps.

## Configuration Hygiene

Keep credentials, local environment files, installed dependencies, and personal IDE state such as `.idea/workspace.xml` out of commits.
