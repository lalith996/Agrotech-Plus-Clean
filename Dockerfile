FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY prisma ./prisma/
RUN pnpm config set ignore-scripts true && pnpm install --config.verify-deps-before-run=false
COPY . .
RUN pnpm prisma generate
RUN pnpm build || true
EXPOSE 3000
CMD ["pnpm", "start"]