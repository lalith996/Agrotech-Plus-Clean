FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install build dependencies, sqlite for Prisma, and python for native extensions
RUN apk add --no-cache python3 make g++ sqlite

# Copy package management files
COPY package.json ./

# Enable pnpm and install dependencies
RUN corepack enable pnpm && pnpm install

# Copy source files
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build application
RUN pnpm build

# Start the application
CMD ["pnpm", "start"]
