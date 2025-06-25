FROM nginx:1.29.0-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
