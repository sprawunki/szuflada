FROM node:20 AS build

RUN mkdir /app && chown node:node /app

USER node
WORKDIR /app

ENV npm_cache_path=/tmp/.npm

COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json

RUN npm install --strict-peer-deps

COPY --chown=node:node svelte.config.js svelte.config.js
COPY --chown=node:node tsconfig.json tsconfig.json
COPY --chown=node:node vite.config.js vite.config.js
COPY --chown=node:node static static
COPY --chown=node:node src src

FROM build as dev

CMD ["npm", "run", "dev"]

FROM build AS build-prod

RUN npm run build

FROM caddy as app

USER 1000

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-prod /app/build /usr/share/caddy/szuflada
