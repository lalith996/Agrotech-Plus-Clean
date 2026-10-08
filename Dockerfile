FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN npm run postinstall || true
RUN npm run build || true

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "start"]
