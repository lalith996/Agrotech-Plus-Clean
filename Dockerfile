FROM node:20-alpine

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts --legacy-peer-deps

COPY . .

RUN npx prisma generate

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build application
RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
