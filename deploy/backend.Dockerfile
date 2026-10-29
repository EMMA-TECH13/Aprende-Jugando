FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
USER node
EXPOSE 3001
CMD ["node","src/server.js"]
