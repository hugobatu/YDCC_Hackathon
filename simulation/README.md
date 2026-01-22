# Aqua Sentinel Water Quality Simulation

This service automatically generates realistic water quality data for your Aqua Sentinel pools every 5 minutes.

## Features

- 🔄 **Real-time Simulation**: Generates data every 5 minutes
- 🐟 **Species-Specific**: Different ideal ranges for different fish species (Tom, Ca Tra, etc.)
- 🌊 **Realistic Patterns**: Uses random walk with mean reversion and diurnal cycles
- ⚠️ **Event Simulation**: Random anomaly events (rain, oxygen crashes)
- 📊 **5 Parameters**: Temperature, pH, Dissolved Oxygen, Ammonia, Turbidity

## Quick Start

### Using Docker (Recommended for VPS)

1. **Install Docker and Docker Compose** on your Ubuntu VPS
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Clone or upload this directory to your VPS**

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your database credentials
   ```

4. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

Or manually:
```bash
docker-compose up -d
docker-compose logs -f
```

### Local Development

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run the application**
   ```bash
   python -m app.app
   ```

## Project Structure

```
simulation/
├── app/
│   ├── app.py                 # Main entry point
│   ├── db/
│   │   └── connection.py      # Database connection
│   ├── models/
│   │   └── models.py          # SQLAlchemy models
│   └── services/
│       ├── engine.py          # Risk assessment engine
│       └── simulation.py      # Data generation service
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore             # Docker ignore file
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── deploy.sh                 # Deployment script
├── DEPLOYMENT.md             # Detailed deployment guide
└── README.md                 # This file
```

## Environment Variables

Required environment variables (set in `.env`):

```
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=postgres
```

## How It Works

### Data Generation

The simulation uses a sophisticated algorithm that combines:

1. **Random Walk**: Small random changes each iteration
2. **Mean Reversion**: Tendency to return to ideal values
3. **Diurnal Cycle**: Day/night variations in temperature and oxygen
4. **Event-Based Anomalies**: Occasional random events (1% chance each cycle)

### Species Profiles

Each species has different ideal ranges:

**Tom (Shrimp)**
- Temperature: 29°C
- pH: 8.0
- Dissolved Oxygen: 6.5 mg/L
- Ammonia: 0.05 mg/L
- Turbidity: 30 NTU

**Ca Tra (Catfish)**
- Temperature: 28°C
- pH: 7.5
- Dissolved Oxygen: 5.0 mg/L
- Ammonia: 0.1 mg/L
- Turbidity: 80 NTU

### Data Frequency

- **Interval**: Every 5 minutes (300 seconds)
- **Persistence**: Data is stored in PostgreSQL/Supabase
- **Continuous**: Runs 24/7 until stopped

## Docker Commands

### Basic Operations

```bash
# Start service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose stop

# Restart service
docker-compose restart

# Check status
docker-compose ps

# Stop and remove
docker-compose down
```

### Troubleshooting

```bash
# View last 100 log lines
docker-compose logs --tail=100

# Check container resource usage
docker stats

# Enter container shell
docker-compose exec simulation /bin/bash

# Rebuild image
docker-compose up -d --build
```

## Monitoring

### Health Checks

The service includes a health check that runs every 30 seconds:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pgrep -f 'python -m app.app' || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logs

Log rotation is configured to keep disk usage minimal:
- Maximum size per file: 10MB
- Maximum number of files: 3

## Security

The Docker container runs as a non-root user for enhanced security:
```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

## Performance

### Resource Limits

Default limits (can be adjusted in `docker-compose.yml`):
- CPU: 0.5 cores (max), 0.25 cores (reserved)
- Memory: 512MB (max), 256MB (reserved)

### Optimization

- Uses `python:3.11-slim` for smaller image size
- Multi-stage Docker build with layer caching
- Minimal dependencies for faster startup

## Database Schema

The simulation expects the following tables:

**pools**
- pool_id (primary key)
- species_id (foreign key)
- owner_id
- region_id
- pool_name

**water_measurements**
- measurement_id (primary key)
- pool_id (foreign key)
- temperature
- ph
- dissolved_oxygen
- amonia (yes, it's spelled this way in the DB)
- turbidity
- created_at

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## License

Copyright © 2026 Aqua Sentinel Team

---

**Made with ❤️ for sustainable aquaculture**
