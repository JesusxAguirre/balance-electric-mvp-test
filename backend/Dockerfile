FROM node:20-alpine3.19

WORKDIR /usr/src/app

# Install pnpm and postgresql-client (for pg_isready)
RUN npm install -g pnpm && \
    apk add --no-cache postgresql-client

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "run", "start:dev"]