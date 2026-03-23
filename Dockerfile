# Stage 1: Build
FROM node:25-alpine AS builder

WORKDIR /app

# Install dependencies
COPY *.json ./
RUN npm install

# Copy source and build TypeScript
COPY *.ts ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
FROM node:25-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy compiled code and the graph data
COPY --from=builder /app/build/ ./build/

EXPOSE 8081

CMD ["node", "build/server.js"]