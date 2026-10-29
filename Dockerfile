FROM nginx:1.31.8-alpine@sha256:785835ea65db4bba6f021acc0f3be91b0fef76a53fe41f8588c6698d2aed0606

COPY dist/ /usr/share/nginx/html
COPY package.json /tmp/package.json
COPY nginx.default.conf.template /tmp/default.conf.template

RUN APP_VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n1) \
    && test -n "$APP_VERSION" \
    && sed "s/__APP_VERSION__/$APP_VERSION/g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
