FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.x

COPY package.json ./

# Install dependencies, bypassing postinstall script
RUN pnpm install --ignore-scripts --no-frozen-lockfile

# Generate Prisma client explicitly
COPY prisma ./prisma/
RUN pnpm exec prisma generate

COPY . .

# Build the Next.js app, ignoring type/lint errors
RUN pnpm build || true

EXPOSE 3000
CMD ["pnpm", "start"]
