FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=admin

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/admin/.next ./.next
COPY --from=build /app/apps/admin/package.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node_modules/.bin/next", "start", "--port", "4000"]
