#!/usr/bin/env bash
# Run on all six native targets with the same reviewed tarball. No registry writes.
set -euo pipefail
if [ "$#" != 1 ]; then echo 'Expected exactly one npm tarball' >&2; exit 1; fi
tarball=$(node -p 'require("node:path").resolve(process.argv[1])' "$1")
expected=${CRIER_BINARY_VERSION:?CRIER_BINARY_VERSION is required}
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

check_version() {
  "$@" --version | awk -v expected="$expected" '
    $1 == "crier" && $2 == expected { found=1 }
    END { exit found ? 0 : 1 }
  '
}

# Global script-blocked installation must fail clearly and be repairable.
prefix="$work/global prefix"
npm install --global --prefix "$prefix" --ignore-scripts "$tarball"
installed=$(npm root --global --prefix "$prefix")
installed="$installed/@dispat/crier"
if node "$installed/build/bin/crier.js" --version > "$work/output" 2> "$work/error"; then
  echo 'A script-blocked installation unexpectedly had a binary' >&2
  exit 1
fi
grep -F 'install script may have been blocked' "$work/error"
node "$installed/build/bin/postinstall.js"
if [ "${RUNNER_OS:-}" = Windows ]; then command="$prefix/crier"; else command="$prefix/bin/crier"; fi
check_version "$command"
"$command" --help
status=0
"$command" self-update || status=$?
test "$status" = 2

# The pnpm consumer uses the CLI from its own node_modules/.bin.
consumer="$work/pnpm consumer"
mkdir -p "$consumer"
cd "$consumer"
node -e 'require("node:fs").writeFileSync("package.json", JSON.stringify({name:"crier-install-check",private:true,packageManager:"pnpm@10.34.1"}))'
pnpm add --ignore-scripts "$tarball"
node node_modules/@dispat/crier/build/bin/postinstall.js
check_version pnpm exec crier
printf 'Install checks passed: %s / native %s\n' "${RUNNER_OS:-local}" "$expected"
