FROM nginx:1.29.8-alpine

COPY dist/workingdiary/browser /usr/share/nginx/html
COPY package.json /tmp/package.json
COPY nginx.default.conf.template /tmp/default.conf.template

RUN APP_VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n1) \
    && test -n "$APP_VERSION" \
    && sed "s/__APP_VERSION__/$APP_VERSION/g" /tmp/default.conf.template > /etc/nginx/conf.d/default.conf
