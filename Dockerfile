FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN pnpm install --ignore-scripts --config.verify-deps-before-run=false

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the files
COPY . .

# Build the app
RUN pnpm build || true

EXPOSE 3000
CMD ["pnpm", "start"]
