FROM node:18-alpine AS builder

ENV NODE_ENV build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --production

# ---

FROM denoland/deno:bin-1.26.2 AS deno
FROM node:18

COPY --from=deno /deno /usr/local/bin/deno

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/dist/ ./dist/
COPY --from=builder /usr/src/app/deno-runtime ./deno-runtime/

CMD ["node", "dist/main"]