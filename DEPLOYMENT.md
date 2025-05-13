# G-SYNC v0.4 Deployment Guide

## Overview

This document provides instructions for deploying the G-SYNC v0.4 system to production environments. The G-SYNC system consists of an astronomical timepiece and quantum security visualization platform with server-side components for ephemeris calculations.

## System Requirements

- Node.js 14.x or higher
- npm 6.x or higher
- PM2 for process management
- 1GB RAM minimum (2GB recommended)
- 2GB free disk space for application and ephemeris files

## Deployment Locations

The primary production deployment consists of:

- **Ephemeris Files**: `/home/ss_gsync_io/ephemeris`
- **Application Code**: `/home/ss_gsync_io/sync`
- **Domain**: gsync.io

## Step 1: Set Up Cloud VM

1. Create a VM with adequate resources (e.g., n2-standard-2 with 2 vCPUs, 8 GB memory)
2. Assign network tags for firewall rules:
   ```
   http-server https-server lb-health-check
   ```
3. Reserve a static IP address for production stability
4. Enable HTTP and HTTPS traffic in the VM settings

## Step 2: Prepare the Environment

Ensure the target directories exist and have appropriate permissions:

```bash
# Create directories if they don't exist
sudo mkdir -p /home/ss_gsync_io/ephemeris
sudo mkdir -p /home/ss_gsync_io/sync

# Set appropriate ownership (replace with actual user)
sudo chown -R $USER:$USER /home/ss_gsync_io/ephemeris
sudo chown -R $USER:$USER /home/ss_gsync_io/sync
```

## Step 3: Copy Ephemeris Files

The Swiss Ephemeris files are required for astronomical calculations:

```bash
# Copy ephemeris files to production location
cp -R /path/to/source/ephemeris/* /home/ss_gsync_io/ephemeris/
```

Verify the ephemeris files structure:
```bash
ls -la /home/ss_gsync_io/ephemeris/ephe
```

The directory should contain `.se1` files and other ephemeris data.

## Step 4: Deploy Application Code

Copy the application code to the production location:

```bash
# Copy application code
cp -R /path/to/source/v0.4/sync/* /home/ss_gsync_io/sync/
cp -R /path/to/source/v0.4/README.md /home/ss_gsync_io/
cp -R /path/to/source/v0.4/docs /home/ss_gsync_io/
```

## Step 5: Configure Environment Variables

Create a `.env` file in the application directory:

```bash
cat > /home/ss_gsync_io/sync/.env << 'EOF'
NODE_ENV=production
PORT=5000
EPHEMERIS_PATH=/home/ss_gsync_io/ephemeris/ephe
CORS_ORIGIN=https://gsync.io
EOF
```

Adjust the values based on your specific requirements.

## Step 6: Install Dependencies

Install the required Node.js dependencies:

```bash
cd /home/ss_gsync_io/sync
npm install
```

Note: Using just `npm install` instead of `npm install --production` ensures that development dependencies needed for building are included.

## Step 7: Build the Application

Compile the frontend assets:

```bash
cd /home/ss_gsync_io/sync
npm run build
```

This will create optimized assets in the `dist` directory.

## Step 8: Configure Nginx

Install and configure Nginx:

```bash
sudo apt update
sudo apt install -y nginx

# Create configuration file
sudo bash -c 'cat > /etc/nginx/sites-available/gsync << EOF
server {
    listen 80;
    server_name gsync.io www.gsync.io;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

# Enable the site
sudo ln -s /etc/nginx/sites-available/gsync /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default if it exists

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx
```

## Step 9: DNS Configuration

Configure DNS records for your domain (gsync.io) to point to your VM's static IP address:

1. Log into your domain registrar or DNS provider (e.g., Squarespace)
2. Add or update the following records:
   - **A Record**:
     - Host: `@` (root domain)
     - Value: `34.41.180.191` (your static IP)
     - TTL: 3600 (or 600 for faster propagation)
   - **A Record** for www subdomain:
     - Host: `www`
     - Value: `34.41.180.191` (your static IP)
     - TTL: 3600 (or 600 for faster propagation)

