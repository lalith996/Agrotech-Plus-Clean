FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and prisma directory
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies (ignoring scripts)
RUN npm install --ignore-scripts

# Generate Prisma client manually
RUN npx prisma generate

# Copy application files
COPY . .

# Build the application
RUN npm run build || true

EXPOSE 3000

CMD ["npm", "start"]
