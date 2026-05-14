FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/cbs/package.json ./packages/cbs/
COPY packages/pdok/package.json ./packages/pdok/
COPY packages/rdw/package.json ./packages/rdw/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/ ./apps/
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/cbs/dist ./packages/cbs/dist
COPY --from=builder /app/packages/pdok/dist ./packages/pdok/dist
COPY --from=builder /app/packages/rdw/dist ./packages/rdw/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/

EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]
