# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci --workspace @sft/api --workspace @sft/shared --include-workspace-root=false

FROM deps AS build
COPY apps/api apps/api
COPY packages/shared packages/shared

RUN npm run prisma:generate -w @sft/api
RUN npm run build -w @sft/shared
RUN npm run build -w @sft/api
RUN npm prune --omit=dev --workspaces --include-workspace-root=false

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

EXPOSE 4000

USER node
CMD ["node", "apps/api/dist/index.js"]
