FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies (ignoring scripts like postinstall for now)
RUN pnpm install --ignore-scripts

# Copy the rest of the application
COPY . .

# Run postinstall to generate Prisma Client, then build the application
RUN pnpm run postinstall
RUN pnpm run build

# Apply least privilege by using a non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
