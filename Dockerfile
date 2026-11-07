FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile --ignore-scripts
COPY . .
RUN npx prisma generate
RUN pnpm build
CMD ["pnpm", "start"]
