FROM nginx:1.31.8-alpine@sha256:fed7e14be83cbd2661a75cdc5b872d936cf155d46c327084d30b8df19ae88d72

COPY dist/ /usr/share/nginx/html
COPY package.json /tmp/package.json
COPY nginx.default.conf.template /tmp/default.conf.template

RUN APP_VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n1) \
    && test -n "$APP_VERSION" \
    && sed "s/__APP_VERSION__/$APP_VERSION/g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
