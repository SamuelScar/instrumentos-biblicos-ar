FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile

FROM dependencies AS development

COPY . .

EXPOSE 5173

CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]

FROM dependencies AS build

COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
