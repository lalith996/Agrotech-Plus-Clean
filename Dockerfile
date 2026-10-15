FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./

RUN npm install -g pnpm && pnpm install --ignore-scripts --config.verify-deps-before-run=false

COPY . .

RUN pnpm exec prisma generate

RUN pnpm build || true

EXPOSE 3000
CMD ["pnpm", "start"]
