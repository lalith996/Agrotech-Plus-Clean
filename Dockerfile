FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN apk add --no-cache openssl
RUN npx prisma generate
RUN pnpm build || true