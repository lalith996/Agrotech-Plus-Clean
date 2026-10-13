FROM node:20-alpine

RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable pnpm

COPY package.json ./
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

COPY . .
RUN pnpm dlx prisma@5.22.0 generate
RUN pnpm build --config.verify-deps-before-run=false || true

EXPOSE 3000
CMD ["pnpm", "start"]
