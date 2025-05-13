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

## Step 1: Prepare the Environment

Ensure the target directories exist and have appropriate permissions:

```bash
# Create directories if they don't exist
sudo mkdir -p /home/ss_gsync_io/ephemeris
sudo mkdir -p /home/ss_gsync_io/sync

# Set appropriate ownership (replace with actual user)
sudo chown -R $USER:$USER /home/ss_gsync_io/ephemeris
sudo chown -R $USER:$USER /home/ss_gsync_io/sync
```

## Step 2: Copy Ephemeris Files

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

## Step 3: Deploy Application Code

Copy the application code to the production location:

```bash
# Copy application code
cp -R /path/to/source/v0.4/sync/* /home/ss_gsync_io/sync/
cp -R /path/to/source/v0.4/README.md /home/ss_gsync_io/
cp -R /path/to/source/v0.4/docs /home/ss_gsync_io/
```

## Step 4: Configure Environment Variables

Create a `.env` file in the application directory:

```bash
cat > /home/ss_gsync_io/sync/.env << 'EOF'
NODE_ENV=production
PORT=5000
EPHEMERIS_PATH=/home/ss_gsync_io/ephemeris/ephe
CORS_ORIGIN=https://tau-core.io
EOF
```

Adjust the values based on your specific requirements.

## Step 5: Install Dependencies

Install the required Node.js dependencies:

```bash
cd /home/ss_gsync_io/sync
npm install --production
```

## Step 6: Build the Application

Compile the frontend assets:

```bash
cd /home/ss_gsync_io/sync
npm run build
```

This will create optimized assets in the `dist` directory.

## Step 7: Start the Application

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

## Step 8: Verify Deployment

Verify the API is working:

```bash
curl http://localhost:5000/api/health
```

Should return a JSON response with `{"status":"ok", ...}`.

## Step 9: Configure Web Server (Optional)

If using Nginx or Apache as a reverse proxy, configure it to forward requests to the application:

### Nginx Example:

```
server {
    listen 80;
    server_name tau-core.io;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
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

- **Production IP**: 34.71.120.101
- **Application Path**: /home/ss_gsync_io/sync/
- **Ephemeris Path**: /home/ss_gsync_io/ephemeris

## Security Considerations

1. Ensure the server is protected by a firewall allowing only necessary ports
2. Use HTTPS for all production traffic
3. Keep Node.js and npm packages updated regularly to address security vulnerabilities
4. Monitor server logs for unusual activity
5. Implement rate limiting on API endpoints if needed