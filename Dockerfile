FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app

RUN corepack enable pnpm && corepack prepare pnpm@10.30.3 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --ignore-scripts

COPY . .

RUN pnpm run postinstall

RUN pnpm run build

FROM base AS runner
WORKDIR /app

RUN corepack enable pnpm && corepack prepare pnpm@10.30.3 --activate

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "start"]