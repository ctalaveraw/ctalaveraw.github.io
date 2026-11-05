# Development

This repository contains an Astro static site deployed through GitHub Pages.

Local development uses Docker Compose and a pinned Node.js image. Node.js
does not need to be installed on the host.

The website does not require a backend.

## Prerequisites

- Git
- Docker Engine
- Docker Compose V2

The container image is specified in `compose.yaml`. Dependencies are
resolved from `package-lock.json`.

## Local development

From the repository root, set the container user.

For rootful Docker:

    export RUN_AS="$(id -u):$(id -g)"

For rootless Docker, the current configuration uses:

    export RUN_AS="0:0"

Check the configuration:

    docker compose config --quiet

Install dependencies:

    docker compose run --rm --no-deps portfolio npm ci

Start the development server:

    docker compose up

Open http://localhost:4321/.

Stop the server with Ctrl+C.

## Build and validation

Build the static site:

    docker compose run --rm --no-deps portfolio npm run build

Expected output:

- `dist/index.html`
- `dist/404.html`

Check npm dependencies:

    docker compose run --rm --no-deps portfolio \
      npm audit --audit-level=high

Check the lockfile-based installation and build together:

    docker compose run --rm --no-deps portfolio \
      sh -ec 'npm ci && npm run build && npm audit --audit-level=high'

The generated `dist/` directory is excluded from Git.

## Verification

Run the full local verification:

    docker compose run --rm --no-deps portfolio \
      sh -ec 'npm ci && npm run verify'

The runner is `scripts/verify.sh`.

It checks formatting, ESLint rules, Astro diagnostics, the
production build, generated output, and npm advisories.

The generated-site assertions are maintained in
`scripts/check-build.mjs`.

GitHub Actions runs the same verification on pull requests
and pushes to main. Successful PR checks also publish a
short-lived build artifact for inspection.

Use `npm run format` to apply formatting changes. Review the
diff before committing.

Browser behavior, keyboard interaction, mobile layout, and
external link availability still require separate validation.

## Dependency updates

Make dependency changes deliberately and commit the resulting
`package.json` and `package-lock.json` together.

After updating dependencies, run the clean installation, build, and
audit checks above.

Avoid `npm audit fix --force` without reviewing the breaking changes.

The npm audit covers the resolved npm dependency tree. It is not a
container image scan or a security assessment of the deployed website.

## Setup history

Recorded November 3, 2026.

### Repository setup

- Initialized `ctalaveraw/ctalaveraw.github.io`.
- Added README, MIT license and Git exclusions through PR #2.
- Confirmed the `protect-main` ruleset requires pull requests.
- Opened Issue #3 for the Astro portfolio implementation.

### Template import

Frontend source:

https://github.com/HoPHNiDev/hophni.dev

Original author: Shohjaxon Xamrayev.
License: MIT.
Imported upstream revision:

    e386d16636fb19091e880d5cdd633b390848431d

The original license and attribution must be retained. Original
personal details, domain configuration and unrelated artwork must
be removed before publication.

### Node.js compatibility

The initial build failed with host Node.js 18.19.1 because it did
not meet the imported Astro version's runtime requirements.

A Node.js 22 container was used instead.

Verified container runtime:

- Node.js 22.23.4
- npm 10.9.9

The original Astro 5 site built successfully in that environment.

### Docker Compose

Docker Engine 29.1.3 was installed without Compose V2.

The first attempt installed the legacy Python `docker-compose`
package (1.29.2). The correct Ubuntu package,
`docker-compose-v2`, was then installed.

Verified version: Docker Compose V2 2.40.3.

The legacy package was subsequently removed.

The Compose configuration specifies a container UID/GID to avoid
unintended root-owned files in the working tree.

### Local Docker identity

The Compose service uses RUN_AS to avoid root-owned build artifacts
in the working tree.

On the current rootful Docker host, `.env` contains the local UID/GID:

    RUN_AS=<host UID>:<host GID>

