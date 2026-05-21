FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=8080
EXPOSE ${PORT}

CMD sh -c "npm run dev -- --host 0.0.0.0 --port ${PORT}"