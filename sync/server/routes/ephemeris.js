const express = require('express');
const router = express.Router();
const astronomicalService = require('../services/astronomical');

/**
 * @route GET /api/ephemeris
 * @desc Get astronomical data for a specific date and location
 * @access Public
 * @param {string} date - Date in format DD.MM.YYYY
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Astronomical data object
 */
router.get('/ephemeris', async (req, res, next) => {
  try {
    const { date, lat, lon } = req.query;
    
    // Validate request parameters
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required (format: DD.MM.YYYY)' });
    }
    
    // Validate date format
    if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Please use DD.MM.YYYY' });
    }
    
    // Parse coordinates if provided
    const coords = {
      latitude: lat ? parseFloat(lat) : null,
      longitude: lon ? parseFloat(lon) : null
    };
    
    // Validate coordinates if provided
    if ((lat && isNaN(coords.latitude)) || (lon && isNaN(coords.longitude))) {
      return res.status(400).json({ error: 'Invalid coordinates format' });
    }
    
    // Ensure coordinates are within valid ranges if provided
    if (coords.latitude !== null && (coords.latitude < -90 || coords.latitude > 90)) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }
    
    if (coords.longitude !== null && (coords.longitude < -180 || coords.longitude > 180)) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }
    
    // Get astronomical data from service
    const astronomicalData = await astronomicalService.getAstronomicalData(date, coords);
    
    res.json({ 
      date,
      coordinates: coords.latitude !== null ? {
        latitude: coords.latitude,
        longitude: coords.longitude
      } : null,
      astronomicalData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @route GET /api/security/status
 * @desc Security status endpoint
 * @access Public
 */
router.get('/security/status', (req, res) => {
  // Mock security status for now
  res.json({
    status: "secure",
    token: `Æ-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`,
    timestamp: new Date().toISOString(),
    securityLevel: "quantum"
  });
});

module.exports = router;