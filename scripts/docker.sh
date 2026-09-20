#!/usr/bin/env bash
# Dispat owns the sequence; Docker owns all build, test, and npm publish tools.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"
operation=${1:?Expected version, build, tests, verify-artifact, publish, or released}
image=crier-npm-tools:24.18.0

buildx() {
  # The shared Dispat helper deliberately emits separate cache arguments.
  # shellcheck disable=SC2046
  docker buildx build --file Dockerfile $(sh scripts/buildx-cache.sh "crier-npm-${1}") "${@:2}" .
}
tools_image() {
  buildx tools --target tools --load --tag "$image"
}
container() {
  local args=(--rm --volume "$root:/workspace" --workdir /workspace)
  if [ "$operation" != version ]; then
    args+=(--volume "$root/.release/build:/workspace/build:ro"
      --volume "$root/.release/dist:/workspace/dist:ro"
      --volume "$root/.release/release.json:/workspace/release.json:ro")
  fi
  args+=(--env DISPAT_NEW_VERSION --env DISPAT_CHANNEL)
  # Credentials are forwarded only to the runtime publication, never a build.
  if [ "$operation" = publish ]; then
    args+=(--env NODE_AUTH_TOKEN --env NPM_TOKEN
      --env ACTIONS_ID_TOKEN_REQUEST_URL --env ACTIONS_ID_TOKEN_REQUEST_TOKEN
      --env GITHUB_ACTIONS --env GITHUB_EVENT_NAME --env GITHUB_REPOSITORY --env GITHUB_REPOSITORY_ID
      --env GITHUB_REPOSITORY_OWNER_ID --env GITHUB_REF --env GITHUB_SHA
      --env GITHUB_WORKFLOW_REF --env GITHUB_WORKFLOW_SHA --env GITHUB_RUN_ID
      --env GITHUB_RUN_ATTEMPT --env GITHUB_SERVER_URL --env GITHUB_API_URL
      --env RUNNER_ENVIRONMENT --env CI)
    if [ -n "${NPM_CONFIG_USERCONFIG:-}" ]; then
      args+=(--volume "$NPM_CONFIG_USERCONFIG:/npmrc:ro" --env NPM_CONFIG_USERCONFIG=/npmrc)
    fi
  fi
  if [ "$operation" = released ] && [ -n "${GITHUB_OUTPUT:-}" ]; then
    args+=(--volume "$GITHUB_OUTPUT:/github-output" --env GITHUB_OUTPUT=/github-output)
  fi
  docker run "${args[@]}" "$image" "$@"
}

case "$operation" in
  version)
    tools_image
    container sh -ec 'node scripts/version.mjs; pnpm install --lockfile-only --ignore-scripts'
    ;;
  build)
    # Invalidate any prior test approval before exporting a fresh package.
    rm -rf .release
    buildx build --target export --build-arg "CRIER_BINARY_VERSION=${CRIER_BINARY_VERSION:-1.1.1}" \
      --output type=local,dest=.release
    ;;
  tests)
    test -f .release/dist/artifact.json
    rm -f .release/tested.json
    for version in 20.17.0 22.9.0 24.18.0; do
      buildx "tests-$version" --target test-export --build-arg "NODE_VERSION=$version" \
        --build-context artifact=.release --output "type=local,dest=coverage/node-$version"
    done
    tools_image
    container node scripts/artifact-gate.mjs approve
    ;;
  verify-artifact|publish)
    tools_image
    container node scripts/artifact-gate.mjs "$operation"
    ;;
  released)
    tools_image
    container node scripts/released.mjs
    ;;
  *) echo "Unknown Docker operation: $operation" >&2; exit 2 ;;
esac
