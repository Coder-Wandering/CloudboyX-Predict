# Multi-stage production Dockerfile for CloudboyX Predict
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application source
COPY . .

# Build Vite frontend and Express server bundle
RUN npm run build

# -----------------------------------------------------------------------------
# Production runner
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles and assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/data ./data
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]
