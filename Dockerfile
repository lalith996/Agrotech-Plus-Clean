FROM node:20-alpine AS base
RUN npm i -g pnpm
RUN apk add --no-cache openssl

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Install ALL dependencies including devDependencies (which includes next) for the build step.
# Use standard pnpm install to resolve mismatching next versions and avoid verifying-deps bypass errors
RUN pnpm install --ignore-scripts
COPY prisma ./prisma
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Add heavy deps directly to build container to fix sharp/elasticsearch module errors
# Workaround without saving to package.json since pnpm add --no-save is not supported, we just add them normally.
RUN pnpm add @elastic/elasticsearch sharp stripe --ignore-scripts
# Running pnpm add deletes the generated prisma types. Regenerate.
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