Generate or refresh it with:

    printf 'RUN_AS=%s:%s\n' "$(id -u)" "$(id -g)" > .env
    chmod 600 .env

The `.env` file is Git-ignored and must not be committed.

Regenerate it when moving the repository to a different machine
or changing Docker's user namespace configuration.

### Astro migration

The imported template used Astro 5.

The site was upgraded to Astro 7.4.5. Content collections were
migrated from `src/content/config.ts` to
`src/content.config.ts`, using Astro's loader-based API.

The updated site passed a production build.

The canonical site URL was changed to:

https://ctalaveraw.github.io/

The original custom-domain CNAME was removed.

### Dependency audit

The imported dependency tree initially reported:

| Stage                 | Findings                       |
| --------------------- | ------------------------------ |
| Original template     | 17: 1 critical, 15 high, 1 low |
| After Astro 7 upgrade | 2 high                         |
| After `npm audit fix` | 0                              |

The two remaining findings after the Astro upgrade concerned
Rollup and Vite. Compatible dependency fixes were available.

The final clean `npm ci`, Astro build and npm audit all passed.

These results describe the dependency versions installed at that
checkpoint. They are not a guarantee about future advisories.

## Troubleshooting

### Astro reports an existing development server after restart

Astro 7 stores development-server state in `.astro/dev.json`.
With a bind-mounted working tree, this file can survive container
recreation and contain a stale process ID.

The first development server started successfully, but later
starts failed because Astro reported an existing server.

The immediate fix was to stop the Compose service and remove
the generated lock file.

The Compose development command now uses `--ignore-lock`.
Docker Compose manages the service lifecycle, so the additional
Astro process lock is unnecessary for this setup.

Do not use Astro's `--force` or `stop` commands to clear an
unverified stale PID. A documented Astro 7 issue can cause
these commands to signal an unrelated process.

Reference:
https://github.com/withastro/astro/issues/18343

### Compose command not found

Verify `docker compose version`. Ubuntu 24.04 provides the
`docker-compose-v2` package.

The legacy `docker-compose` command is not interchangeable with
the V2 plugin for this project.

### RUN_AS is missing

Set `RUN_AS` in the current terminal before running Compose.

### Permission errors

Check file ownership and the configured container UID/GID.
Do not use recursive ownership changes as a default workaround.

### Build fails after a dependency update

Inspect the dependency diff and lockfile, then rerun:

    npm ci
    npm run build
    npm audit --audit-level=high

Run those commands in the configured container.

### Development server shutdown

The original Compose command launched Astro through npm.

When Compose stopped the container, npm reported SIGTERM as a
failed command and the container exited with status 1.

The development command now executes the Astro CLI directly
after dependency installation. This gives Astro direct signal
handling without the additional npm process.

Compose is responsible for starting and stopping the server.

## Release checks

Before the first deployment:

- Remove original template personal information and unused assets.
- Review public project descriptions and source links.
- Test all themes, the terminal and mobile layout.
- Check keyboard navigation and reduced-motion behavior.
- Pass a clean build and dependency audit.
- Verify license attribution.
- Add pull-request CI and GitHub Pages deployment.
- Check the published website before linking it from the GitHub profile.

The publication pipeline and browser checks are not yet complete.

## Shell script validation

The development container is built from `Dockerfile.dev`.
It extends the pinned Node.js 22 image with ShellCheck.

Shell validation is implemented in `scripts/check-shell.sh`.
It discovers `.sh` files under `scripts/` and runs:

- `bash -n` for syntax validation
- ShellCheck, including style-level diagnostics

The main verification runner calls this script before the
application checks.

Local development and GitHub Actions build the same development
image and invoke `npm run verify`.

Rebuild the development image after changing `Dockerfile.dev`:

    docker compose build portfolio

The development image is not published or used to host the site.
GitHub Pages serves the generated static files.
