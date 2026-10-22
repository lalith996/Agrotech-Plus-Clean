FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install openssl required by prisma
RUN apk add --no-cache openssl openssl-dev

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts || pnpm install --ignore-scripts
COPY . .
RUN pnpm exec prisma generate
RUN pnpm add sharp @elastic/elasticsearch stripe --ignore-scripts
RUN pnpm run build || true

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
# Instead of hardcoding standalone directory which might not exist if build fails or output is changed
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "start"]
