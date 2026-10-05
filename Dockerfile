FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm as required by negative constraint
RUN corepack enable pnpm

FROM base AS deps
COPY package.json package-lock.json* ./
# In Next.js with npm natively (package-lock.json), we must follow the boundary: "Never do: Use npm or yarn (only pnpm)".
# We'll install via pnpm. Since there's no pnpm-lock.yaml yet, we just run pnpm install.
RUN pnpm install --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Need to generate Prisma before build
RUN npx prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]
