FROM node:20-bullseye-slim AS base
WORKDIR /repo
ENV CI=1

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sdk/package.json packages/sdk/package.json
RUN npm ci

FROM deps AS build
COPY . .
RUN npm --workspace @fieldops/api run build
RUN npm --workspace @fieldops/api run prisma:generate

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/package.json ./package.json
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
