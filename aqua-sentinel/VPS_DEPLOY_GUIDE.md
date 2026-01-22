# 🚀 Deployment Guide on VPS

This guide assumes you have a VPS with **Docker** and **Docker Compose** installed.

## 1. Setup Environment
Create a `.env` file on your VPS in the project folder. You can copy the local one, but **update the host**:

```ini
# .env file content
user=postgres
password=YOUR_SECURE_PASSWORD
host=db
port=5432
dbname=aqua_sentinel
```

> **Important**: The `host` must be exactly `db` (the name of the service in docker-compose.yml), NOT `localhost` or `127.0.0.1`.

## 2. Run the Service
Run the following command to build and start everything in the background:

```bash
docker-compose up -d --build
```
- `--build`: Forces a rebuild of the Python image (useful if you updated code).
- `-d`: Detached mode (runs in background).

## 3. Verify Deployment

### Check Status
```bash
docker-compose ps
```
You should see `aqua_db` and `aqua_api` with status `Up`.

### View Logs (Real-time Simulation)
To see if the simulation is running:
```bash
docker logs -f aqua_api
```
You should see:
```
INFO:     🌊 Simulation Service STARTED (5-minute interval)
...
INFO:     ✅ Generated data for X pools...
```

### Access Database
To enter the database container:
```bash
docker exec -it aqua_db psql -U postgres -d aqua_sentinel
```

## 4. Maintenance

### Update Code
When you push new code to git:
```bash
git pull
docker-compose up -d --build
```

### Stop Services
```bash
docker-compose down
```

### Backup Data
Your database is stored in the `postgres_data` folder on the VPS. To backup:
```bash
tar -czvf db_backup.tar.gz postgres_data/
```
