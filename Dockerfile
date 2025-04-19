FROM nginx:1.27.5-alpine
COPY dist/workingdiary/browser /usr/share/nginx/html
