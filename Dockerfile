FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "dev"]
