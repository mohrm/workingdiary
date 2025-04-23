FROM nginx:1.28.0-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