DNS changes may take 1-24 hours to fully propagate across the internet.

## Step 10: Start the Application

Start the application using PM2 for process management:

```bash
cd /home/ss_gsync_io/sync
npm run start:pm2
```

Verify the application is running:

```bash
pm2 status
```

You should see the `tau` process listed and in "online" status.

## Step 11: Verify Deployment

Verify the API is working:

```bash
curl http://localhost:5000/api/health
```

Should return a JSON response with `{"status":"ok", ...}`.

## Step 12: Set Up SSL with Let's Encrypt

Once DNS propagation is complete, secure your site with HTTPS:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate
sudo certbot --nginx -d gsync.io -d www.gsync.io

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Troubleshooting

### Ephemeris Path Issues

If you encounter errors related to ephemeris data:

1. Verify the ephemeris path:
   ```bash
   ls -la /home/ss_gsync_io/ephemeris/ephe
   ```

2. Check the environment variable is correctly set:
   ```bash
   grep EPHEMERIS_PATH /home/ss_gsync_io/sync/.env
   ```

### Geolocation Problems

If geolocation functionality is not working:

1. Confirm the server is running on HTTPS (required for geolocation in modern browsers)
2. Check browser console for any geolocation permission errors
3. Verify the `getHighAccuracyLocation()` function in `/home/ss_gsync_io/sync/src/js/time.js`

### Server Connection Issues

If unable to connect to the server:

1. Verify the server is running: `pm2 status`
2. Check if the port is accessible: `curl http://localhost:5000/api/health`
3. Inspect PM2 logs: `pm2 logs tau`

### Firewall Configuration

If the server is running but not accessible from outside:

1. Verify firewall rules are properly configured:
   ```bash
   # If you have gcloud CLI installed and configured:
   gcloud compute firewall-rules list
   ```

2. Ensure the VM has proper network tags (http-server, https-server)

3. Make sure port 5000 is accessible if you're bypassing Nginx:
   ```bash
   # Create firewall rule for direct application access (if needed)
   gcloud compute firewall-rules create g-sync-vpc-allow-app \
       --description="Allow G-SYNC application traffic" \
       --direction=INGRESS \
       --priority=1000 \
       --network=g-sync-vpc \
       --action=ALLOW \
       --rules=tcp:5000 \
       --source-ranges=0.0.0.0/0
   ```

### DNS Issues

If DNS is not resolving correctly:

1. Verify DNS records are correctly set:
   ```bash
   dig gsync.io
   dig www.gsync.io
   ```

2. Check DNS propagation status using online tools like:
   https://www.whatsmydns.net/

## Maintenance

### Restarting the Application

To restart the application:

```bash
cd /home/ss_gsync_io/sync
npm run stop:pm2
npm run start:pm2
```

### Viewing Logs

To view application logs:

```bash
pm2 logs tau
```

### Updating the Application

To update the application:

1. Stop the current instance:
   ```bash
   cd /home/ss_gsync_io/sync
   npm run stop:pm2
   ```

2. Deploy the new code
3. Rebuild if necessary:
   ```bash
   npm run build
   ```

4. Restart the application:
   ```bash
   npm run start:pm2
   ```

## Production Server Information

- **Production IP**: 34.41.180.191
- **Domain**: gsync.io
- **Application Path**: /home/ss_gsync_io/sync/
- **Ephemeris Path**: /home/ss_gsync_io/ephemeris

## Security Considerations

1. Ensure the server is protected by a firewall allowing only necessary ports
2. Use HTTPS for all production traffic
3. Keep Node.js and npm packages updated regularly to address security vulnerabilities
4. Monitor server logs for unusual activity
5. Implement rate limiting on API endpoints if needed
6. Consider restricting SSH access to specific IP ranges
7. Set up regular backups of your application and configuration