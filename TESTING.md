# Checks and release preparation

## Local development

Use pnpm `10.34.1`, pinned by package.json. The release driver is the development
dependency `@dispat/bin@1.10.3`. This is a single project with one root manifest,
lockfile, and CHANGELOG.md.

```sh
pnpm install --frozen-lockfile
pnpm test
CRIER_BINARY_VERSION=1.1.1 pnpm build
pnpm run pack
pnpm run test:artifact
```

These commands use the local Node installation and write `dist/`. They do not
publish. The release flow uses the Docker commands below and `.release/` instead.

## Docker build and complete suite

With Docker and Buildx available, run the same package stages used by CI:

```sh
pnpm exec dispat run build --since all
pnpm exec dispat run tests --since all
pnpm exec dispat run verify-artifact --since all
```

The build exports compiled code, native metadata, and the npm tarball to
`.release/`. The test stage consumes those exact compiled files and that tarball
through a Buildx named context, using Node 20.17.0, 22.9.0, and 24.18.0. It never
rebuilds the releasing wrapper or repacks its artifact.

Each Node version runs every unit and local integration test with 95% line and
branch coverage floors, the detailed artifact installation suite, and the portable
npm/pnpm installation check. Node 24 uses npm 12.0.1 for script approval behavior.
The suite covers checksums, byte limits, atomic and concurrent downloads, proxies,
TLS, streams/signals, argument forwarding, package identity, local registry
publication, blocked install repair, global/local installations, and npm exec.
Test registry writes use disposable local servers, never the public npm registry.
The TLS private key under test/fixtures is a public test fixture.

Tests execute on the Docker host's Linux architecture. Six native platform mappings
are covered by unit tests and release metadata validation; the container suite does
not execute macOS or Windows binaries. The conditional post-publication job checks
all six native targets using the exact published npm version. Coverage is exported to
`coverage/node-<version>/coverage/`.

Only after every runtime passes does the test stage write `.release/tested.json`.
Verification and publication compare this receipt with the package identity and
SHA-512 integrity of the current tarball. A new build removes the previous receipt.
Do not publish the separate local `dist/` tarball as a substitute.

## Release workflow

The manual Release workflow has three jobs:

1. **Is there anything to release?** A read-only Dispat plan. Exit 3 is a successful
   skip; any other planning failure fails the workflow.
2. **Run dispat, publish binaries.** The installed development dependency drives
   the release. The package flow is `version → build → postBuild: tests →
   beforePublish: verify-artifact → publish → postPublish: released`.
3. **Check published npm installation.** Run only when `npm-released=true`. Wait
   for the exact npm version, install it on Linux/macOS/Windows x64 and ARM64,
   and verify the native version and help output. The hook exports the published
   version before record-writing, so these checks also run when a later release
   commit, tag, or GitHub release step fails.

Versioning, building, testing, and npm publication run inside Docker. The complete
suite runs after the releasing package is versioned and built, within its Dispat
flow; there is no separate pre-release test job. GitHub Actions sets up the driver,
Docker Buildx and its cache, passes credentials, and retains artifacts. All shell
operations live as separate named scripts in dispat.yaml; no .sh files or shell
dispatch functions are used. Ordinary CI
runs the same build, tests, and verification without publishing.

Publication runs in a fresh runtime container using npm 12, so it cannot be skipped
by a cached Docker build. The configured npm trusted publisher authorizes GitHub's
OIDC identity. The release job forwards the OIDC environment into the container;
no long-lived npm token, token secret, or credential npmrc is used. The
`require-trusted-publishing` run.beforeAll script checks the OIDC environment before
versioning. The identity exchange happens during `npm publish`; `npm whoami` does
not verify trusted publishing. Builds and tests receive no publication credentials.
See https://docs.npmjs.com/trusted-publishers/.

Dispat writes the root changelog, commits the manifest/lockfile/changelog, pushes
the branch and `v{version}` tag, and creates a GitHub release with the generated
notes and a link to the exact npm version. No announcement job runs.

## Subsequent releases

The first release is tagged `v1.1.0`. The root package.json currently records that
version, and native Crier remains pinned to `1.1.1`.

1. Use scoped conventional commits for release-worthy changes, for example
   `fix(crier): correct installation`. Review `pnpm release:plan` and
   `pnpm release:notes`; a patch after `v1.1.0` selects `1.1.1`.
2. Run the Docker stages and review `.release/dist/`.
3. Keep the npm trusted publisher configured for owner `yohimik`, repository
   `crier-npm`, workflow filename `release.yml`, no environment name, and direct
   publishing allowed. The workflow requires `id-token: write`; no npm secret is
   needed.
4. Dispatch Release from main when publication is authorized. Dispat passes the
   computed version as DISPAT_NEW_VERSION; the Docker version stage writes it to
   the root package.json and reconciles pnpm-lock.yaml before building. The release
   commit records those files with the root changelog and the new tag.

Do not manually bump package.json or repeat the initial Release-As footer. The
native version is selected by the workflow input and must share the npm version's
major/minor line. Native and npm patch versions can differ.

## Recovery

If a stage fails after versioning, inspect package.json and pnpm-lock.yaml before
retrying: they live outside the configured src/ package folder and its rollback.
If npm accepted an upload, reconcile its records before retrying. A failure while
writing or pushing release records does not mean the npm upload failed. If main
moved while the release ran, resolve any rejected record push before another
release attempt.

Build, test, and pack commands do not publish. Release is manual, serialized, and
restricted to main. Preparing or pushing this configuration does not dispatch it.
