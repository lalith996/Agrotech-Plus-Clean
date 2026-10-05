FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN pnpm install --ignore-scripts
COPY prisma ./prisma
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
