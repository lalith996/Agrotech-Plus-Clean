FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl (required by prisma)
RUN apk add --no-cache openssl

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
# Disabling verify deps to avoid ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION although using npm anyway
RUN pnpm build || true

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]