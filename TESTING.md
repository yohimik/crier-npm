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
Docker Buildx and its cache, passes credentials, and retains artifacts. Ordinary CI
runs the same build, tests, and verification without publishing.

Publication runs in a fresh runtime container using npm 12, so it cannot be skipped
by a cached Docker build. The optional first-publication npmrc is mounted read-only.
GitHub's OIDC environment is forwarded for trusted publishing and provenance.
Credentials are not passed to build/test containers or recorded in image layers.

Dispat writes the root changelog, commits the manifest/lockfile/changelog, pushes
the branch and `v{version}` tag, and creates a GitHub release with the generated
notes and a link to the exact npm version. No announcement job runs.

## First release

The initial feature commit includes `Release-As: 1.1.0`; native Crier is pinned to
`1.1.1`. Before authorizing publication:

1. Review `pnpm release:plan` and `pnpm release:notes` for npm version `1.1.0`, the
   changelog, and GitHub body with its npm link.
2. Run the Docker stages and review `.release/dist/`.
3. Configure npm trusted publishing for `yohimik/crier-npm`, workflow `release.yml`.
   First-publication bootstrap can use repository secret `NPM_TOKEN` with access
   to the `@dispat` scope. Repository rules must permit Dispat's release writes.
4. Manually dispatch Release from main only when publication is authorized.
   Select the exact native Crier version; npm and native versions share a
   major/minor line, though their patches may differ.

Use the `crier` commit scope for release-worthy root-only changes. Dispat derives
versions from Git history and tags, not the parent manifest.

## Recovery

If a stage fails after versioning, inspect package.json and pnpm-lock.yaml before
retrying: they live outside the configured src/ package folder and its rollback.
If npm accepted an upload, reconcile its records before retrying. A failure while
writing or pushing release records does not mean the npm upload failed. If main
moved while the release ran, resolve any rejected record push before another
release attempt.

Build, test, and pack commands do not publish. Release is manual, serialized, and
restricted to main. Preparing or pushing this configuration does not dispatch it.
