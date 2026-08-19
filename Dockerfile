# Build stage
FROM node:22.12.0-bookworm-slim AS build

WORKDIR /app

RUN npm install --global pnpm@10.6.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Production stage
FROM node:22.12.0-bookworm-slim AS production

WORKDIR /app

RUN npm install --global pnpm@10.6.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

USER node

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]