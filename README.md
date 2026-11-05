# Engineering Portfolio

Source for the personal engineering portfolio of Christian Talavera.

**Planned site:** https://ctalaveraw.github.io/
**GitHub profile:** https://github.com/ctalaveraw

## About

A static, interactive portfolio covering cloud infrastructure,
platform engineering, Linux, networking, automation, and
open-source contributions.

The focus is on engineering evidence: implemented systems,
technical decisions, verification, failures, and recovery.

## Technical approach

- Astro with Tailwind CSS
- GitHub Pages for static hosting
- GitHub Actions for validation and publication
- Markdown-driven project and experience content
- IDE-inspired navigation and a simulated terminal
- Selectable color themes

The frontend will be adapted from the MIT-licensed HoPHNi
portfolio template.

## Local container configuration

Docker Compose uses a local `.env` file for the container UID/GID.
Generate it on a rootful Docker host with:

    printf 'RUN_AS=%s:%s\n' "$(id -u)" "$(id -g)" > .env
    chmod 600 .env

See `.env.example` and `docs/DEVELOPMENT.md` for details.

## Development

Once the Astro source is imported, local development will use:

    npm ci
    npm run dev

Production validation:

    npm run build
    npm run preview

Generated output belongs in dist/ and is not committed.

## Delivery

Changes are developed on feature branches and reviewed through
pull requests. The intended publishing path is:

    source -> pull request -> validation -> main -> GitHub Pages

GitHub Pages deployment will be configured after the initial
Astro build is validated.

## Engineering boundaries

- The terminal is a browser simulation, not a remote shell.
- No backend or live homelab access is required.
- Independent engineering projects are distinguished from
  professional production experience.
- Project claims should link to source, tests, PRs, or evidence.
- No private infrastructure details, credentials, or employer-
  confidential information belong in the repository.

## Maintenance

Project and experience content should be editable without
changing application code. Dependencies are lockfile-managed.
Avoid unnecessary services, dynamic data sources, and automation.

## Attribution and license

Frontend foundation: [HoPHNi.dev](https://github.com/HoPHNiDev/hophni.dev)
by Shohjaxon Xamrayev, MIT licensed.

Original copyright and permission notice are retained in LICENSE.
See the source template for its original design and implementation.

Later changes and site content are maintained by Christian Talavera.
The portfolio does not claim that the original frontend was
designed or written from scratch.

## Status

Repository foundation in progress. Site not yet deployed.
