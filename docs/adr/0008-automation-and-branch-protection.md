# ADR-0008: Automation and branch protection

## Status

Accepted.

## Context

The initial CI provides static checks, unit tests and a production build. Repository protection must require checks that exist.

## Decision

Dependabot checks npm and GitHub Actions weekly. Minor and patch npm updates are grouped; blocked major versions are excluded.

Husky runs lint-staged before committing. Staged source files are linted and formatted; all staged files are checked with the recommended secretlint rules.

The main protection record requires Lint, Type Check, Unit & Integration Tests Build, Dependency Audit and CodeQL. Force pushes and deletions are disabled. Administrator enforcement and required pull request reviews are disabled.

After merging this policy, apply `.github/branch-protection/main.json` before starting the next branch. Enable the dependency graph, vulnerability alerts, automated security fixes, secret scanning, push protection and deletion of merged branches in repository settings.

The security workflow audits production dependencies for high severity vulnerabilities, reviews dependencies in pull requests and scans JavaScript and TypeScript with CodeQL. It also runs weekly. Dependency Review only runs for pull requests and is not a required context.

## Consequences

Protection follows the jobs currently provided by CI. New jobs require a corresponding policy update. Local hooks supplement CI and can be bypassed; they do not replace required checks.
