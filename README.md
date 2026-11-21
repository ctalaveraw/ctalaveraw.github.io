# Infrastructure engineering portfolio

**[Visit the portfolio](https://ctalaveraw.github.io/)** ·
[GitHub profile](https://github.com/ctalaveraw) ·
[Development guide](docs/DEVELOPMENT.md)

The source for Christian Talavera's static engineering portfolio. It covers Linux,
AWS infrastructure support, cloud consulting, an ARM64 platform lab, and
merged OpenWrt device-support contributions.

## Featured work

- **[ARM64 platform lab](https://github.com/ctalaveraw/arm-homelab-platform)** —
  Three-node Raspberry Pi Kubernetes, GitHub-to-GHCR image delivery, Flux,
  and a separate Forgejo mirror and validation runner. The repository includes
  [implementation notes](https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/interview/engineering-evidence.md),
  [architecture](https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/architecture/overview.md),
  and a [roadmap](https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/roadmap.md).
- **[MokerLink 2G080GM](https://github.com/openwrt/openwrt/pull/25193)** —
  Merged OpenWrt board support for an RTL9303-based 8-port 2.5GbE switch.
- **[GoodTop GT-SWTXG8FM](https://github.com/openwrt/openwrt/pull/25391)** —
  Merged OpenWrt board support for an RTL9303-based 8-port SFP+ switch.

## Site

The frontend uses Astro 7, Tailwind CSS 4, and Markdown-backed content collections.
The IDE-style navigation, theme picker, architecture view, and portfolio console run in the browser.

Visitors can select one of 13 color presets or customize individual colors.
Theme preferences are stored in their browser. The console offers project, delivery-path, and contribution commands. The
architecture view separates GHCR image delivery, Flux reconciliation, Forgejo
validation, and OCI mirroring. Neither feature queries live infrastructure.

GitHub Pages serves prebuilt static files. There is no application server,
database, login, visitor tracker, or live homelab connection.

## Local development

Requirements: Git, Docker Engine, and Docker Compose V2. A host Node.js
installation is not required.

From the repository root, generate a local container identity on a rootful
Docker host:

```sh
printf 'RUN_AS=%s:%s\n' "$(id -u)" "$(id -g)" >| .env
chmod 600 .env
docker compose build portfolio
docker compose up
```

Open <http://localhost:4321/>. Stop the development server with Ctrl+C.

Run all local checks with:

```sh
docker compose run --rm --no-deps portfolio \
  sh -ec 'npm ci && npm run verify'
```

The verification runner checks ShellCheck, formatting, ESLint, Astro diagnostics,
the production build, generated pages, and npm advisories.
Run browser interaction checks with `bash scripts/test-browser.sh`. See
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the full workflow, content layout,
and troubleshooting.

## Publishing

Changes go through pull requests against protected `main`.

- [Portfolio CI](.github/workflows/validate.yml) runs `npm run verify` and
  uploads a short-lived build artifact.
- [Publish portfolio](.github/workflows/pages.yml) builds, verifies, and deploys
  `dist/` to GitHub Pages after a push to `main`.
- The `verify` status check is required by the repository's `protect-main`
  ruleset.

Do not commit `.env`, credentials, private infrastructure details, or
employer/customer-confidential data.

## Attribution

The frontend is adapted from
[HoPHNi.dev](https://github.com/HoPHNiDev/hophni.dev), originally by
Shohjaxon Xamrayev, under the MIT license. The imported template revision was
`e386d16636fb19091e880d5cdd633b390848431d`.

The original copyright and permission notice are retained in
[LICENSE](LICENSE). Subsequent modifications and portfolio content are
maintained by Christian Talavera.
