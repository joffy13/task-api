FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

COPY . .

CMD ["pnpm", "dev"]
