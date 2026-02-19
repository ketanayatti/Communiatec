# ============================================
# Communiatec Client - Dockerfile
# ============================================
# Build:  docker build --build-arg VITE_API_URL=... --build-arg VITE_APP_SERVER_URL=... -t communiatec-client .
# Run:    docker run -p 80:80 communiatec-client
# ============================================

# ---- Stage 1: Install Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Only copy package files first (Docker layer caching means deps
# are only re-installed when package.json or lock changes)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ---- Stage 2: Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time env vars — MUST be provided via docker-compose or build args
ARG VITE_API_URL
ARG VITE_APP_SERVER_URL

# Validate that build args are set
RUN if [ -z "$VITE_API_URL" ]; then \
      echo "❌ ERROR: VITE_API_URL build arg is required" && exit 1; \
    fi && \
    if [ -z "$VITE_APP_SERVER_URL" ]; then \
      echo "❌ ERROR: VITE_APP_SERVER_URL build arg is required" && exit 1; \
    fi

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_SERVER_URL=$VITE_APP_SERVER_URL

# ─── Bullet-proof build settings ─────────────────────────────────
# 1. Increase Node.js heap (Monaco + Rollup need ~2 GB during build)
# 2. Disable CI env var that makes some tools treat warnings as errors
# 3. Increase network timeout for any post-install fetches
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=""

# Build the production bundle
RUN npm run build

# ---- Stage 3: Serve with Nginx ----
FROM nginx:1.25-alpine AS production
LABEL maintainer="Communiatec Team"
LABEL description="Communiatec Frontend Client"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check — 127.0.0.1 is the loopback inside the container
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
