FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Install dependencies based on the preferred package manager
COPY package.json ./
# Use --ignore-scripts because prisma generate will fail when there is no schema file
RUN npm install --ignore-scripts

# Copy source
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build project
RUN npm run build || true

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]