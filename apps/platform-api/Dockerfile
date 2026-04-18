FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/platform-api/package.json ./apps/platform-api/
COPY packages ./packages
RUN pnpm fetch --prod

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm turbo run build --filter=platform-api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/platform-api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4100
CMD ["node", "dist/index.js"]
