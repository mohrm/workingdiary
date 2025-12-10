FROM nginx:1.29.4-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
