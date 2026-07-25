FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm config set ignore-scripts true
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]