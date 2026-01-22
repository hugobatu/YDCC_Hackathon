# Deployment Guide for Aqua Sentinel Simulation Service

This guide will help you deploy the water quality simulation service on an Ubuntu VPS using Docker.

## Prerequisites

- Ubuntu VPS (18.04 or later)
- SSH access to your VPS
- Domain name (optional, for HTTPS)
- Database credentials (Supabase or PostgreSQL)

## Step 1: Install Docker on Ubuntu VPS

SSH into your VPS and run:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

Log out and log back in for the group changes to take effect.

## Step 2: Upload Your Application

### Option A: Using Git (Recommended)

```bash
# Install git if not already installed
sudo apt install -y git

# Clone your repository
git clone https://github.com/yourusername/aqua-sentinel-simulation.git
cd aqua-sentinel-simulation
```

### Option B: Using SCP

From your local machine:

```bash
# Upload the entire simulation folder
scp -r simulation/ user@your-vps-ip:/home/user/aqua-sentinel-simulation/
```

## Step 3: Configure Environment Variables

```bash
# Navigate to your application directory
cd /path/to/simulation

# Copy the example env file
cp .env.example .env

# Edit the .env file with your actual credentials
nano .env
```

Update the following variables:
```
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=postgres
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 4: Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the service in detached mode
docker-compose up -d

# Check if the container is running
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 5: Verify Deployment

```bash
# Check container status
docker-compose ps

# View real-time logs
docker-compose logs -f simulation

# Check if data is being inserted (check your database)
```

## Managing the Service

### Start the service
```bash
docker-compose start
```

### Stop the service
```bash
docker-compose stop
```

### Restart the service
```bash
docker-compose restart
```

### View logs
```bash
# All logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Update the application
```bash
# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Remove everything
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (careful!)
docker-compose down -v
```

## Auto-Start on System Boot

To ensure your service starts automatically when the VPS reboots:

### Option A: Using Docker Compose with Restart Policy

The `docker-compose.yml` already includes `restart: unless-stopped`, so containers will auto-start.

### Option B: Using Systemd Service

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/aqua-sentinel-simulation.service
```

Add the following content:

```ini
[Unit]
Description=Aqua Sentinel Simulation Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/simulation
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable aqua-sentinel-simulation
sudo systemctl start aqua-sentinel-simulation
sudo systemctl status aqua-sentinel-simulation
```

## Monitoring and Troubleshooting

### Check container resource usage
```bash
docker stats
```

### Enter the container shell (for debugging)
```bash
docker-compose exec simulation /bin/bash
```

### Check container health
```bash
docker inspect --format='{{.State.Health.Status}}' aqua-sentinel-simulation
```

### Common Issues

**Issue: Container keeps restarting**
```bash
# Check logs for errors
docker-compose logs simulation

# Common causes:
# - Wrong database credentials
# - Database not accessible
# - Python dependencies missing
```

**Issue: Database connection timeout**
```bash
# Test database connection from VPS
sudo apt install -y postgresql-client
psql -h your-db-host -U your-db-user -d postgres

# Check firewall rules
# Make sure your VPS IP is whitelisted in Supabase/PostgreSQL
```

**Issue: Out of memory**
```bash
# Check memory usage
free -h

# Adjust resource limits in docker-compose.yml if needed
```

## Security Best Practices

1. **Never commit .env file to Git**
   ```bash
   # Make sure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use SSH keys instead of passwords**
   ```bash
   # Generate SSH key on your local machine
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Copy to VPS
   ssh-copy-id user@your-vps-ip
   ```

3. **Set up a firewall**
   ```bash
   # Install UFW
   sudo apt install -y ufw
   
   # Allow SSH
   sudo ufw allow ssh
   
   # Enable firewall
   sudo ufw enable
   ```

4. **Keep Docker and system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Use strong database passwords**

6. **Regularly backup your database**

## Performance Optimization

### For production workloads:

1. **Use Docker BuildKit for faster builds**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Optimize Docker image size**
   - The Dockerfile already uses `python:3.11-slim`
   - Cleans up apt cache after installation

3. **Set appropriate resource limits**
   - Adjust CPU and memory limits in `docker-compose.yml`

## Monitoring Logs

### Set up log rotation
The `docker-compose.yml` already includes log rotation:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

This keeps only the last 3 files of 10MB each.

## Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f`
2. Verify database connectivity
3. Check container health: `docker-compose ps`
4. Review environment variables

---

**Congratulations!** Your Aqua Sentinel simulation service should now be running on your VPS, automatically generating water quality data every 5 minutes.
