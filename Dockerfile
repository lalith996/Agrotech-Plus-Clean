FROM node:20-alpine

# Install dependencies including openssl for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Install dependencies bypassing strict checks and scripts
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm exec prisma generate

# Copy rest of the code
COPY . .

# Build the application (ignore build errors as instructed)
RUN pnpm build --config.verify-deps-before-run=false || true

EXPOSE 3000

CMD ["pnpm", "start"]