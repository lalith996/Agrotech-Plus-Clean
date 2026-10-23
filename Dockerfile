FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install --ignore-scripts
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build || true
EXPOSE 3000
CMD ["pnpm", "start"]
