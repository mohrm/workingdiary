FROM nginx:1.29.1-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
