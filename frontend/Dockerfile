FROM node:22-alpine AS build

ARG VITE_API_URL=http://localhost:8080/api/v1

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm build

FROM nginx:1.26-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]