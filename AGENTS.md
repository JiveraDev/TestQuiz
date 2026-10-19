# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains a minimal Node.js package. `package.json` declares CommonJS modules and an `index.js` entry point, but that file has not been created. There are no source, test, or asset directories and no declared dependencies. `.idea/` contains IDE configuration.

Keep the entry point at the repository root. As implementation grows, place reusable modules in `src/`, automated tests in `tests/`, and static resources in `assets/`. Create these directories only when needed.

## Build, Test, and Development Commands

- `npm run`: list the scripts defined in `package.json`.
- `npm test`: run the current placeholder, which prints "Error: no test specified" and exits with status 1. This is expected until a test runner is configured.
- `node index.js`: run the application after the declared entry point has been implemented.

No build, development-server, or lint commands are configured. Add appropriate scripts to `package.json` when introducing tooling, and document them here.

## Coding Style & Naming Conventions

Use two-space indentation, consistent with `package.json`. Write JavaScript using CommonJS (`require` and `module.exports`) unless deliberately migrating the package configuration. Prefer `camelCase` for variables and functions, `PascalCase` for classes, and descriptive `kebab-case.js` module filenames.

No formatter or linter is configured. Keep changes consistent and avoid unrelated formatting edits.

## Testing Guidelines

There is no testing framework or coverage requirement yet. When adding tests, use `tests/*.test.js`, cover observable behavior and error cases, and replace the placeholder `test` script with the selected runner. Document any required setup. Do not treat the existing `npm test` failure as a regression or claim it verifies functionality.

## Commit & Pull Request Guidelines

No Git metadata or commit history is available in this checkout, so no established message convention can be inferred. Use short, imperative commit subjects, such as `Add application entry point`.

Pull requests should explain the change and its purpose, link relevant issues, and report validation commands and results. Identify any remaining testing gaps.

## Configuration Hygiene

Keep credentials, local environment files, installed dependencies, and personal IDE state such as `.idea/workspace.xml` out of commits.
