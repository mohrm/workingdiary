ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim
ARG PLAYWRIGHT_VERSION

ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies and Chromium once during image build.
RUN test -n "$PLAYWRIGHT_VERSION" \
  && npx --yes playwright@"$PLAYWRIGHT_VERSION" install --with-deps chromium \
  && npx --yes playwright@"$PLAYWRIGHT_VERSION" --version

RUN node --version && npm --version

WORKDIR /workspace
