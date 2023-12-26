FROM node:21-alpine3.18

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

CMD ["node", "./bin/splitCourse.js", "/exercises/modules"]
