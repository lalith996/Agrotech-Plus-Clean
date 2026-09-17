FROM node:22-alpine

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install dependencies (ignoring scripts to prevent prisma generate from failing early)
RUN pnpm install --ignore-scripts

# Copy application source code
COPY . .

# Run postinstall explicitly (generates Prisma client)
RUN pnpm run postinstall

# Build the application
RUN pnpm run build

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
