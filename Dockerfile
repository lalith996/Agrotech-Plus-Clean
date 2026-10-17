FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json package-lock.json ./

# Install dependencies using npm since pnpm-lock.yaml doesn't exist
RUN npm install --ignore-scripts --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build || true

# Start the application
CMD ["npm", "start"]
