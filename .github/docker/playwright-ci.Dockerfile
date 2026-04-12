ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim
ARG PLAYWRIGHT_VERSION
WORKDIR /workspace

ENV DEBIAN_FRONTEND=noninteractive
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  \
  # Playwright + Dependencies installieren
  && test -n "$PLAYWRIGHT_VERSION" \
  && npx --yes playwright@"$PLAYWRIGHT_VERSION" install --with-deps chromium \
  \
  # npm cache leeren
  && npm cache clean --force \
  \
  # apt cleanup (Playwright installiert viele Pakete)
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
