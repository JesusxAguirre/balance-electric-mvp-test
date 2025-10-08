FROM node:20-alpine3.19

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .