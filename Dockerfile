FROM node:20-alpine

RUN apk add --no-cache openssl

RUN npm install -g pnpm

WORKDIR /app

COPY package.json ./
RUN pnpm install --ignore-scripts

COPY prisma ./prisma
RUN pnpm exec prisma generate

COPY . .

RUN pnpm build || true

EXPOSE 3000

CMD ["pnpm", "start"]
