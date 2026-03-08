FROM node:24-bookworm-slim

ARG PLAYWRIGHT_VERSION

ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Playwright dependencies and Chromium once during image build.
RUN test -n "$PLAYWRIGHT_VERSION" \
  && npx --yes playwright@"$PLAYWRIGHT_VERSION" install --with-deps chromium \
  && npx --yes playwright@"$PLAYWRIGHT_VERSION" --version

WORKDIR /workspace
