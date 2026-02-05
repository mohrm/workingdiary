FROM nginx:1.29.5-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
