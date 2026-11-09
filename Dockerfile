FROM nginx:1.31.8-alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11

COPY dist/ /usr/share/nginx/html
COPY package.json /tmp/package.json
COPY nginx.default.conf.template /tmp/default.conf.template

RUN APP_VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n1) \
    && test -n "$APP_VERSION" \
    && sed "s/__APP_VERSION__/$APP_VERSION/g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
