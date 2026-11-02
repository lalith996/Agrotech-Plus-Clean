FROM node:20-alpine AS builder
# Install necessary packages for building native dependencies
RUN apk add --no-cache libc6-compat python3 make g++ openssl

WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm config set verifyDepsBeforeRun false
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm clean --lockfile && pnpm install --ignore-scripts

COPY . .

RUN npx prisma generate

RUN pnpm build

FROM node:20-alpine AS runner

# Install openssl for prisma
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
