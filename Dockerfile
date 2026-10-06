FROM node:20-alpine

# Install OpenSSL for Prisma and build tools
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package management files
COPY package.json ./
# Use wildcard to copy lockfile if it exists, but not fail if it doesn't
COPY package.json pnpm-lock.yam[l] ./

# Install dependencies, bypassing strict script approval
RUN pnpm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN pnpm build

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "start"]
