# Checks and release preparation

## Local checks

Use pnpm `10.34.1`, pinned by package.json. The release driver is the root development
dependency `@dispat/bin@1.10.3` (native Dispat 1.10.0). The project has one manifest and
one pnpm lockfile; pnpm-workspace.yaml only configures dependency-script approval.

```sh
pnpm install --frozen-lockfile
pnpm exec dispat --version
pnpm test
CRIER_BINARY_VERSION=1.1.1 pnpm build
pnpm run pack
pnpm run test:artifact
```

The test command compiles the TypeScript sources and runs every unit and local
integration test, with 95% line and branch coverage floors. Checks cover metadata,
checksums, byte limits, interrupted and concurrent downloads, atomic replacement,
HTTPS proxies/custom CAs, exact-path repair, arguments/streams/signals, and packed
artifact identity and integrity. Test registry publications target disposable local
servers, never the public npm registry. The TLS private key is a public test fixture.

`test:artifact` downloads the pinned native binary and tests the tarball with npm
and pnpm in temporary local/global installations. It includes a blocked installation
script and explicit repair, approved scripts, and npm exec. It runs on macOS/Linux
and does not change the user's ordinary global installation.

The portable `scripts/check-install.sh` checks blocked-install recovery, the global
command shim, help, native version, self-update protection, and a pnpm consumer.
CI runs it against the same tarball on six native targets.

Once the repository has reviewed commits, the development dependency can drive the
same named stages as CI:

```sh
pnpm exec dispat run tests --since all
pnpm exec dispat run build --since all
pnpm exec dispat run verify-artifact --since all
pnpm exec dispat run artifact-tests --since all
```

An empty clone has no HEAD, so Dispat cannot plan until the first commit exists.
The direct pnpm test/build commands above work before then.

## CI and release gates

`.github/workflows/ci.yml` and the manual release workflow reuse `checks.yml`:

- The full suite runs on Linux and macOS with Node 20.17.0, 22.9.0, and 24.18.0.
  Node 24 jobs explicitly install npm 12.0.1 to exercise script-approval behavior.
- A Linux job builds the pinned native-release metadata, packs a single tarball,
  verifies it, and runs the complete artifact installation checks.
- Installation jobs use that tarball on Linux x64/ARM64, macOS x64/ARM64, and
  Windows x64/ARM64. Coverage and package artifacts are retained for review.

`.github/actions/setup` installs dependencies from pnpm-lock.yaml with scripts
blocked, explicitly installs the local @dispat/bin binary, and verifies that driver.
No job builds Dispat from Go source or uses a globally installed driver.

## Prepare the first release

1. Review the initial feature commit. The intended npm version is
   `1.1.0`, wrapping native Crier `1.1.1`.
2. Confirm that the initial feature commit includes the footer `Release-As: 1.1.0`.
   Dispat reads tags/history, not the parent manifest, so this pins the intended
   first version without a synthetic baseline tag.
3. Run `pnpm release:plan` and `pnpm release:notes`. Check both the changelog and
   GitHub body, including the link to the exact npm version.
4. Run the local checks and review the packed artifact. For root-only changes to
   the manifest, README, examples, or tests, use the `crier` commit scope when the
   change should cause a release.
5. Configure npm trusted publishing for owner `yohimik`, repository `crier-npm`,
   and workflow `release.yml`. For first-publication bootstrap, the workflow can
   use repository secret `NPM_TOKEN`; omit it once trusted publishing is ready.
6. After authorization, push the reviewed revision and manually dispatch Release
   from main. Select the exact published native Crier version, default `1.1.1`.
   The npm and native versions must share their major/minor line.

The release job needs repository write access for the normal Dispat release lock,
commit, tags, and GitHub release, plus an npm trusted identity or bootstrap token
with access to the `@dispat` scope. npm publication requests provenance.

## What the release does

The read-only plan maps Dispat exit 3 to a successful skip, while planning failures
remain failures. A releasable plan gates the entire reusable suite. Only then does
the release job invoke `pnpm exec dispat release --log-format json`.

`dispat.yaml` declares one package `crier` at `src/`. Its scripts return to the
root. The version stage writes package.json and refreshes pnpm-lock.yaml with
lifecycle scripts disabled. Tests run against the rewritten version, followed by
native metadata generation and npm packing. Integrity/identity and real artifact
installation checks run again before the publish helper uploads that tarball.

The postPublish hook exports the npm version and native version to the workflow.
Dispat writes the root CHANGELOG.md, records the root manifest/lockfile with the
source, creates the `v{version}` tag, and pushes the release records. It creates a
GitHub release containing the changelog and a footer linking to
`https://www.npmjs.com/package/@dispat/crier/v/<version>`.

Post-release jobs wait for that exact version to appear in npm metadata, install it
from the registry on all six targets, and verify the native version and help.
They also run if npm publication succeeded but a later record-writing step failed.
There is no announce stage or social publication in this repository's release flow.

## Recovery

If a stage fails after versioning, inspect package.json and pnpm-lock.yaml before
retrying: they are outside the configured src/ package folder and its folder
rollback. If npm accepted the upload, reconcile its records before retrying; never
assume a failed workflow means nothing was published. Registry propagation is
checked after upload and does not cause the publish helper to retry an accepted
publication. If main moved while the suite ran, resolve any rejected record push
before another release attempt.

Build, test, and pack commands do not publish. The real Release workflow is manual,
serialized, and restricted to main. This preparation has not dispatched it.
