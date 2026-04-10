# Use the official Node.js image
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM node:20-slim AS release
WORKDIR /app

# Copy built assets and server code from base
COPY --from=base /app/dist ./dist
COPY --from=base /app/server.ts ./
COPY --from=base /app/types.ts ./
COPY --from=base /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm install -g tsx

# Expose the port Express is running on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["tsx", "server.ts"]
