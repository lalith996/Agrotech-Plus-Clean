FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY prisma ./prisma
RUN pnpm install --config.verify-deps-before-run=false --ignore-scripts
RUN npx prisma generate
COPY . .
RUN pnpm build || true
EXPOSE 3000
CMD ["pnpm", "start"]
