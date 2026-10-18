FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

COPY prisma ./prisma
RUN npx prisma generate

# Build the app
COPY . .
RUN npm run build || true

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=deps --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=deps --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]