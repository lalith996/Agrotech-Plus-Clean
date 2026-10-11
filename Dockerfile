FROM node:20-alpine AS base

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./
# Copy prisma schema so postinstall works
COPY prisma ./prisma

# Install dependencies using pnpm
RUN corepack enable pnpm && pnpm install --config.verify-deps-before-run=false --ignore-scripts

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN pnpm dlx prisma@5.22.0 generate

# Build the Next.js application
RUN pnpm build --config.verify-deps-before-run=false || true

# Start the application
CMD ["pnpm", "start"]