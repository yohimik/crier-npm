# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.18.0
FROM node:${NODE_VERSION}-bookworm-slim AS tools
ARG NODE_VERSION
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    pnpm_config_verify_deps_before_run=false
RUN npm install --global --ignore-scripts pnpm@10.34.1 \
 && if [ "$NODE_VERSION" = 24.18.0 ]; then npm install --global --ignore-scripts npm@12.0.1; fi
WORKDIR /workspace

FROM tools AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --ignore-scripts --store-dir /pnpm-store

FROM dependencies AS source
COPY . .

FROM source AS build
ARG CRIER_BINARY_VERSION=1.1.1
RUN CRIER_BINARY_VERSION="$CRIER_BINARY_VERSION" pnpm build && pnpm run pack

FROM scratch AS export
COPY --from=build /workspace/build /build
COPY --from=build /workspace/dist /dist
COPY --from=build /workspace/release.json /release.json

# The named context is the export from this release's completed build stage.
# Run every test against those compiled files and install that exact tarball.
FROM source AS tests
COPY --from=artifact /build /workspace/build
COPY --from=artifact /dist /workspace/dist
COPY --from=artifact /release.json /workspace/release.json
RUN pnpm run test:compiled \
 && pnpm run test:artifact \
 && CRIER_BINARY_VERSION="$(node -p 'require("./release.json").version')" bash scripts/check-install.sh dist/*.tgz

FROM scratch AS test-export
COPY --from=tests /workspace/coverage /coverage
