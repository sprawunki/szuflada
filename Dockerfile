FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --strict-peer-deps

COPY . .

FROM build as dev

CMD ["npm", "run", "dev"]

FROM build as app

RUN npm run build

CMD ["npm", "run", "preview"]
