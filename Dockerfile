FROM node:22-alpine

WORKDIR /app

# Install dependencies needed for Prisma and other packages
RUN apk add --no-cache openssl ca-certificates python3 make g++

COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install project dependencies
RUN pnpm install

# Copy project files
COPY . .

# Generate Prisma client
RUN pnpm run postinstall

# Build the Next.js app
RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
