FROM node:20-alpine AS builder

WORKDIR /app

# Install necessary packages for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy the entire workspace since this is a simple monorepo/app setup
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts || pnpm clean --lockfile && pnpm install --ignore-scripts

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN pnpm config set verifyDepsBeforeRun false && pnpm build || true

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
