FROM nginx:1.31.9-alpine@sha256:90b6bd2aec278b16b98221d64deb1d6d35d164567f507ab0716e6053878315aa

COPY dist/ /usr/share/nginx/html
COPY package.json /tmp/package.json
COPY nginx.default.conf.template /tmp/default.conf.template

RUN APP_VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n1) \
    && test -n "$APP_VERSION" \
    && sed "s/__APP_VERSION__/$APP_VERSION/g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
