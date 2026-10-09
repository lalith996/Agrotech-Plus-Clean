FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json
COPY package.json ./
# Since we use npm, we should copy package-lock.json if available
COPY package-lock.json* ./

# Install dependencies
RUN npm install --ignore-scripts --legacy-peer-deps

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build || true

# Expose port
EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]