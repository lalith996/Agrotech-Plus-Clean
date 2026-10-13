FROM node:20-alpine

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable pnpm

# Copy package files
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

# Copy remaining application code
COPY . .

# Generate Prisma client
RUN pnpm exec --config.verify-deps-before-run=false prisma generate

# Build the Next.js application
RUN pnpm build --config.verify-deps-before-run=false || true

# Start the application
CMD ["pnpm", "start"]
