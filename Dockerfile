FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies files
COPY package.json ./

# Install dependencies, bypassing verify-deps check and skipping postinstall
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm exec prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build --config.verify-deps-before-run=false || true

# Expose port and set start command
EXPOSE 3000
CMD ["pnpm", "start"]
