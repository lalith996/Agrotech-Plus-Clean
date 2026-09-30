FROM node:24-alpine

WORKDIR /app

# Install dependencies and update system packages
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm

COPY package.json ./
COPY prisma ./prisma/
RUN pnpm config set ignore-scripts true && pnpm install
RUN npx prisma generate

COPY . .

# Environment setup
ENV NODE_ENV=production
ENV PORT=3000

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
