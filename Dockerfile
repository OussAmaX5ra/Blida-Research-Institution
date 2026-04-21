# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* ./server/

# Install root dependencies (for build)
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy source files
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies for server
COPY server/package.json server/package-lock.json* ./
WORKDIR /app
RUN npm install --production

# Copy server source
WORKDIR /app
COPY server/src ./src
COPY server/seed-data ./seed-data

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Install nginx and prepare writable runtime paths for non-root startup
RUN apk add --no-cache nginx && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /tmp/nginx/logs \
             /tmp/nginx/conf \
             /tmp/nginx/client_body \
             /tmp/nginx/proxy \
             /tmp/nginx/fastcgi \
             /tmp/nginx/uwsgi \
             /tmp/nginx/scgi && \
    chown -R nodejs:nodejs /app /tmp/nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start nginx (which proxies to node backend)
CMD ["sh", "-c", "node src/server.js & nginx -p /tmp/nginx -c /etc/nginx/nginx.conf -g 'daemon off;'"]
