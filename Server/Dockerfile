# ============================================
# Communiatec Server - Dockerfile
# ============================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Production ----
FROM node:20-alpine AS production
LABEL maintainer="Communiatec Team"
LABEL description="Communiatec Backend API Server"

WORKDIR /app

# Create non-root user for security
RUN addgroup -S communiatec && adduser -S communiatec -G communiatec

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create required directories and set ownership
RUN mkdir -p uploads/profile-images logs \
    && chown -R communiatec:communiatec /app

# Switch to non-root user
USER communiatec

# Port is configurable via env (default 4000)
ENV PORT=4000
EXPOSE ${PORT}

# Health check — uses the PORT env var so it stays in sync
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
