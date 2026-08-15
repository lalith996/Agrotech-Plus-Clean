# Use Node.js 22 alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package.json and related files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm config set ignore-scripts true
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the Next.js application
RUN pnpm build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]