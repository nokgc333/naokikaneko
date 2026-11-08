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

- [Source license](LICENSE) (`LICENSE`).
- [Content license](CONTENT_LICENSE.md) (`CONTENT_LICENSE.md`).

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

Required checks are Lint, Type Check, Unit & Integration Tests, Build, E2E Tests, Dependency Audit and CodeQL. The policy disables force pushes and deletions. Enable the dependency graph, vulnerability alerts, automatic security fixes, secret scanning, push protection and deletion of merged branches in repository settings.

See [ADR-0008](docs/adr/0008-automation-and-branch-protection.md).

## Content editing

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for frontmatter, categories, manual editing and browser editing.

- `npm run content:check`: validate entries before saving.
- `npm run cms:proxy`: run the local CMS server, then open `http://localhost:3000/admin` alongside the development server.
- `npm run prepare`: enable the staged-file hook; npm ci runs this automatically.

## Setup

Use the Node version from `.nvmrc`, run `npm ci`, copy the empty `.env.example` template to `.env.local`, and set only the variables needed by the feature. Never commit their values.

- `RESEND_API_KEY`: Resend API key for contact mail.
- `ADMIN_EMAIL`: destination address for contact mail.
- `CONTACT_MAIL_FROM`: sender address on a domain verified by Resend.
- `GITHUB_OAUTH_CLIENT_ID`: GitHub OAuth App client ID for CMS login.
- `GITHUB_OAUTH_CLIENT_SECRET`: GitHub OAuth App client secret for CMS login.

Register the same names in the hosting environment for Production and Preview. Without settings, browsing works; mail and CMS login return a configuration error.

Verify the sending domain in Resend with its DNS records. Create a GitHub OAuth App with the site as Homepage URL and `<site URL>/api/decap-oauth/callback` as Authorization callback URL. The requested scope is public_repo.

CMS settings live in `public/admin/config.yml`: set the repository, branch, base URL and authorization endpoint for the target site. Open `/admin` and log in with GitHub to save content directly to main. For local editing, run `npm run cms:proxy`; local_backend enables editing without login.

## Design records

- [0001](docs/adr/0001-mdx-content-pipeline.md)
- [0002](docs/adr/0002-decap-cms-with-own-github-oauth.md)
- [0003](docs/adr/0003-in-memory-rate-limiting.md)
- [0004](docs/adr/0004-react-compiler.md)
- [0005](docs/adr/0005-keep-unsafe-inline-script-src.md)
- [0007](docs/adr/0007-license-split.md)
- [0008](docs/adr/0008-automation-and-branch-protection.md)

## Browser checks

- `npm run test:e2e`: run Playwright checks in Chromium.
- Install Chromium first with `npx playwright install --with-deps chromium`.

CI runs browser checks after lint, type checking and unit tests, and uploads the Playwright report.
