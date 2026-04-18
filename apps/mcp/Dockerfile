FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=mcp

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/mcp/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4200
CMD ["node", "dist/index.js"]
