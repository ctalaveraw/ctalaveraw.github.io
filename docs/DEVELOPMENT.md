# Development and operations

This guide describes how to develop, verify, and publish
[ctalaveraw.github.io](https://ctalaveraw.github.io/). The repository builds
a static Astro site: GitHub Pages serves the output, and no server process
runs for site visitors.

For an overview of the projects on the site, see the [README](../README.md).

## Requirements and toolchain

Local development uses **Git, Docker Engine, and Docker Compose V2**. The
container supplies Node.js, npm, and ShellCheck; no host Node installation is
needed.

- `Dockerfile.dev` extends a digest-pinned Node.js 22 Bookworm Slim image
  with ShellCheck from Debian packages.
- `compose.yaml` bind-mounts the repository at `/workspace`, runs processes
  as the configured user, and binds the development server to
  `127.0.0.1:4321` on the host.
- `package-lock.json` fixes the npm dependency tree for `npm ci`.
- `dist/`, `.astro/`, `node_modules/`, and `.env` are ignored by Git.
- `.dockerignore` limits the development image build context to the
  Dockerfile; source files enter the container through the Compose volume.

The Docker image is a **development/build environment**, not the production
hosting runtime. Its ShellCheck package is installed when the image is built,
so rebuilding it can update that package independently of the pinned Node
base image.

### Configure the local user

The Compose service requires `RUN_AS` in `UID:GID` form. This avoids
creating root-owned files in the bind-mounted working tree on a rootful
Docker host.

From the repository root:

```sh
printf 'RUN_AS=%s:%s\n' "$(id -u)" "$(id -g)" >| .env
chmod 600 .env
docker compose config --quiet
```

Compose loads `.env` automatically from the project directory.
`.env.example` documents the setting; its numeric value is a placeholder,
**not** a portable default. Regenerate `.env` when working under a different
host account or on another machine. Never commit it.

These instructions are validated for rootful Docker. Rootless Docker has
different UID mappings; do not assume that the same `RUN_AS` value works
there. Verify the effective container identity and write permissions
before using the project with a rootless daemon.

## Start and stop the site

```sh
docker compose build portfolio
docker compose up
```

Browse to <http://localhost:4321/>. The service runs `npm ci` before
starting Astro; `npm ci` also runs explicitly as part of verification.

Stop with Ctrl+C. For a detached service, use `docker compose down`.

The Compose command executes the Astro CLI directly and passes
`--ignore-lock`. This avoids stale Astro development-server lock records
on a bind-mounted checkout and lets Compose control the process lifecycle.

To preview the generated site without the Compose development command,
run `npm run preview` in a Node environment after `npm run build`.
The standard Compose service is configured for development, not preview.

## Repository layout

Content and application code:

- `src/content.config.ts` — collection loaders and schemas
- `src/content/hero/` — introduction, project history, and technology groups
- `src/content/projects/` — project cards and links
- `src/content/lab-notes/` — dated investigations and evidence links
- `src/content/experience/` — experience timeline and highlights
- `src/content/contacts/` — contact and source links
- `src/pages/` — home, lab-notes index, and 404 routes
- `src/layouts/BaseLayout.astro` — metadata and theme restoration
- `src/components/` — navigation, cards, console, theme picker, footer
- `src/data/platformArchitecture.ts` — documented platform paths used by the architecture view and console
- `src/data/credentials.ts` — certification names and education status
- `src/data/terminalHelp.ts` — console help metadata and command-column formatting
- `src/styles/` — Tailwind tokens, palettes, global styles

Automation and deployment:

- `scripts/verify.sh` — ordered verification gates and CI summary
- `scripts/check-shell.sh` — Bash syntax and ShellCheck
- `scripts/check-build.mjs` — generated-page assertions
- `.github/workflows/validate.yml` — pull-request and main validation
- `.github/workflows/pages.yml` — verified GitHub Pages deployment

### Editing site content

Markdown files in `src/content/` have YAML frontmatter validated by
`src/content.config.ts`. Add or modify a file in the appropriate collection.
Projects, lab notes and experience entries use a numeric `order` field to
control display order. Project links must be valid URLs. Project cards use
`linkLabel` (`View repository` or `View merged PR`) to describe the linked
evidence.

Lab notes use a separate `labNotes` collection. Each Markdown file needs a
title, summary, ISO date, status (`verified`, `investigated` or `planned`),
technology areas, order and at least one public evidence URL. The Markdown
body contains the methods, observations and outstanding work. The homepage
shows a preview; `/lab-notes/` renders the full entries.

The status refers only to the recorded investigation. `Verified` requires
actual recorded checks and does not imply the platform is healthy today.
`Investigated` means the observations are documented but the cause or
recovery remains unsettled. `Planned` is for future work and must not be
presented as completed. Link to public upstream records or source commits.
Do not link private repositories, post internal addresses or copy firmware
images, credentials, employer information or device identifiers.

The hero and project cards are loaded from these collections. Current AWS work and
prior consulting appear as separately ordered experience entries. The hero
supports extra paragraphs in its `aboutMore` list. Credential names and the
degree statuses are maintained in `src/data/credentials.ts`. Experience entries
retain dates in their source frontmatter for recordkeeping; the visible page
and console emphasize `workType` and responsibilities.
The architecture view and the console's `pipeline` command share
`src/data/platformArchitecture.ts`, which documents separate GHCR,
Flux, and Forgejo paths, their recorded checks, and their authority boundaries.
Compare that data with the platform's public architecture notes when it changes. Other console commands and
some URLs are still authored in `src/components/HiddenTerminal.astro`.
The Test records links in `src/pages/index.astro` are also explicit.

The console is browser-only: it does not execute shell commands, run
`kubectl`, call GitHub's API, or contact a real cluster. The architecture
section describes recorded checks, not current service health.

### Reviewing public copy

Write the action or observation first. Cut abstract claims that need a
whole paragraph to explain. Read the About section and project descriptions
aloud: repetitive three-part lists and constructions such as "not X, but Y"
make technical experience sound rehearsed. Check whether a term is necessary
for accuracy before removing it. The public text should reflect work actually
performed.

Use implementation names and observed behavior instead of claims such as
"reliable" or "production-ready" without supporting tests. Do not imply
that recorded telemetry proves the current monitoring stack is healthy.
Separate completed checks from recovery work that remains open. Prose-pattern
linters such as SlopMonster can identify formulaic phrasing, but a clean
score does not establish factual accuracy; compare claims with upstream PRs
and the platform evidence ledger.

### Editing themes

`src/styles/themes.css` contains 13 named presets.
`src/components/ThemePicker.astro` implements the picker and editor.
`src/layouts/BaseLayout.astro` restores saved preferences on page load.

The footer displays the active theme by observing `data-theme` on the root
HTML element. The theme selector remains the owner of theme changes and
persisted color settings; the footer only reads the selected name. The
`^K console` footer button opens the same read-only console as the header.

Preferences use browser `localStorage` keys `portfolio-theme` and
`portfolio-custom-colors`. Custom values are limited to the defined CSS
color tokens. Changes are local to a visitor's browser; the site does not
store or synchronize them remotely.

## Verification

Build the development image after changes to `Dockerfile.dev`, then run
the full verification sequence:

```sh
docker compose build portfolio
docker compose run --rm --no-deps portfolio \
  sh -ec 'npm ci && npm run verify'
```

`scripts/verify.sh` runs these gates in order:

1. Bash syntax and ShellCheck for `scripts/**/*.sh`
2. Prettier formatting
3. ESLint
4. Astro diagnostics (`astro check`)
5. Astro static production build (`dist/`)
6. Static output assertions (`scripts/check-build.mjs`)
7. npm advisory audit (`npm audit --audit-level=high`)

The runner stops at the first failure and writes a summary to
`GITHUB_STEP_SUMMARY` when run in GitHub Actions. Output tests cover
the homepage, lab-notes index, source links, 404 page, favicon, project
links, and selected template content that must not reappear. **They do not replace browser or
accessibility testing.**

Apply formatting deliberately:

```sh
docker compose run --rm --no-deps portfolio npm run format
git diff --check
git diff
```

The audit fails on high and critical findings. Moderate findings are
reported but do not fail this gate. To assess only production npm
dependencies:

```sh
docker compose run --rm --no-deps portfolio \
  npm audit --omit=dev --audit-level=moderate
```

An npm audit covers the lockfile's npm packages, not OS packages in the
development container, CDN-hosted fonts, or browser behavior. Do not
describe a passing high-severity audit as zero vulnerabilities unless the
complete audit output actually shows zero.

### Automated browser checks

Playwright tests the generated static site in Chromium. The tests are in
`tests/e2e/`; `playwright.config.ts` starts an Astro preview server
inside the browser container. The Playwright package and browser image both
use version 1.65.1.

On a rootful Docker host, configure `.env` and run:

```sh
bash scripts/test-browser.sh
```

The runner builds `dist/` using the Node 22 development image, then runs
Playwright in the browser image. It leaves existing development services
alone. GitHub Actions runs the same command in the separate `browser` job.

Tests cover tab close/restore, console commands and focus restoration,
theme persistence, architecture keyboard expansion, lab-note navigation,
reduced-motion interaction, and narrow-viewport overflow. Failure traces, screenshots,
and the HTML report are written to `test-results/` and
`playwright-report/`; Git ignores both.

Manual review still covers text contrast across all palettes, external
URLs, screen-reader behavior, and rendering in Firefox and WebKit. The
initial automated suite uses Chromium.

## Pull requests and publishing

The repository uses feature branches and a protected `main`. The
`protect-main` ruleset requires a pull request and the `verify` check.

Both workflows use Node.js 24-based GitHub Actions: `checkout@v7`,
`upload-artifact@v7`, `upload-pages-artifact@v5`, and `deploy-pages@v5`.
The action runtime is separate from the Node.js 22 container used to
build and validate the site.

**Portfolio CI** (`.github/workflows/validate.yml`) runs on pull requests
and pushes to `main`. It runs separate `verify` and `browser` jobs.
The `verify` job creates `.env` from the runner's UID/GID,
builds the development image, runs `npm ci && npm run verify` in Compose,
and uploads `dist/` as a short-lived build artifact.

**Publish portfolio** (`.github/workflows/pages.yml`) runs after a push
to `main`. Its build job executes the same verification first. If that
passes, it uploads `dist/` with the Pages artifact action; a separate
deployment job publishes it using the `github-pages` environment and
`pages: write` / `id-token: write` permissions.

Pages must be configured to use **GitHub Actions** as the build source.
Keep deployment environment restrictions on `main`. No production
server credentials are needed to publish the site.

After merging, check both workflows in the
[Actions tab](https://github.com/ctalaveraw/ctalaveraw.github.io/actions)
and verify <https://ctalaveraw.github.io/> in a browser. A successful
build job without a successful deploy job does not prove publication.
The GitHub profile links to this public URL.

## Dependency maintenance

For planned updates, work on a feature branch and use the development
container. Edit `package.json` using npm commands, commit the matching
`package-lock.json`, and rerun the full verification sequence.

Dependabot dependency PRs must also pass `verify`. The audit database can
change even without a source change, so an unrelated-looking build failure
may be an advisory update. Inspect `npm audit` and distinguish development
dependencies from production dependencies before choosing a remedy.

Avoid `npm audit fix --force` without reviewing the proposed major-version
changes and retesting Astro, linting, and deployment. Do not suppress an
audit gate solely to get Pages green.

## Troubleshooting

### Compose reports RUN_AS is missing

Create or refresh `.env` using the command in
[Configure the local user](#configure-the-local-user), then run
`docker compose config --quiet`.

### Files become owned by root

Check `RUN_AS` and container identity before changing ownership.
For rootful Docker, the UID/GID should match the host account. Avoid
recursive `chown` as a first response.

### Compose warns that Buildx is missing

Compose can fall back to a builder, depending on the local Docker setup.
Check whether `docker compose build portfolio` actually completed.
A warning alone is not a build failure.

### Astro reports an existing development server

First stop the Compose service:

```sh
docker compose down
```

The dev command already includes `--ignore-lock`. If an old lock file
must be cleared, inspect and remove `.astro/dev.json` only after the
service is stopped. Do not signal an unverified PID.

### Shutdown logs show SIGTERM as an npm error

The earlier Compose command launched the dev server via `npm run dev`.
The current command uses `exec ./node_modules/.bin/astro` directly,
so npm no longer sits between the container and the dev-server process.

### Verification fails at the dependency audit

Read the advisory names and affected dependency paths. A clean
production build can still fail the audit gate. Re-run the audit on the
same lockfile, compare with `--omit=dev`, and remediate on a branch.
Do not treat the failed Pages job as a rendering error.

### GitHub Pages did not update

Inspect the latest **Publish portfolio** run. Verify that the build,
Pages artifact upload, and deploy jobs succeeded. Check the Pages
source configuration and the deployment environment. The site uses
the root-domain URL in `astro.config.mjs`, not a repository subpath.

## Boundaries and attribution

Publish only information intended to be public. Do not commit private
addresses, infrastructure endpoints, credentials, or employer/customer
material. The portfolio content distinguishes professional production
work from independent lab work.

The frontend was adapted from
[HoPHNi.dev](https://github.com/HoPHNiDev/hophni.dev), by
Shohjaxon Xamrayev, under the MIT license. The imported revision was
`e386d16636fb19091e880d5cdd633b390848431d`. Preserve the
original notice in [LICENSE](../LICENSE) and the attribution in the
README and site footer.

The site loads fonts from Google-hosted stylesheets; it does not need
a backend. If offline operation or external-request minimization
becomes a requirement, revisit those font dependencies.
