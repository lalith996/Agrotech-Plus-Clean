FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl (required by Prisma)
RUN apk add --no-cache openssl

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies, ignoring scripts to bypass tesseract.js and prisma postinstall issues
RUN pnpm install --ignore-scripts

# Copy project files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Skip build in Docker as this is a minimal environment that doesn't have all the heavy dev dependencies (like sharp, stripe) needed for a full build, per constraints.

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
