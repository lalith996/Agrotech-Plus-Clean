FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts

# Next.js Turbopack missing dependencies issue:
# sharp is required by next/image or ocr-service
# @elastic/elasticsearch is required by search.ts
# stripe is required by create-payment-intent.ts
RUN pnpm add sharp @elastic/elasticsearch stripe --ignore-scripts

COPY . .

# Generate prisma client manually because we ignored scripts
RUN npx prisma generate

RUN pnpm build

FROM base AS runner
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
# Remove standalone copy since it is not enabled in next.config.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["pnpm", "start"]
