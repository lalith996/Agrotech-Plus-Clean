FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm globally using the exact version
RUN npm install -g pnpm@10.30.3

# Copy package management files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies deterministically
RUN pnpm install --ignore-scripts

# Copy Prisma schema
COPY prisma ./prisma

# Run postinstall manually (Prisma generate)
RUN pnpm run postinstall

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Install system dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm globally in the runner stage too
RUN npm install -g pnpm@10.30.3

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and dependencies, assigning ownership to nextjs
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/next.config.js ./next.config.js

# Expose port 3000
EXPOSE 3000

# Run as non-root user
USER nextjs

CMD ["pnpm", "start"]
