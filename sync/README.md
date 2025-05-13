# Quantum Identity System

Astronomical timepiece displaying planetary harmonics and alignment patterns with quantum identity verification.

## Core Components

The 𝜏 identity system consists of two main components:
1. **Timepiece Interface** - The main interactive astronomical alignment visualization
2. **Identity Dashboard** - Identity verification and visualization components for monitoring

See the [structural overview](qrb-react/qrb/OVERVIEW.md) for documentation.

## Features

### Timepiece Features
- Interactive time display with rotating dials for seconds, minutes, hours, days, months, and degrees
- Geolocation-based astronomical data visualization
- Real-time display of planetary positions
- Zodiac sector visualization aligned with your longitude
- Earth wireframe visualization

### Dashboard Features
- Ash (Æ) Token visualization
- Quantum identity verification
- S2 cell mapping integration
- 𝜏-sync temporal synchronization pattern
- Interactive 3D visualization of the identity vortex

## Planetary Orientation

This application displays planet positions according to geo-centric coordinates, which is the traditional system used in astronomy and many ancient astronomical systems. Here's how to interpret the timepiece:

1. **Orientation**:
   - The **top (12 o'clock)** position represents **North**
   - The **right (3 o'clock)** position represents **East** 
   - The **bottom (6 o'clock)** position represents **South**
   - The **left (9 o'clock)** position represents **West**

2. **Alignment**:
   - When you activate the timepiece, it will use your geolocation to calculate the positions of astronomical bodies
   - An "EAST" label will appear at the 3 o'clock position to help you orient the device
   - For proper alignment, position your device so that the top (12 o'clock) points North

3. **Planet Positions**:
   - Planets are displayed at their geocentric ecliptic longitudes
   - This means their positions are shown as viewed from Earth's center
   - When properly aligned, the planets will appear in their actual positions relative to your location
   - The degree dial automatically aligns with your longitude to show accurate directional positions

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- npm (comes with Node.js)
- Python 3.8+ (for ephemeris data verification)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sync-tao/ash.git
   cd tau
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root (use `.env.example` as a template)

### Ephemeris Data

This application uses the [swisseph](https://github.com/drvinaayaksingh/swisseph) Node.js package for astronomical calculations. The package comes with basic ephemeris data, but for more accurate calculations, you should use comprehensive ephemeris files.

### Poetry Integration for Python Dependencies

TAU uses Poetry to manage Python dependencies required for the swisseph native compilation:

1. **Install Poetry**:
   ```bash
   # Install Poetry (if not already installed)
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **Install Python Dependencies**:
   ```bash
   # Navigate to the TAU directory
   cd tau
   
   # Install Python dependencies
   poetry install
   
   # Activate the virtual environment
   poetry shell
   ```

3. **Install Node.js Dependencies**:
   ```bash
   # With the Poetry virtual environment active
   npm install
   ```

### Automatic Installation

For convenience, you can use our setup script which handles Python configuration:

```bash
./scripts/setup.sh
```

### Downloading Ephemeris Files

You can download the necessary ephemeris files using our utility script:

```bash
npm run download-ephe
```

Or manually:

1. **Download the Ephemeris Files**:
   - Visit the [Astrodienst FTP server](https://www.astro.com/ftp/swisseph/)
   - Download the following files:
     - `seas_18.se1` (main asteroid ephemeris)
     - `semo_18.se1` (moon ephemeris)
     - `sepl_18.se1` (planetary ephemeris)
     - Any additional files you might need (e.g., fixed stars)

2. **Create Ephemeris Directory**:
   ```bash
   mkdir -p ephe
   ```

3. **Extract the Downloaded Files**:
   - Move all downloaded `.se1` files to the `ephe` directory
   - Make sure the files retain their original names

4. **Update Configuration**:
   - Edit your `.env` file to point to this directory:
     ```
     EPHEMERIS_PATH=./ephe
     ```

### Verification Against JPL Ephemerides

To verify the accuracy of TAU's astronomical calculations against NASA JPL data:

```bash
# With Poetry environment activated
poetry run verify --date 2023-01-01 --planet mars

# Or specify observer coordinates
poetry run verify --date 2023-01-01 --planet jupiter --lat 34.05 --lon -118.24 --output results.json
```

The verification tool compares our Swiss Ephemeris calculations with data from the JPL HORIZONS system, ensuring scientific accuracy to within fractions of an arcsecond.

#### Troubleshooting Ephemeris Data

If you experience issues with the ephemeris data:

- Ensure file permissions allow the application to read the ephemeris files
- Check that the path in `.env` is correct relative to where you start the application
- Verify that the files are not corrupted during download (compare file sizes with those on the FTP server)
- Look for errors in the server logs related to ephemeris file loading

## Development

### Starting the Development Server

To run the development server, first install `pm2` and start the backend server:
```bash
sudo npm install -g pm2
pm2 start server/index.js --name tau
pm2 status
```

Then run the development server:
```bash
npm run dev
```

This will start both the client development server (webpack) at http://localhost:8080 and the backend API server at http://localhost:5000.

### Building for Production

To build the complete application for production:

```bash
npm run build
```

The final output will be in the `/dist` folder.

### Building Only the Dashboard

To build only the dashboard component for deployment:

```bash
npm run build:dashboard
```

This will create a streamlined build with only the dashboard files in the `/dist` folder, which can be deployed independently from the main application. This is useful for updating just the dashboard component without redeploying the entire application.

### Running in Production

To run the built application:

```bash
npm start
```

### Deployment

#### Standard Deployment
For standard deployment on a VM or server:

1. Build the application
   ```bash
   npm run build  # or npm run build:dashboard for dashboard only
   ```

2. Start the server with PM2
   ```bash
   pm2 start server/index.js --name tau
   ```

#### VM Deployment Steps

If you need to update an existing VM deployment:

1. SSH into your VM
2. Navigate to your project directory:
   ```bash
   cd /path/to/tau
   ```

3. Pull the latest changes:
   ```bash
   git pull origin main
   ```

4. Install any new dependencies:
   ```bash
   npm install
   ```

5. Build the application:
   ```bash
   npm run build
   # or for dashboard only
   npm run build:dashboard
   ```

6. Restart the application:
   ```bash
   pm2 restart tau
   ```

## Project Structure

```
sync/
├── package.json           # Dependencies and scripts
├── webpack.config.js      # Bundler configuration
├── src/                   # Client source code
│   ├── assets/            # Static assets
│   │   └── favicon.ico
│   ├── js/
│   │   ├── time.js        # Core timepiece functionality
│   │   ├── dashboard.js   # Dashboard functionality
│   │   └── ash/           # Ash token integration
│   ├── styles/
│   │   ├── style.css      # Main CSS styles
│   │   └── dashboard.css  # Dashboard-specific styles
│   ├── index.html         # Main HTML template
│   ├── dashboard.html     # Dashboard HTML template
│   └── index.js           # Main entry point
├── server/                # Server code
│   ├── index.js           # Express server entry point
│   ├── routes/
│   │   ├── ephemeris.js   # API endpoint for astronomical data
│   │   └── security.js    # Security endpoints
│   └── services/
│       └── astronomical.js   # Service to handle astronomical calculations
├── scripts/               # Utility scripts
│   ├── download-ephe.js   # Script to download ephemeris files
│   ├── setup.sh           # Setup script
│   └── verify-jpl.sh      # JPL verification script
└── .env                   # Environment configuration
```

## API Endpoints

### Celestial Data Endpoint

```
GET /api/ephemeris
```

Query Parameters:
- `date` (required): Date in format DD.MM.YYYY
- `lat`: Latitude in decimal degrees (-90 to 90)
- `lon`: Longitude in decimal degrees (-180 to 180)

Example Request:
```
GET /api/ephemeris?date=21.03.2023&lat=34.0522&lon=-118.2437
```

Example Response:
```json
{
  "date": "21.03.2023",
  "coordinates": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "astronomicalData": {
    "Sun": {
      "longitude": 0.84,
      "latitude": 0.00,
      "distance": 0.9945,
      "longitudeSpeed": 0.9675,
      "latitudeSpeed": 0.0001,
      "distanceSpeed": 0.0002
    },
    "Moon": {
      "longitude": 246.28,
      "latitude": -4.87,
      "distance": 0.0025,
      "longitudeSpeed": 13.1763,
      "latitudeSpeed": 0.2372,
      "distanceSpeed": 0.0000
    },
    // ... other planets
  }
}
```

### Security Endpoint

```
GET /api/security/status
```

Example Response:
```json
{
  "status": "secure",
  "token": "Æ-1234-5678-90AB",
  "timestamp": "2025-03-14T15:32:45.123Z",
  "securityLevel": "quantum"
}
```

### Health Check Endpoint

```
GET /api/health
```

Example Response:
```json
{
  "status": "ok",
  "timestamp": "2025-03-14T15:32:45.123Z"
}
```

## Dashboard Identity Features

The identity dashboard includes several advanced features:

1. **Ash (Æ) Token**: Mathematical identity protection system that is structured yet complex, unpredictable yet verifiable
2. **Quantum Identity**: Non-repeating digital signature based on Penrose tiling patterns
3. **S2 Cell Mapping**: Hilbert curve mapping to Google S2 cells for geospatial security
4. **𝜏-sync**: Temporal synchronization pattern for secure time-based verification
5. **Identity Vortex**: Advanced 3D visualization of the user's quantum identity signature

These security features combine cryptographic principles with advanced visualization techniques to create a robust identity verification system.

### Component Synchronization

The dashboard implements precise synchronization between all security components:

1. **Temporal Foundation**:
   - The astronomical clock serves as the temporal foundation via `window.astronomicalData`
   - Julian Day timing (JD = 2440587.5 + milliseconds/86400000) provides scientific verification
   - All animations and patterns derive from this universal time reference

2. **Cross-Component Integration**:
   - The 𝜏 Harmonic pattern uses a Compositional Pattern-Producing Network (CPPN)
   - Julian Day values are converted to 0-2π temporal factors for consistent animation
   - Golden ratio (φ = 1.618033988749895) creates mathematically significant relationships between components

3. **Visual Synchronization**:
   - The integrated view's identity point and component dots are precisely synchronized
   - Position cycles use `positionCycle = julianDayFraction + activeComponentIntegrated`
   - The center star glows and rotates with the quantum identity mechanism
   - Flow lines visualize how astronomical data influences the quantum patterns
   
4. **Security Implications**:
   - Component synchronization creates a multi-layered verification system
   - Any desynchronization immediately signals potential compromise
   - The integrated view serves as visual proof of proper system functioning
   - Authentication requires precise alignment across all security components
