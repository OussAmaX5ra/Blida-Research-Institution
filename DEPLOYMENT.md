# Blida Research Institute - Docker Deployment

## Prerequisites

- Docker
- Docker Compose
- MongoDB Atlas account (already configured)

## Quick Start

1. **Edit production environment variables:**

```bash
cp .env.production.example .env.production
# Edit .env.production with your values
```

2. **Build and start the container:**

```bash
docker-compose up --build
```

3. **Access the application:**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`

## Environment Variables

Create a `.env.production` file with:

```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=your-mongodb-atlas-uri
ACCESS_TOKEN_SECRET=your-32-char-minimum-secret
REFRESH_TOKEN_SECRET=your-32-char-minimum-secret
LOG_LEVEL=info
```

## Commands

```bash
# Build and start
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose build --no-cache
```

## Production Deployment on VPS

1. **Upload files to your server:**
```bash
scp -r . user@your-server:/opt/blida-research
```

2. **SSH into server and configure:**
```bash
ssh user@your-server
cd /opt/blida-research
cp .env.production.example .env.production
nano .env.production  # Update with production values
```

3. **Run with Docker Compose:**
```bash
docker-compose up -d --build
```

4. **Set up Nginx as reverse proxy (optional):**
Point your domain to the Docker container port 3000.

## Container Details

- **Image**: Node.js 20 Alpine
- **Ports**: 3000 (HTTP)
- **Services**: Nginx (reverse proxy) + Node.js API server
- **Persistent data**: None (uses MongoDB Atlas)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Verify .env.production exists
cat .env.production
```

### MongoDB connection error
- Verify `MONGODB_URI` is correct in `.env.production`
- Check MongoDB Atlas network access settings

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Change port in docker-compose.yml if needed
```