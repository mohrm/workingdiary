FROM nginx:1.27.4-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
