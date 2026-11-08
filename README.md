# Application

Next.js App Router application.

## Requirements

- Node.js 24 (see `.nvmrc`), minimum version in `package.json`.
- npm 11.
- Install dependencies with `npm ci`.

## Development

- `npm run dev`: start the development server.
- `npm run build`: build for production.
- `npm start`: serve the production build.

## License

- [Source license](LICENSE).
- [Content license](CONTENT_LICENSE.md).

## Quality checks

- `npm run lint`: lint source files.
- `npm run format`: format files.
- `npm run format:check`: check formatting.
- `npm run type-check`: generate route types and check TypeScript.

## Continuous integration

Pull requests and pushes to main or feature branches run lint, formatting, type checking, unit tests and a production build.

- `npm test`: run unit tests once.
- `npm run test:watch`: watch unit tests.

## Repository automation

Dependabot checks npm and GitHub Actions weekly. Husky runs lint-staged after `npm ci`; staged files are checked for secrets and formatting, and source files are linted.

- `npm run secrets:check`: scan tracked project content for secrets, excluding generated files.
- After merging the initial protection policy, apply it before starting the next branch:

```sh
gh api --method PUT repos/{owner}/{repo}/branches/main/protection --input .github/branch-protection/main.json
```

Required checks are Lint, Type Check, Unit & Integration Tests and Build. The policy disables force pushes and deletions. Enable the dependency graph, vulnerability alerts, automatic security fixes, secret scanning, push protection and deletion of merged branches in repository settings.

See [ADR-0008](docs/adr/0008-automation-and-branch-protection.md).
