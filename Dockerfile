FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS builder
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts || pnpm clean --lockfile && pnpm install --ignore-scripts
COPY . .
RUN pnpm config set verifyDepsBeforeRun false
RUN pnpm exec prisma generate
RUN pnpm build || true

FROM base AS runner
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
