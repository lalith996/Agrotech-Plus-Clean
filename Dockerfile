FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install -g pnpm@10 && pnpm install --ignore-scripts

# Copy the rest of the files
COPY . .

# Run Prisma generate and build
RUN npx prisma generate
RUN npm run build || true

EXPOSE 3000

CMD ["npm", "start"]
