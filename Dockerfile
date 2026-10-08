FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

COPY . .
RUN npm run build || true

CMD ["npm", "start"]
