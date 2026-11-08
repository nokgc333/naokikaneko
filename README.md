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
