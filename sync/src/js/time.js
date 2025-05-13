/**
 * Core functionality for the Astronomical Timepiece
 */

// Import jQuery - we do this directly in the module
// jQuery should already be available globally from index.js, but we ensure it's available here too
import $ from 'jquery';

// Make jQuery available globally if it's not already
if (typeof window.$ === 'undefined') {
  window.$ = $;
}
if (typeof window.jQuery === 'undefined') {
  window.jQuery = $;
}

// Constants for data fetch timeout and global date variables
const DATA_FETCH_TIMEOUT = 10000; // 10 seconds
const d = new Date();
const Y = d.getFullYear();
const M = d.getMonth();
const DD = new Date(Y, M + 1, 0).getDate();

// Constants for rotating elements
const DEG_PER_MONTH = 30;
const DEG_PER_HOUR = 15;
const DEG_PER_MIN_SEC = 6;
const DEGREE_STEP = 5;    // Increment for each tick
const CENTER_DEGREE = 0;  // Degree aligned to the current time position

// API endpoint for astronomical data - use relative path for better proxy support
const API_ENDPOINT = '/api/ephemeris';
  
// Global state tracking for longitude alignment
var LONG_ALIGNED = false; // Check if longitude is already aligned

// Track memory for proper cleanup between animation sequences
var animationElements = {
  labels: [],
  markers: [],
  wireframes: []
};
  
// Draws circular arrangement of time elements
function createTimeElements(containerId, start, end, padZero = false) {
  for (let i = start; i <= end; i++) {
    const value = padZero && i < 10 ? "0" + i : i;
    $(containerId).append(`<li data-item="${value}">${value}</li>`);
  }
}
  
// Function to set degree ticks starting from 5, incrementing by 5
function setDegreeTicks() {
  const container = $("#degree");
  container.empty(); // Clear previous ticks

  for (let i = 5; i <= 360; i += DEGREE_STEP) {
    const d = i % 360;
    const value = d < 10 ? "00" + d : d < 100 ? "0" + d : d;
    const degree = i === 5 ? "***" : value;
    
    // Create the li element
    const li = $(`<li data-item="${degree}">${degree}</li>`);
    
    // Apply yellow highlight to the *** marker
    if (degree === "***") {
      li.addClass('sun-pulse').css({
        color: '#ffff40',
        textShadow: '0 0 15px #ffff40',
        opacity: 1,
        fontWeight: 'bold'
      });
    }
    
    container.append(li);
  }
  applyRotationTransform("#degree", DEGREE_STEP, 230); // Apply initial circular arrangement
}
  
function convertLongitudeToDegrees(userLongitude) {
  // Convert -180 to 180 range to 0 to 360 range
  return (userLongitude + 180);
}

function draw() {
  createTimeElements("#second", 0, 59, true);
  createTimeElements("#minute", 0, 59, true);
  createTimeElements("#day", 1, DD, true);
  createTimeElements("#hour", 1, 24, true);
  createTimeElements("#month", 1, 12, true);
  setDegreeTicks(); // Initialize degree ticks
}

// Apply rotation transformations
function applyRotationTransform(containerId, degreePerItem, translateX) {
  $(`${containerId} li`).each(function (index) {
    $(this).css({
      transform: `rotateZ(${degreePerItem * index}deg) translateX(${translateX}px)`
    });
  });
}

function set_time() {
  applyRotationTransform("#second", DEG_PER_MIN_SEC, 200);
  applyRotationTransform("#minute", DEG_PER_MIN_SEC, 170);
  applyRotationTransform("#hour", DEG_PER_HOUR, 140);
  applyRotationTransform("#day", 360 / DD, 110);
  applyRotationTransform("#month", DEG_PER_MONTH, 80);
  applyRotationTransform("#degree", DEGREE_STEP, 230);
}
  
// Update functions for each time unit
function secondUpdate(ts) {
  const TS = ts % 60;
  const deg = (360 / 60) * ts;
  $("#second li").removeClass("active").eq(TS).addClass("active");
  $("#second").css({ transform: `rotateZ(-${deg}deg)` });
}

function minuteUpdate(tm) {
  const TM = tm % 60;
  const deg = (360 / 60) * tm;
  $("#minute li").removeClass("active").eq(TM).addClass("active");
  $("#minute").css({ transform: `rotateZ(-${deg}deg)` });
}

function hourUpdate(th) {
  const TH = th % 24;
  const deg = (360 / 24) * th;
  $("#hour li").removeClass("active").eq(TH).addClass("active");
  $("#hour").css({ transform: `rotateZ(-${deg}deg)` });
}

function dayUpdate(td, days) {
  const TD = td % days;
  const deg = (360 / days) * td;
  $("#day li").removeClass("active").eq(TD).addClass("active");
  $("#day").css({ transform: `rotateZ(-${deg}deg)` });
}

function monthUpdate(tm) {
  const TM = tm % 12;
  const deg = (360 / 12) * tm;
  $("#month li").removeClass("active").eq(TM).addClass("active");
  $("#month").css({ transform: `rotateZ(-${deg}deg)` });
}
  
function degreeUpdate(deg) {
  // Only update if not in longitude-aligned mode
  if (!LONG_ALIGNED) {
    // Reset all degree styles first
    $("#degree li").each(function() {
      $(this).css({
        color: '',
        // textShadow: '',
        opacity: '',
        fontWeight: ''
      });
    });
    
    // Remove active class from all elements
    $("#degree li").removeClass("active");
    
    // Add active class to the first element (which is the *** marker)
    const sunMarker = $("#degree li").eq(0);
    sunMarker.addClass("active");
    
    // Apply the highlight styling to the active element
    sunMarker.css({
      color: '#ffff40',
      // textShadow: '0 0 15px #ffff40',
      opacity: 1,
      fontWeight: 'bold'
    });
    
    // Apply rotation to the degree dial
    $("#degree").css({ transform: `rotateZ(-${deg}deg)` });
  }
}
  
function updateClock() {
  const now = new Date();
  const day = now.getDate() - 1;
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const month = now.getMonth();
  const yearDays = new Date(now.getFullYear(), month + 1, 0).getDate();

  // Update all dials except for #long
  monthUpdate(month);
  dayUpdate(day, yearDays);
  hourUpdate(hour);
  minuteUpdate(minute);
  secondUpdate(second);
  
  // Only update the degree dial if longitude has not been aligned manually
  if (!LONG_ALIGNED) {
    degreeUpdate(0); // Keep degree dial running normally
  }

  setTimeout(updateClock, 1000);
}
  
// Initial setup for planets hidden at the center
function positionPlanetsAtCenter(radius = 0, centerX = 257, centerY = 257) {
  // Handle all planets except Earth
  const planets = ["#Sun", "#Mercury", "#Venus", "#Mars", "#Jupiter", "#Saturn", "#Moon"];
    planets.forEach(planetId => {
      $(planetId).css({
        opacity: 0, // Start hidden
        position: 'absolute',
        left: `${centerX}px`,
        top: `${centerY}px`,
        transform: 'translate(-50%, -50%)',
        display: 'none' // Add display:none to ensure markers are completely hidden
      });
    });
    
    // Initially hide the star-center (Earth marker)
    // It will be made visible during the animation
    $("#star-center").addClass("hidden")
      .removeClass("pulsing")
      .css({
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0)',
        display: 'none',
        zIndex: 210
      });
      
    // Keep style but make Earth marker invisible
    $("#Earth").css({
      opacity: 0, // Invisible
      position: 'absolute',
      left: `${centerX}px`,
      top: `${centerY}px`,
      transform: 'translate(-50%, -50%)',
      display: 'none', // Hidden
      zIndex: 209, // Behind star-center
      backgroundColor: '#0080ff',
      boxShadow: '0 0 8px #0080ff',
      width: '8px',
      height: '8px'
    });
    
    // Make sure Earth label is positioned correctly
    if ($(".earth-label").length > 0) {
      $(".earth-label").css({
        position: 'absolute',
        left: `${centerX}px`,
        top: `${centerY + 15}px`, // Position below Earth marker
        transform: 'translate(-50%, 0)', // Center horizontally
        color: 'white',
        textShadow: '0 0 8px rgba(77, 184, 255, 0.8)',
        fontSize: '14px',
        fontWeight: 'bold',
        opacity: 1,
        zIndex: 220, // Higher than Earth marker
        display: 'block'
      });
    }
  }
  
  function fetchAstronomicalData(date, coordinates) {
      // Ensure proper console logging for debugging
      console.log("Fetching astronomical data with coordinates:", coordinates);
      
      // Check if coordinates exist and have valid properties
      const lat = coordinates && coordinates.latitude ? coordinates.latitude : '';
      const lon = coordinates && coordinates.longitude ? coordinates.longitude : '';
      
      // Store coordinates globally to ensure they're available for animations
      // This synchronizes with the dashboard's quantum identity system
      window.storedCoordinates = coordinates;
      
      // Calculate current Julian Day for astronomical alignment with dashboard
      const now = new Date();
      const julianDay = (now.getTime() / 86400000) + 2440587.5;
      window.currentJulianDay = julianDay;
      
      // Calculate normalized Julian Day for security calculations
      const normalizedJulianDay = julianDay % 1;
      
      // Calculate planetary factors based on v0.3.2 dashboard model
      const planetaryFactors = {
          mercury: normalizedJulianDay * 4.152,  // Mercury: ~88 day orbit
          venus: normalizedJulianDay * 1.624,    // Venus: ~225 day orbit
          earth: normalizedJulianDay,            // Earth: 365.25 day orbit
          mars: normalizedJulianDay * 0.532      // Mars: ~687 day orbit
      };
      
      // Generate security harmonics based on prime numbers and planetary positions
      const p1 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[0]) * (1 + Math.sin(planetaryFactors.mercury) * 0.2);
      const p2 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[1]) * (1 + Math.sin(planetaryFactors.venus) * 0.2);
      const p3 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[2]) * (1 + Math.sin(planetaryFactors.earth) * 0.2);
      const p4 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[3]) * (1 + Math.sin(planetaryFactors.mars) * 0.2);
      
      // Calculate token value using golden ratio weighted mixing
      const tokenValue = (p1 * p2 * 0.5) + (p3 * p4 * (1/window.PHI) * 0.5);
      
      // Update security properties with current astronomical values
      window.securityProperties = {
          harmonics: [p1, p2, p3, p4],
          position: {
              x: p1 * p4,
              y: p2 * p3,
              z: tokenValue
          },
          signature: (p1 + p2) / (p3 + p4 + 0.00001),
          penroseSeed: Math.abs(p1 * p3 * window.PHI),
          hilbertDepth: 3 + Math.floor(Math.abs(tokenValue) * 2)
      };
      
      // Update security status for dashboard integration
      window.securityStatus.astronomicalSync = {
          julianDay: julianDay,
          updateTime: Date.now()
      };
      window.securityStatus.quantumIdentity = {
          penroseSeed: window.securityProperties.penroseSeed,
          rotationValue: normalizedJulianDay * 360 + p1 * 20,
          updateTime: Date.now()
      };
      window.securityStatus.tokenValue = tokenValue;
      
      // Log the URL we're about to fetch
      const url = `${API_ENDPOINT}?date=${date}&lat=${lat}&lon=${lon}`;
      console.log("Fetching from URL:", url);
      
      const infoPanel = $("#info-panel");
  
      infoPanel.html(`
          <h4>Retrieving Astronomical Data...</h4>
          <div class="spinner"></div>
      `).fadeIn();
      
      // Just a placeholder comment - we'll use a simple mock data object directly in the catch block
  
      // Improved fetch with explicit mode and headers
      return fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
      })
          .then(response => {
              // Print raw response status and headers for debugging
              console.log("Response status:", response.status);
              console.log("Response type:", response.type);
              console.log("Response URL:", response.url);
              
              if (!response.ok) {
                  // Get detailed error message from response if available
                  return response.json().then(errorData => {
                      throw new Error(errorData.error || response.statusText);
                  }).catch(() => {
                      // If can't parse error JSON, use status text
                      throw new Error(response.statusText);
                  });
              }
              return response.json();
          })
          .then(data => {
              if (!data || !data.astronomicalData) throw new Error("Invalid data format received.");
  
              // Store the astronomical data globally for use in animation
              window.storedAstronomicalData = data.astronomicalData;
              console.log("Stored astronomical data:", window.storedAstronomicalData);
              
              // Format the date for more readable display
              const formattedDate = new Date(Y, M, date.split('.')[0]).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              });
              
              // Safely format coordinates
              const latText = coordinates && coordinates.latitude ? coordinates.latitude.toFixed(5) : "Unknown";
              const lonText = coordinates && coordinates.longitude ? coordinates.longitude.toFixed(5) : "Unknown";
              
              // Enhanced ephemeris data display with more astronomical information
              infoPanel.html(`
                  <h4>Astronomical Data</h4>
                  <p class="coordinates">Location: ${latText}°N, ${lonText}°E</p>
                  <p class="date">${formattedDate}</p>
                  <div class="astronomical-display">
                    <div class="planet-row">
                      <span class="planet-name">Sun:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Sun.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Sun.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Sun.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Moon:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Moon.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Moon.latitude.toFixed(2)}° 
                        · Dist: ${(data.astronomicalData.Moon.distance * 384400).toFixed(0)} km
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Mercury:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Mercury.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Mercury.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Mercury.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Venus:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Venus.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Venus.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Venus.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Mars:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Mars.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Mars.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Mars.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Jupiter:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Jupiter.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Jupiter.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Jupiter.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Saturn:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Saturn.longitude.toFixed(2)}° 
                        · Lat: ${data.astronomicalData.Saturn.latitude.toFixed(2)}° 
                        · Dist: ${data.astronomicalData.Saturn.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row" style="color: rgba(65, 105, 225, 0.95);">
                      <span class="planet-name">Node:</span>
                      <span class="planet-data">
                        Long: ${data.astronomicalData.Node ? data.astronomicalData.Node.longitude.toFixed(2) : "0.00"}° 
                        · Lat: 0.00°
                      </span>
                    </div>
                  </div>
                  <div class="astronomical-notes">
                    <p>Geocentric longitudes represent planetary positions as seen from Earth.</p>
                    <p>1 AU (Astronomical Unit) = 149,597,870.7 km</p>
                  </div>
                  <p><small>Click this panel to continue</small></p>
              `).css({
                  position: 'fixed',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 120
              });
              return data.astronomicalData;
          })
          .catch(error => {
              console.error("Error fetching astronomical data:", error);
              
              // Show error message and retry option
              infoPanel.html(`
                  <h4>Error: Unable to Fetch Astronomical Data</h4>
                  <p>Could not connect to the ephemeris service: ${error.message}</p>
                  <p>Please ensure your connection is active and try again.</p>
                  <button id="retry-fetch" class="retry-button">Retry Connection</button>
              `).css({
                  position: 'fixed',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 120
              });
              
              // Add retry button handler
              $("#retry-fetch").on("click", function() {
                  infoPanel.html(`
                      <h4>Retrying Connection...</h4>
                      <div class="spinner"></div>
                  `);
                  
                  // Try fetching the data again
                  setTimeout(() => {
                      fetchAstronomicalData(`${DD}.${M+1}.${Y}`, coordinates)
                          .then(data => {
                              window.storedCoordinates = coordinates;
                              window.storedAstronomicalData = data;
                              
                              // Toggle data display to show the new data
                              clickSequence = 0;
                              toggleDataDisplay();
                          });
                  }, 1000);
              });
              
              // Rethrow the error to stop the flow
              throw error;
          });
  }
  
  // High accuracy location function for precise astronomical calculations
  function getHighAccuracyLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      
      // Options for maximum accuracy
      const options = {
        enableHighAccuracy: true,  // Request the most accurate position
        timeout: 10000,            // Time to wait before error (ms)
        maximumAge: 0              // Don't use cached position
      };
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,  // Accuracy radius in meters
            timestamp: position.timestamp,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          resolve(locationData);
        },
        error => {
          reject(error);
        },
        options
      );
    });
  }

  // Function to retrieve and display the user's geolocation
  function displayLocation() {
      const infoPanel = $("#info-panel");
  
      // Show initial message with a spinner
      infoPanel.html(`
          <h4>Retrieving Coordinates...</h4>
          <div class="spinner"></div>
      `).fadeIn();
  
      return new Promise((resolve, reject) => {
          function success(position) {
              const { latitude, longitude } = position.coords;
              
              console.log("Retrieved coordinates:", latitude, longitude);
  
              // Update info panel with coordinates and fetching message
              infoPanel.html(`
                  <h4>Astronomical Data</h4>
                  <p>Latitude: ${latitude.toFixed(5)}</p>
                  <p>Longitude: ${longitude.toFixed(5)}</p>
                  <div id="astronomical-data" class="json-view"></div>
              `);
  
              // Ensure coordinates are correctly formatted and stored
              const coordinates = { 
                  latitude: parseFloat(latitude), 
                  longitude: parseFloat(longitude),
                  lat: parseFloat(latitude),  // Adding additional properties for compatibility
                  lon: parseFloat(longitude)
              };
              
              console.log("Resolved coordinates object:", coordinates);
              resolve(coordinates);
          }
  
          function error(err) {
              console.error("Geolocation error:", err);
              
              infoPanel.html(`
                  <h4>Location Access</h4>
                  <p>Accurate astronomical positioning requires your location.</p>
                  <p>Error: ${err.message || 'Unknown error'}</p>
                  <p><button id="retry-geolocation" class="retry-button">Try Again</button></p>
                  <p><button id="use-default-location" class="default-button">Use Default Location</button></p>
              `).fadeIn();
              
              // Add a retry button for geolocation
              $("#retry-geolocation").on("click", function() {
                  infoPanel.html(`
                      <h4>Retrieving Coordinates...</h4>
                      <div class="spinner"></div>
                  `);
                  
                  // Try getting location again
                  navigator.geolocation.getCurrentPosition(
                      success, 
                      err => {
                          console.error("Retry geolocation failed:", err);
                          infoPanel.html(`
                              <h4>Location Access</h4>
                              <p>Unable to get your location.</p>
                              <p>Error: ${err.message || 'Unknown error'}</p>
                              <p><button id="retry-geolocation" class="retry-button">Try Again</button></p>
                              <p><button id="use-default-location" class="default-button">Use Default Location</button></p>
                          `);
                          
                          // Re-add the default location button
                          $("#use-default-location").on("click", useDefaultLocation);
                      }, 
                      options
                  );
              });
              
              // Function to use default location
              function useDefaultLocation() {
                  console.log("Using default location");
                  
                  // Use Greenwich Observatory as default location
                  const defaultLatitude = 51.4778;
                  const defaultLongitude = -0.0015;
                  
                  infoPanel.html(`
                      <h4>Using Default Location</h4>
                      <p>Using Greenwich Observatory coordinates for calculations.</p>
                      <p>Latitude: ${defaultLatitude.toFixed(5)}</p>
                      <p>Longitude: ${defaultLongitude.toFixed(5)}</p>
                  `);
                  
                  // Create a coordinates object with the default values
                  const coordinates = {
                      latitude: defaultLatitude,
                      longitude: defaultLongitude,
                      lat: defaultLatitude,
                      lon: defaultLongitude,
                      isDefault: true // Flag that this is a default location
                  };
                  
                  resolve(coordinates);
              }
              
              // Add event handler for default location button
              $("#use-default-location").on("click", useDefaultLocation);
          }
  
          if (navigator.geolocation) {
              // Use the high accuracy location function
              getHighAccuracyLocation()
                  .then(locationData => {
                      // Create a position-like object that matches what success expects
                      const position = {
                          coords: {
                              latitude: locationData.latitude,
                              longitude: locationData.longitude
                          }
                      };
                      // Call the success handler with our position data
                      success(position);
                  })
                  .catch(err => {
                      // Pass any errors to the error handler
                      error(err);
                  });
          } else {
              error(new Error("Geolocation not supported by this browser"));
          }
      });
  }
  
  const zodiacs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  function displayZodiacAroundDial(userLongitude) {
      // Consistent normalization approach from v0.3.1
      const normalized = parseFloat(userLongitude) + 180; // Convert from -180/180 to 0/360
      const startingIndex = Math.floor(normalized / 30) % 12;
  
      // Clear any existing labels to prevent duplication
      $("#degree .zodiac-label").remove();
      
      // Make sure the zodiac wireframe is properly sized to match the astronomical display
      // The outer circumference should match the astronomical display circumference
      const zodiacWireframe = $("#zodiac-wireframe");
      
      // Set size and position for zodiac wireframe to match outer circumference
      zodiacWireframe.css({
          width: '650px',
          height: '650px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.3,  // Make wireframe slightly visible but subtle
          zIndex: 140
      });
      
      // Add tick marks to the zodiac wireframe instead of body
      // This ensures they rotate with the wireframe during animation
      
      // First, let's modify our approach entirely
      // Instead of creating a separate container, we'll add tick marks directly to the zodiac wireframe
      // which already has the correct positioning and rotation behavior
      
      // Use the zodiacWireframe reference that was declared above
      
      // Set additional properties for the tick marks
      // (reusing the existing zodiacWireframe styling from above)
      zodiacWireframe.css({
          pointerEvents: 'none' // Only add properties that don't conflict with the existing styling
      });
      
      // Add ticks to the zodiac wireframe directly
      for (let i = 0; i < 12; i++) {
          // Create a tick mark for each 30-degree sector
          const angle = i * 30;
          
          // Create a container for better positioning of the tick mark
          const tickContainer = $("<div>", {
              "class": "zodiac-tick-container",
              css: {
                  position: "absolute",
                  width: "0",
                  height: "0",
                  left: "50%",
                  top: "50%",
                  // This rotation ensures perfect radial alignment with sector edge
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "center"
              }
          });
          
          // Create the actual tick mark
          const tick = $("<div>", {
              "class": "zodiac-tick",
              css: {
                  position: "absolute",
                  width: "3px",
                  height: "23px",
                  backgroundColor: "rgba(97, 218, 251, 0.85)",
                  // Position 16px closer to center from the middle of the blue band
                  top: "-291px", // Moved 16px inward from 307px
                  left: "-1.5px", // Center the tick horizontally (half of the 3px width)
                  boxShadow: "0 0 4px rgba(97, 218, 251, 0.7)",
                  borderRadius: "1px"
                  // Animation removed
              }
          });
          
          // Add tick to container, then container to wireframe
          tickContainer.append(tick);
          
          // Add container to the zodiac wireframe
          zodiacWireframe.append(tickContainer);
      }
      
      // No need to store a reference to a ticks container - ticks are directly on zodiac wireframe
      
      // Get astronomical data for accurate Node position
      // The Lunar Node (where the Moon's orbit crosses the ecliptic)
      // Calculate dynamically but use fixed latitude of 0°
      let trueNodeAngle;
      
      if (window.storedAstronomicalData && window.storedAstronomicalData.Node) {
          // Use actual ephemeris data if available
          trueNodeAngle = window.storedAstronomicalData.Node.longitude;
          console.log("Using ephemeris data for Node position:", trueNodeAngle);
      } else {
          // Calculate an approximation based on date
          const now = new Date();
          const yearFraction = now.getFullYear() + (now.getMonth() / 12);
          // Node completes full cycle every 18.6 years (retrograde motion)
          const nodeCycle = (yearFraction % 18.6) / 18.6;
          trueNodeAngle = 360 - (nodeCycle * 360); // Retrograde motion
          console.log("Calculating approximate Node position:", trueNodeAngle);
          
          // Store this for later use
          if (!window.storedAstronomicalData) window.storedAstronomicalData = {};
          window.storedAstronomicalData.Node = { 
              longitude: trueNodeAngle, 
              latitude: 0 // Node is defined as intersection with ecliptic, so latitude is 0
          };
      }
      
      // First remove any existing True Node markers to prevent duplicates
      $("#true-node-marker").remove();
      
      // Create container for True Node tick - add to clock directly for proper alignment
      const trueNodeContainer = $("<div>", {
          "class": "true-node-container",
          "id": "true-node-marker",
          css: {
              position: "absolute",
              width: "0",
              height: "0",
              left: "258px", // Center X of clock
              top: "258px",  // Center Y of clock
              transform: `rotate(${trueNodeAngle}deg)`,
              transformOrigin: "center",
              zIndex: 155,   // Higher than zodiac wireframe
              pointerEvents: "none" // Don't interfere with clicks
          }
      });
      
      // Create the Node tick - using a brighter azure/indigo color
      const trueNodeTick = $("<div>", {
          "class": "true-node-tick permanent-marker",
          css: {
              position: "absolute",
              width: "3px",      // Thinner for subtlety
              height: "28px",    // Shorter for subtlety
              backgroundColor: "rgba(65, 105, 225, 0.8)", // Royal blue / azure color
              top: "-291px",
              left: "-1.5px",    // Center horizontally
              boxShadow: "0 0 6px rgba(65, 105, 225, 0.6)", // Brighter glow
              borderRadius: "1px",
              opacity: 0         // Start invisible, will fade in
          }
      });
      
      // Add a label for the Node - matching planet label style
      const trueNodeLabel = $("<div>", {
          "class": "true-node-label planet-label", // Add planet-label class so it fades with others
          css: {
              position: "absolute",
              top: "-320px",     // Position it above the tick
              left: "0",
              transform: "translate(-50%, -100%) rotate(90deg)",
              color: "white",    // Match planet label color
              textShadow: "0 0 5px rgba(97, 218, 251, 0.6)", // Match planet label shadow
              fontSize: "12px",  // Match planet label size
              fontWeight: "bold", // Match planet label style
              whiteSpace: "nowrap",
              opacity: 0          // Start invisible, will fade in
          },
          text: "Node"
      });
      
      // Add tick and label to container
      trueNodeContainer.append(trueNodeTick);
      trueNodeContainer.append(trueNodeLabel);
      
      // Add to clock which will maintain proper positioning
      $("#clock").append(trueNodeContainer);
      
      // Zenith marker removed as requested

      // Fade in Node elements after the zodiac rotation completes
      setTimeout(() => {
          $(".true-node-tick, .true-node-label").fadeTo(1500, 1);
      }, 3500); // Match the planet marker delay
      
      // Add zodiac labels with proper radial alignment
      zodiacs.forEach((zodiac, index) => {
          const zodiacIndex = (startingIndex + index) % 12;
          
          // Create a container for proper radial alignment
          // Position at exact sector angle (not center)
          const sectorAngle = index * 30; // Align with sector edge, matching tick marks
          
          const labelContainer = $("<div>", {
              "class": "zodiac-label-container",
              css: {
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${sectorAngle}deg)`, // Align with sector edge
                  transformOrigin: 'center',
                  width: '0',
                  height: '0'
              }
          });
          
          // Create the actual label element
          const labelElement = $(`<div class="zodiac-label">${zodiacs[zodiacIndex]}</div>`);
  
          // Calculate optimal radial distance - moved inward by 43px (original 23px + 20px more)
          const labelDistance = 275; // Original 295px moved inward by 43px
          
          // For proper sector alignment, we position 15 degrees offset from radial line
          // This puts the label in the middle of the sector while aligning with sector edge
          const labelOffsetX = Math.sin(15 * Math.PI / 180) * labelDistance * 0.5;
  
          // Apply styles for TANGENTIAL text orientation - text follows the curve of the zodiac wheel
          labelElement.css({
              position: 'absolute',
              left: `${labelOffsetX}px`, // Offset to center in sector 
              top: `-${labelDistance}px`, // Position at the specified distance from center
              // Rotate 90 degrees to be tangential to the wheel
              transform: 'translate(-50%, -50%) rotate(96deg)',
              textAlign: 'center',
              width: 'auto',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 0 5px rgba(97, 218, 251, 0.8)',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
          });
          
          // Add label to container, then container to degree dial
          labelContainer.append(labelElement);
          $("#degree").append(labelContainer);
      });
      
      // Show zodiac wireframe with zero opacity for the container, but keep ticks visible
      zodiacWireframe.css({
          display: 'block',
          opacity: 0,  // Make the wireframe itself completely invisible
          border: 'none' // Ensure no border is shown
      });
      
      // Make all zodiac sector lines transparent
      $(".zodiac-sector").css({
          backgroundColor: 'transparent',
          border: 'none'
      });
      
      // Fade out all zodiac labels after 12 seconds (increased for better visibility)
      setTimeout(() => {
          $(".zodiac-label").fadeOut(1500); // Fade out over 1.5 seconds
      }, 12000);
  }
  
  function toggleZodiacRingVisibility() {
      const zodiacRing = document.getElementById('zodiac-wireframe');
      
      // Check if the zodiacRing element exists
      if (!zodiacRing) {
          console.error("Zodiac ring element with ID 'zodiac-wireframe' not found.");
          return; // Exit the function if element is not found
      }
  
      const isClipped = zodiacRing.classList.contains('clipped'); // Check if clipped
  
      if (isClipped) {
          // Remove clip-path and mask-image to show the entire ring
          zodiacRing.style.clipPath = 'none';
          zodiacRing.style.maskImage = 'none';
      } else {
          // Apply mask to show zodiac only as tick marks on the blue ribbon
          // The outer radius (325px) matches the outer edge of the blue ribbon
          // The inner radius (270px) matches the inner edge of the blue ribbon
          // This creates the effect of tick marks appearing only on the blue band
          zodiacRing.style.clipPath = 'circle(325px at center)';
          zodiacRing.style.maskImage = 'radial-gradient(circle 325px at center, transparent 270px, white 270px, white 325px, transparent 326px)';
          zodiacRing.style.width = '650px';
          zodiacRing.style.height = '650px';
      }
  
      zodiacRing.classList.toggle('clipped'); // Toggle the clipped state
  }
  
  // Track the click sequence - starts at 0 (initial), 1 (first click), 2 (second click)
  let clickSequence = 0;
  let dataFetched = false;
  
  // Toggle function to display/hide overlay and animate markers
  function toggleDataDisplay() {
      console.log("toggleDataDisplay called, clickSequence =", clickSequence);
      const infoPanel = $("#info-panel");
      const earthWireframe = $("#earth-wireframe");
      const logo = $("h1#center");
      const zodiacWireframe = $("#zodiac-wireframe");
  
      // Reset if we're in the middle of animation
      if ($(".planet-label:not(.earth-label)").length > 0) {
          console.log("Resetting animation sequence");
          
          // Use the central cleanup function to properly remove animation elements
          cleanup(); // Remove all animation elements except Earth label
          
          // Make sure the clock face and casing are visible
          $("#clock").removeClass("off").addClass("glass-visible");
          
          // Keep the center logo visible
          $("h1").css("opacity", 1);
          
          // Reset click sequence
          clickSequence = 0;
          
          // Keep the longitude alignment - don't reset LONG_ALIGNED
          // Don't reset the year dial rotation - keep it aligned with longitude
          
          // Log memory usage for debugging
          console.log("Animation sequence reset complete. States:", {
              clickSequence,
              longAligned: LONG_ALIGNED,
              storedCoordinates: window.storedCoordinates ? true : false,
              storedAstronomicalData: window.storedAstronomicalData ? true : false
          });
          
          return; // Exit the function early
      }
      
      // Increment click sequence
      clickSequence++;
      console.log("Click sequence incremented to:", clickSequence);
      
      // First click: Ephemeris query 
      if (clickSequence === 1) {
          console.log("First click detected - initiating ephemeris query");
          
          // Keep the clock fully visible 
          $("#clock").addClass("glass-visible"); // Keep full visibility for the timepiece
          
          // Keep the center logo visible initially (until we show earth wireframe)
          $("h1").css("opacity", 1);
          
          // Hide the tau symbol immediately when ephemeris query begins
          $("#v4-center").fadeOut(300).css({ opacity: 0, display: 'none' });
          
          // Keep the Earth marker hidden until animation begins with other planet markers
          $("#star-center").addClass("hidden")
              .removeClass("pulsing")
              .css({
                  opacity: 0,
                  display: 'none',
                  transform: 'translate(-50%, -50%) scale(0)',
                  zIndex: 210
              });
              
          // Add Earth wireframe behind the data panel (lower z-index)
          earthWireframe
              .removeClass("hidden")
              .css({ opacity: 0, zIndex: 90 }) // Lower z-index so it appears behind data panel
              .fadeTo(800, 0.8);
          
          // If we already have data stored, use it
          if (window.storedCoordinates && window.storedAstronomicalData) {
              console.log("Using previously stored data");
              
              // Show info panel with the existing data
              infoPanel.html(`
                  <h4>Astronomical Data</h4>
                  <p class="coordinates">Location: ${window.storedCoordinates.latitude.toFixed(5)}°N, ${window.storedCoordinates.longitude.toFixed(5)}°E</p>
                  <div class="astronomical-display">
                    <div class="planet-row">
                      <span class="planet-name">Sun:</span>
                      <span class="planet-data">
                        Long: ${window.storedAstronomicalData.Sun.longitude.toFixed(2)}° 
                        · Lat: ${window.storedAstronomicalData.Sun.latitude.toFixed(2)}° 
                        · Dist: ${window.storedAstronomicalData.Sun.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Moon:</span>
                      <span class="planet-data">
                        Long: ${window.storedAstronomicalData.Moon.longitude.toFixed(2)}° 
                        · Lat: ${window.storedAstronomicalData.Moon.latitude.toFixed(2)}° 
                        · Dist: ${(window.storedAstronomicalData.Moon.distance * 384400).toFixed(0)} km
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Mercury:</span>
                      <span class="planet-data">
                        Long: ${window.storedAstronomicalData.Mercury.longitude.toFixed(2)}° 
                        · Lat: ${window.storedAstronomicalData.Mercury.latitude.toFixed(2)}° 
                        · Dist: ${window.storedAstronomicalData.Mercury.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Venus:</span>
                      <span class="planet-data">
                        Long: ${window.storedCelestialData.Venus.longitude.toFixed(2)}° 
                        · Lat: ${window.storedCelestialData.Venus.latitude.toFixed(2)}° 
                        · Dist: ${window.storedCelestialData.Venus.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Mars:</span>
                      <span class="planet-data">
                        Long: ${window.storedCelestialData.Mars.longitude.toFixed(2)}° 
                        · Lat: ${window.storedCelestialData.Mars.latitude.toFixed(2)}° 
                        · Dist: ${window.storedCelestialData.Mars.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Jupiter:</span>
                      <span class="planet-data">
                        Long: ${window.storedCelestialData.Jupiter.longitude.toFixed(2)}° 
                        · Lat: ${window.storedCelestialData.Jupiter.latitude.toFixed(2)}° 
                        · Dist: ${window.storedCelestialData.Jupiter.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row">
                      <span class="planet-name">Saturn:</span>
                      <span class="planet-data">
                        Long: ${window.storedCelestialData.Saturn.longitude.toFixed(2)}° 
                        · Lat: ${window.storedCelestialData.Saturn.latitude.toFixed(2)}° 
                        · Dist: ${window.storedCelestialData.Saturn.distance.toFixed(4)} AU
                      </span>
                    </div>
                    <div class="planet-row" style="color: rgba(65, 105, 225, 0.95);">
                      <span class="planet-name">Node:</span>
                      <span class="planet-data">
                        Long: ${window.storedCelestialData.Node ? window.storedCelestialData.Node.longitude.toFixed(2) : "0.00"}° 
                        · Lat: 0.00°
                      </span>
                    </div>
                  </div>
                  <div class="astronomical-notes">
                    <p>Geocentric longitudes represent planetary positions as seen from Earth.</p>
                    <p>1 AU (Astronomical Unit) = 149,597,870.7 km</p>
                  </div>
                  <p><small>Click to continue...</small></p>
              `);
              infoPanel.css({
                  position: 'fixed',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 120,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }).fadeIn();
              
              // Logo stays visible behind the data panel and earth wireframe
              logo.css({
                  opacity: 0.4,
                  zIndex: 85
              });
              
              // Set panel to dismiss on click and start animation
              infoPanel.off("click").on("click", function() {
                  console.log("Info panel clicked, starting animation with stored data");
                  // First hide the panel
                  $(this).fadeOut(500, function() {
                      // Remove panel from DOM after animation to prevent duplicates
                      $(this).remove();
                  });
                  
                  // Make Earth wireframe fully visible now
                  earthWireframe
                      .css({ zIndex: 150, display: 'block' })
                      .fadeTo(500, 1);
                  
                  // Fade out the logo completely and ensure it stays invisible
                  logo.fadeOut(500).css({ opacity: 0, display: 'none' });
                  
                  // Earth marker will be shown during the planet animation
                  // Keep it hidden until the animation begins
                  $("#star-center").addClass("hidden")
                      .removeClass("pulsing")
                      .css({
                          opacity: 0,
                          display: 'none',
                          transform: 'translate(-50%, -50%) scale(0)'
                      });
                  
                  // Update security properties with latest astronomical data for dashboard sync
                  const now = new Date();
                  const julianDay = (now.getTime() / 86400000) + 2440587.5;
                  const normalizedJulianDay = julianDay % 1;
                  
                  // Calculate planetary factors based on updated Julian Day
                  const planetaryFactors = {
                      mercury: normalizedJulianDay * 4.152,
                      venus: normalizedJulianDay * 1.624,
                      earth: normalizedJulianDay,
                      mars: normalizedJulianDay * 0.532
                  };
                  
                  // Update harmonics with latest values
                  const p1 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[0]) * (1 + Math.sin(planetaryFactors.mercury) * 0.2);
                  const p2 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[1]) * (1 + Math.sin(planetaryFactors.venus) * 0.2);
                  const p3 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[2]) * (1 + Math.sin(planetaryFactors.earth) * 0.2);
                  const p4 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[3]) * (1 + Math.sin(planetaryFactors.mars) * 0.2);
                  
                  // Calculate token value using golden ratio weighted mixing
                  const tokenValue = (p1 * p2 * 0.5) + (p3 * p4 * (1/window.PHI) * 0.5);
                  
                  // Calculate rotation based on astronomical time - matching dashboard formula
                  window.calculatedRotation = normalizedJulianDay * 360 + p1 * 20;
                  
                  // Update security status for dashboard integration
                  window.securityStatus.astronomicalSync = {
                      julianDay: julianDay,
                      updateTime: Date.now()
                  };
                  window.securityStatus.quantumIdentity = {
                      penroseSeed: Math.abs(p1 * p3 * window.PHI),
                      rotationValue: window.calculatedRotation,
                      updateTime: Date.now()
                  };
                  window.securityStatus.tokenValue = tokenValue;
                  
                  // Create TAUDashboard namespace for compatibility if not exists
                  if (!window.TAUDashboard) {
                      window.TAUDashboard = {};
                  }
                  
                  // Set constants for dashboard compatibility
                  window.TAUDashboard.constants = {
                      PHI: window.PHI,
                      TWO_PI: window.TWO_PI,
                      PRIMES: window.PRIMES
                  };
                  
                  // Share security status with dashboard
                  window.TAUDashboard.securityStatus = window.securityStatus;
                  
                  // Add dashboard utility functions for compatibility
                  if (!window.TAUDashboard.updateJulianDay) {
                      window.TAUDashboard.updateJulianDay = function(julianDay) {
                          window.currentJulianDay = julianDay;
                          window.securityStatus.astronomicalSync.julianDay = julianDay;
                          window.securityStatus.astronomicalSync.updateTime = Date.now();
                      };
                  }
                  
                  if (!window.TAUDashboard.updateRotation) {
                      window.TAUDashboard.updateRotation = function(rotation) {
                          window.calculatedRotation = rotation;
                          window.securityStatus.quantumIdentity.rotationValue = rotation;
                          window.securityStatus.quantumIdentity.updateTime = Date.now();
                      };
                  }
                      
                  // Start animation with stored data
                  animateMarkers(window.storedCoordinates, window.storedAstronomicalData);
                  zodiacWireframe.removeClass("hidden").fadeTo(3000, 1);
                  
                  // Set click sequence to 0 so next click resets
                  clickSequence = 0;
              });
              
          } else {
              // Need to fetch new data
              displayLocation()
                  .then(coordinates => {
                      if (!coordinates) throw new Error("Coordinates not available");
                      console.log("Obtained coordinates:", coordinates);
      
                      infoPanel.html(`
                          <h4>Retrieving Astronomical Data...</h4>
                          <div class="spinner"></div>
                      `);
                      infoPanel.css({
                          zIndex: 120,
                          backgroundColor: 'rgba(0, 0, 0, 0.8)'
                      }).fadeIn();
                      
                      // Logo stays visible behind the data panel and earth wireframe
                      logo.css({
                          opacity: 0.4,
                          zIndex: 85
                      });
      
                      return fetchAstronomicalData(`${DD}.${M+1}.${Y}`, coordinates)
                          .then(astronomicalData => {
                              console.log("Received astronomical data:", astronomicalData);
                              return { coordinates, astronomicalData };
                          });
                  })
                  .then(({ coordinates, astronomicalData }) => {
                      console.log("Setting up info panel click handler with data");
                      // Store data globally for use in animations
                      window.storedCoordinates = coordinates;
                      window.storedAstronomicalData = astronomicalData;
                      
                      // Update info panel with data summary
                      infoPanel.html(`
                          <h4>Astronomical Data</h4>
                          <p class="coordinates">Location: ${coordinates.latitude.toFixed(5)}°N, ${coordinates.longitude.toFixed(5)}°E</p>
                          <p class="date">${new Date().toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                          })}</p>
                          <div class="astronomical-display">
                            <div class="planet-row">
                              <span class="planet-name">Sun:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Sun.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Sun.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Sun.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Moon:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Moon.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Moon.latitude.toFixed(2)}° 
                                · Dist: ${(astronomicalData.Moon.distance * 384400).toFixed(0)} km
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Mercury:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Mercury.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Mercury.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Mercury.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Venus:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Venus.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Venus.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Venus.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Mars:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Mars.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Mars.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Mars.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Jupiter:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Jupiter.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Jupiter.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Jupiter.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row">
                              <span class="planet-name">Saturn:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Saturn.longitude.toFixed(2)}° 
                                · Lat: ${astronomicalData.Saturn.latitude.toFixed(2)}° 
                                · Dist: ${astronomicalData.Saturn.distance.toFixed(4)} AU
                              </span>
                            </div>
                            <div class="planet-row" style="color: rgba(65, 105, 225, 0.95);">
                              <span class="planet-name">Node:</span>
                              <span class="planet-data">
                                Long: ${astronomicalData.Node ? astronomicalData.Node.longitude.toFixed(2) : "0.00"}° 
                                · Lat: 0.00°
                              </span>
                            </div>
                          </div>
                          <div class="astronomical-notes">
                            <p>Geocentric longitudes represent planetary positions as seen from Earth.</p>
                            <p>1 AU (Astronomical Unit) = 149,597,870.7 km</p>
                          </div>
                          <p class="click-instruction"><small>Click to continue...</small></p>
                      `).css({
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(97, 218, 251, 0.4)'
                      });
                      
                      // Set panel to dismiss on click, which triggers marker animation
                      infoPanel.off("click").on("click", function(e) {
                          console.log("Info panel clicked, starting animation");
                          e.stopPropagation(); // Prevent click from bubbling
                          
                          // Add pulsing effect before fadeout
                          $(this).addClass("panel-clicked");
                          
                          // Keep the tau symbol visible until animation begins
                          // We'll do the tau-to-earth transition during animation
                          
                          // Wait a moment before fading out to show the click effect
                          setTimeout(() => {
                              $(this).fadeOut(800, function() {
                                  // Remove the panel completely from DOM after fade out
                                  $(this).remove();
                              }); // Fade out the info panel slower
                              
                              // Double check that we have valid data before starting animation
                              if (!window.storedCoordinates || !window.storedAstronomicalData) {
                                  console.error("Missing stored astronomical data or coordinates!");
                                  return;
                              }
                              
                              // Log the data we're using for transparency
                              console.log("Using stored coordinates:", window.storedCoordinates);
                              console.log("Using stored astronomical data:", window.storedAstronomicalData);
                              
                              // WAIT for panel to fade out before starting sequence
                              setTimeout(() => {
                                  // Make Earth wireframe fully visible now with higher z-index
                                  earthWireframe
                                      .css({ zIndex: 150 })
                                      .fadeTo(500, 1);
                                      
                                  // Completely hide the G-sync logo to ensure it stays invisible throughout the sequence
                                  // This enforces the security model in the astronomical visualization
                                  logo.fadeOut(500).css({ opacity: 0, display: 'none' });
                                  
                                  // Update security properties with latest astronomical data for dashboard sync
                                  const now = new Date();
                                  const julianDay = (now.getTime() / 86400000) + 2440587.5;
                                  const normalizedJulianDay = julianDay % 1;
                                  
                                  // Recalculate planetary factors and harmonics
                                  const planetaryFactors = {
                                      mercury: normalizedJulianDay * 4.152,
                                      venus: normalizedJulianDay * 1.624,
                                      earth: normalizedJulianDay,
                                      mars: normalizedJulianDay * 0.532
                                  };
                                  
                                  // Update harmonics with latest values - crucial for security sync
                                  const p1 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[0]) * (1 + Math.sin(planetaryFactors.mercury) * 0.2);
                                  const p2 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[1]) * (1 + Math.sin(planetaryFactors.venus) * 0.2);
                                  const p3 = Math.sin(normalizedJulianDay * window.TWO_PI * window.PRIMES[2]) * (1 + Math.sin(planetaryFactors.earth) * 0.2);
                                  const p4 = Math.cos(normalizedJulianDay * window.TWO_PI * window.PRIMES[3]) * (1 + Math.sin(planetaryFactors.mars) * 0.2);
                                  
                                  // Update global security properties exactly matching dashboard math
                                  window.securityProperties.harmonics = [p1, p2, p3, p4];
                                  window.securityProperties.position = {
                                      x: p1 * p4,
                                      y: p2 * p3,
                                      z: (p1 * p2 * 0.5) + (p3 * p4 * (1/window.PHI) * 0.5)
                                  };
                                  window.securityProperties.signature = (p1 + p2) / (p3 + p4 + 0.00001);
                                  window.securityProperties.penroseSeed = Math.abs(p1 * p3 * window.PHI);
                                  
                                  // Calculate token value using golden ratio weighted mixing
                                  const tokenValue = (p1 * p2 * 0.5) + (p3 * p4 * (1/window.PHI) * 0.5);
                                  
                                  // Calculate rotation matching dashboard formula
                                  window.calculatedRotation = normalizedJulianDay * 360 + p1 * 20;
                                  
                                  // Update security status for dashboard integration
                                  window.securityStatus.astronomicalSync = {
                                      julianDay: julianDay,
                                      updateTime: Date.now()
                                  };
                                  window.securityStatus.quantumIdentity = {
                                      penroseSeed: window.securityProperties.penroseSeed,
                                      rotationValue: window.calculatedRotation,
                                      updateTime: Date.now()
                                  };
                                  window.securityStatus.tokenValue = tokenValue;
                                  
                                  // Share security status with dashboard
                                  if (!window.TAUDashboard) window.TAUDashboard = {};
                                  window.TAUDashboard.securityStatus = window.securityStatus;
              
                                  // FIXED: Do not show zodiac wireframe yet
                                  // It will be shown by animateMarkers at the correct time
                                  zodiacWireframe
                                      .removeClass("hidden")
                                      .css({ opacity: 0, zIndex: 140, display: 'none' })
                                  
                                  // Start marker animation with the stored data
                                  animateMarkers(window.storedCoordinates, window.storedAstronomicalData); // Begin marker animation
                                  
                                  // Set click sequence to 0 so next click resets
                                  clickSequence = 0;
                              }, 800); // Match the panel fadeOut duration
                          }, 300); // Short delay to show click effect
                      });
                      dataFetched = true;
                  })
                  .catch(error => {
                      console.error("Error during data retrieval:", error);
                      
                      // Check if this is a geolocation error - if so, it's already handled in displayLocation()
                      if (error.message && error.message.includes("Geolocation")) {
                          // The displayLocation function will have already shown appropriate UI
                          // with options to retry or use default location
                          return;
                      }
                      
                      // For other types of errors, display a generic error message
                      infoPanel.html(`
                          <h4>Error: Unable to Retrieve Data</h4>
                          <p>${error.message || "Please try again later."}</p>
                          <p><small>Click to dismiss</small></p>`)
                      .on("click", function() {
                          $(this).fadeOut();
                          // Reset sequence on error
                          clickSequence = 0;
                          $("h1").removeClass("off");
                          $("#clock").removeClass("off");
                      });
                  });
          }
      } 
      // Second click: Show planets, zodiac names and wireframe Earth
      else if (clickSequence === 2) {
          console.log("Second click: Starting astronomical visualization sequence");
          
          // Keep the center logo visible and clock face visible
          $("h1").css("opacity", 1);
          $("#clock").removeClass("off").addClass("glass-visible");
          
          // If info panel is visible, don't auto-dismiss - wait for user click
          if (infoPanel.is(":visible")) {
              console.log("Info panel is visible - waiting for user to click it");
              
              // Add a pulsing effect to draw attention to the click instruction
              if (!infoPanel.hasClass("panel-attention")) {
                  infoPanel
                      .addClass("panel-attention")
                      .css({
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(97, 218, 251, 0.4)'
                      });
                  
                  // If there's no click instruction, add one
                  if (infoPanel.find(".click-instruction").length === 0) {
                      infoPanel.append(`
                          <p class="click-instruction"><small>👉 Click to begin animation</small></p>
                      `);
                  }
              }
              
              return; // Wait for the user to click the panel
          }
          
          // Apply special highlight class to indicate active visualization
          $("#clock").addClass("visualization-active");
          
          // Show Earth wireframe immediately with a quick fade-in
          earthWireframe
              .removeClass("hidden")
              .css({ opacity: 0, zIndex: 150 })
              .fadeTo(800, 1);$(".zodiac-label")
          
          // FIXED: Do not show zodiac wireframe yet
          // It will be shown by animateMarkers at the correct time
          zodiacWireframe
              .removeClass("hidden") 
              .css({ opacity: 0, zIndex: 140, display: 'none' });
          
          // Generate planet labels if not already present
          if ($(".planet-label").length === 0) {
              // If we already have the data stored, use it directly
              if (window.storedCoordinates && window.storedAstronomicalData) {
                  console.log("Using previously stored data for animation");
                  console.log("Coordinates:", window.storedCoordinates);
                  console.log("Astronomical data:", window.storedAstronomicalData);
                  
                  // Start the animation with the stored data
                  animateMarkers(window.storedCoordinates, window.storedAstronomicalData);
              } else {
                  // We need to fetch new data - this should only happen once
                  console.log("No stored data, fetching new data");
                  
                  // Show loading message
                  infoPanel.html(`
                      <h4>Retrieving Astronomical Data...</h4>
                      <div class="spinner"></div>
                  `).fadeIn();
                  
                  // Get location and data
                  displayLocation()
                    .then(coordinates => {
                        return fetchAstronomicalData(`${DD}.${M+1}.${Y}`, coordinates)
                            .then(data => {
                                // Store the data globally
                                window.storedCoordinates = coordinates;
                                window.storedAstronomicalData = data;
                                return data;
                            });
                    })
                    .then(data => {
                        console.log("Data fetched and stored, starting animation");
                        // Now start the animation with the stored data
                        animateMarkers(window.storedCoordinates, window.storedAstronomicalData);
                        // Fade out the info panel
                        infoPanel.fadeOut(1000);
                    })
                    .catch(error => {
                        console.error("Error during data retrieval:", error);
                        // Show error in info panel
                        infoPanel.html(`
                            <h4>Error Fetching Data</h4>
                            <p>${error.message || "Please try again."}</p>
                            <p><small>Click to close</small></p>
                        `).on("click", function() {
                            $(this).fadeOut();
                        });
                    });
              }
          } else {
              console.log("Planet labels already present, just showing them");
              // If we already have the labels, just make them visible
              $(".planet-label").fadeIn(1500);
          }
          
          // Keep the clock face and casing visible
          $("#clock").removeClass("off").addClass("glass-visible");
          
          // Reset the click sequence to start over
          clickSequence = 0;
          
          // Keep the longitude alignment - don't reset LONG_ALIGNED
          // Don't reset the year dial rotation - keep it aligned with longitude
      } else {
          // Reset the click sequence if it's not 1 or 2
          clickSequence = 0;
          console.log("Resetting click sequence");
          
          // If we're showing planet labels, hide them
          if ($(".planet-label").length > 0) {
              console.log("Removing planet labels");
              $(".planet-label").fadeOut(1000, function() {
                  $(this).remove();
              });
              
              // Hide the Earth and zodiac wireframes
              earthWireframe.fadeOut(1000);
              zodiacWireframe.fadeOut(1000);
              
              // Return to normal display
              $("#clock").removeClass("off").addClass("glass-visible");
              $("h1").removeClass("off").fadeIn(1000);
          }
      }
  }
  
  function rotateLongitudeDial(userLongitude) {
      console.log("rotateLongitudeDial called with: ", userLongitude, "clickSequence:", clickSequence);
      
      // Store the original longitude value for later reference
      window.userLongitude = userLongitude;
      
      // Convert longitude from [-180, 180] range to [0, 360] range
      const normalizedLongitude = parseFloat(userLongitude) + 180;
      
      // Calculate the rotation angle to precisely align with the current time
      // The +DEGREE_STEP ensures we align with the correct tick
      const rotationAngle = 360 - normalizedLongitude + DEGREE_STEP - 0.7;
      
      // Store the rotation angle for later reference
      window.longitudeRotationAngle = rotationAngle;
      
      // Show a simple floating notification about longitude alignment
      const notification = $("<div>")
          .addClass("longitude-notification")
          .html(`<strong>Aligning to Longitude:</strong> ${userLongitude.toFixed(2)}°`)
          .css({
              position: "fixed",
              top: "5%", 
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 30, 60, 0.8)",
              color: "#ffff40",
              padding: "8px 15px",
              borderRadius: "5px",
              zIndex: 1000,
              boxShadow: "0 0 10px rgba(255, 255, 64, 0.5)",
              opacity: 0,
              textAlign: "center",
              fontFamily: "'PT Mono', monospace",
              fontSize: "14px",
              pointerEvents: "none"
          })
          .appendTo("body");
      
      // Fade in the notification
      // notification.animate({ opacity: 1 }, 500);
      
      // Apply the rotation to the degree dial with smooth animation
      console.log(`Setting degree rotation to ${rotationAngle} degrees for animation`);

      // Temporarily make the *** marker more vibrant during rotation
      $("#degree li").each(function() {
        if ($(this).text() === "***") {
          $(this).css({
            color: '#ffff80',
            // textShadow: '0 0 15px #ffff80, 0 0 25px #ffff80',
            opacity: 1,
            //fontWeight: 'bold',
            // fontSize: '16px',
            transform: $(this).css('transform') + ' scale(1.2)'
          });
          
          // Add pulse animation to the marker during rotation
          // $(this).addClass('sun-pulse');
        }
      });
      
      // Use an even smoother animation for the rotation
      $("#degree").css({
          transition: 'transform 3.2s cubic-bezier(0.25, 0.1, 0.25, 1)',  // Slower, more elegant rotation
          transform: `rotate(${rotationAngle}deg)`
      });
      
      // Add a dramatic flash effect to the degree dial during rotation
      // $("#degree").addClass("highlight-rotation");

      // Calculate exact degree index to highlight based on current time
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Now apply the active class to the correct longitude degree
      // This must be done after the rotation completes
      highlightActiveLongitude(normalizedLongitude);
      
      // Show East indicator after rotation is complete
      toggleEastVisibility();
      
      // After rotation completes, highlight the correct longitude degree
      setTimeout(() => {
          $("#degree").removeClass("highlight-rotation");

          // Fade out the notification
          notification.fadeOut(1500, function() {
              $(this).remove();
          });
          
          // Reset the *** marker to normal styling - no special appearance
          // It should look like all other non-active degree markers
          $("#degree li").each(function() {
            if ($(this).text() === "***") {
              $(this).css({
                color: '',        // Reset to default color
                textShadow: '',   // Remove glow
                opacity: '',      // Reset opacity
                fontWeight: '',   // Reset font weight
                fontSize: ''      // Reset font size
              }).removeClass('sun-pulse').removeClass('active');
            }
          });
          
      }, 3200); // Match the rotation transition time
      
      // Set flag to true to prevent updateClock from changing it
      LONG_ALIGNED = true;
      
      return rotationAngle; // Return the angle for use in animation sequences
  }
  
  function highlightActiveLongitude(adjustedLongitude) {
      const degreeIndex = Math.floor(adjustedLongitude / 5); // Assuming 5° increments
  
      // Reset styling for all degree markers including the *** marker
      $("#degree li").each(function() {
        $(this).css({
          color: '',
          textShadow: '',
          opacity: '',
          fontWeight: '',
          fontSize: ''
        }).removeClass('sun-pulse');
      });
      
      // Remove active class from all degrees
      $("#degree li").removeClass("active");
      
      // Get the li element at the calculated index and add the active class
      const activeDegree = $("#degree li").eq(degreeIndex);
      activeDegree.addClass("active");
      
      // Apply specific styling to the active degree to make it stand out
      // This is the only marker that should have special styling
      activeDegree.css({
        color: '#ffff40',
        // textShadow: '0 0 15px #ffff40',
        opacity: 1,
        // fontWeight: 'bold'
      });
      
      // Log the active degree for debugging
      console.log(`Active degree set to: ${activeDegree.text()} (index: ${degreeIndex})`);
  }
  
  // Function to toggle visibility of #east-label
  function toggleEastVisibility() {
      // Get or create the east label
      let eastLabel = $("#east-label");
      
      // If it doesn't exist, create it outside the timepiece to the right
      if (eastLabel.length === 0) {
          eastLabel = $("<div>")
              .attr("id", "east-label")
              .text("EAST")
              .css({
                  position: 'absolute',
                  left: 'calc(50% + 350px)', // Position to the right of the timepiece
                  top: '50%',
                  transform: 'translate(0, -50%)',
                  color: 'white',
                  textShadow: '0 0 8px rgba(97, 218, 251, 0.8)',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  opacity: 0,
                  zIndex: 200,
                  display: 'none'
              })
              .appendTo("body");
      } else {
          // Update position of existing label to ensure it's outside the timepiece
          eastLabel.css({
              left: 'calc(50% + 350px)', // Position to the right of the timepiece
              top: '50%',
              transform: 'translate(0, -50%)'
          });
      }
  
      // Fade in the east label, keep it visible for 7 seconds, then fade out
      eastLabel.fadeIn(1000, function() {  // Fade in over 1 second
          setTimeout(() => {
              eastLabel.fadeOut(7000);  // Fade out over 7 seconds
          }, 7000);
      });
  }
  
  // Function to clean up all animation elements and reset state
  function cleanup(preserveTicks = false) {
      console.log("Cleaning up animation elements", preserveTicks ? "while preserving tick marks" : "completely");
      
      // Clean up all planet labels
      $(".planet-label").fadeOut(500, function() {
          $(this).remove();
      });
      
      // Clean up zodiac labels and containers
      $(".zodiac-label-container").fadeOut(500, function() {
          $(this).remove();
      });
      $(".zodiac-label").fadeOut(500, function() {
          $(this).remove();
      });
      
      // Only remove tick marks if preserveTicks is false
      if (!preserveTicks) {
          // Clean up tick containers and marks, but NOT True Node which is permanent
          $(".zodiac-tick-container").not(".permanent-marker").fadeOut(500, function() {
              $(this).remove();
          });
      } else {
          console.log("Preserving tick marks as requested");
          // If we're preserving tick marks, make sure they're visible and properly styled
          $(".zodiac-tick").not(".permanent-marker").css({
              opacity: 0.8,
              boxShadow: '0 0 4px rgba(97, 218, 251, 0.6)',
              width: '15px',
              height: '3px'
          });
          
          // No need to adjust rotation as the ticks are attached directly to zodiac wireframe
          // which already handles rotation correctly
      }
      
      // Never remove the Node and Zenith ticks during cleanup, but allow labels to be cleaned up with planet labels
      // Just ensure the ticks are visible with proper styling
      if ($(".true-node-tick").length > 0) {
          console.log("Preserving Node tick marker");
          $(".true-node-tick").css({
              opacity: 1,
              display: 'block'
          });
      }
      
      // Center coordinates
      const centerX = 258;
      const centerY = 258;
      
      // Reset other planet markers to center and hide them (excluding Earth)
      const planets = ["#Sun", "#Mercury", "#Venus", "#Mars", "#Jupiter", "#Saturn", "#Moon"];
      planets.forEach(planetId => {
          $(planetId).css({
              opacity: 0,
              position: 'absolute',
              left: `${centerX}px`,
              top: `${centerY}px`,
              transform: 'translate(-50%, -50%)',
              display: 'none'
          });
      });
      
      // Ensure star-center (Earth marker) is hidden initially
      $("#star-center").addClass("hidden")
          .removeClass("pulsing")
          .css({
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0)',
              display: 'none',
              zIndex: 210
          });
          
      // Completely hide the Earth marker - we'll only use star-center
      $("#Earth").css({
          left: `${centerX}px`,
          top: `${centerY}px`,
          opacity: 0,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          display: 'none',
          zIndex: 209,
          backgroundColor: '#0080ff',
          boxShadow: '0 0 8px #0080ff',
          width: '8px',
          height: '8px'
      });
      
      // No Earth label to manage - removed as requested
      
      // Keep the tau symbol visible during cleanup
      // We'll handle the transition during animation
      
      // Hide zodiac wireframe but keep earth-wireframe visible
      $("#zodiac-wireframe").fadeOut(500);
      
      // Initially hide earth-wireframe - will show it during animation
      $("#earth-wireframe").css({
          opacity: 0,
          display: 'none',
          zIndex: 150
      });
      
      // Remove visualization active class from clock
      $("#clock").removeClass("visualization-active");
      
      // Clear the animation elements tracker
      animationElements = {
          labels: [],
          markers: [],
          wireframes: []
      };
      
      // Log memory state after cleanup
      console.log("Cleanup complete, memory state:", {
          labels: $(".planet-label").length,
          zodiacLabels: $(".zodiac-label").length,
          markerCount: $("[id$='wireframe']").filter(":visible").length
      });
  }
  
// Animate markers outward and align with degree dial
function animateMarkers(coordinates, astronomicalData) {
  console.log("Animation started with coordinates:", coordinates);
  console.log("Animation started with astronomical data:", astronomicalData);
  
  // Clean up any existing animation elements before starting new animation
  cleanup();
  
  // Now we'll show the Earth marker during the planet animation sequence
  // Make it fade in with the other planets
      
  // Earth wireframe should already be visible, just ensure proper styling
  $("#earth-wireframe").css({
    display: 'block',
    opacity: 0.8
  });
      
  // No Earth label to hide - removed as requested
  
  // Verify we have valid astronomical data before proceeding
  if (!astronomicalData || !astronomicalData.Sun || !astronomicalData.Sun.longitude) {
    console.error("Invalid astronomical data provided to animateMarkers");
    return;
  }
  
  // Verify we have valid coordinates
  if (!coordinates || typeof coordinates.longitude !== 'number') {
    console.error("Invalid coordinates provided to animateMarkers");
    return;
  }
  
  const planets = [
    { id: "#Sun", name: "Sun" },
    { id: "#Mercury", name: "Mercury" },
    { id: "#Venus", name: "Venus" },
    { id: "#Earth", name: "Earth" },
    { id: "#Mars", name: "Mars" },
    { id: "#Jupiter", name: "Jupiter" },
    { id: "#Saturn", name: "Saturn" },
    { id: "#Moon", name: "Moon" }
  ];
  const initialRadius = 15;
  const finalRadius = 282;
  const labelOffset = 20;
  const centerX = 258;
  const centerY = 258;
  const userLongitude = coordinates.longitude || 0;
  const initialDegreeAngle = 310;
  
  // Get references to wireframe elements
  const zodiacWireframe = $("#zodiac-wireframe");
  const earthWireframe = $("#earth-wireframe");
  
  // Track these elements for cleanup
  animationElements.wireframes.push(zodiacWireframe);
  animationElements.wireframes.push(earthWireframe);

  // Step 1: Place all markers at the center and make them visible
  planets.forEach(({ id, name }) => {
    // Position all planets, including Earth marker
    $(id).css({
      left: `${centerX}px`,
      top: `${centerY}px`,
      opacity: 1,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      display: 'block' // Make all markers visible for the animation
    });
  });
  
  // Now also show the Earth marker (star-center) with pulsing effect
  $("#star-center").removeClass("hidden")
    .addClass("pulsing")
    .css({
      opacity: 0, // Start invisible for fade-in
      display: 'block',
      transform: 'translate(-50%, -50%) scale(0.5)',
      zIndex: 210
    })
    .animate({
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)'
    }, 1000);

  // Step 2: Move markers outward immediately without delay
  // Removed initial timeout to eliminate delay in planet marker movement
  planets.forEach(({ id, name }, index) => {
    // Keep Earth at the center while others move outward
    if (name === "Earth") {
      // Keep Earth marker at center
      $(id).css({
        left: `${centerX}px`,
        top: `${centerY}px`,
        opacity: 1,
        transform: 'translate(-50%, -50%)'
      });
      
      // Ensure Earth marker (star-center) is visible with pulsing effect
      $("#star-center").css({
        opacity: 1,
        display: 'block',
        transform: 'translate(-50%, -50%) scale(1)'
      });
    } else {
      const angleOffset = ((index * 60 + initialDegreeAngle) % 360) * (Math.PI / 180);
      $(id).css({
        left: `${centerX + initialRadius * Math.cos(angleOffset)}px`,
        top: `${centerY + initialRadius * Math.sin(angleOffset)}px`,
        transition: 'left 1s ease-out, top 1s ease-out, opacity 1s'
      });
    }
  });

  // Step 3: Rotate degree dial and markers with direct animation - reduced delay from 1000ms to 300ms
  setTimeout(() => {
      // Get the rotation angle for synchronizing animations
      // Calculate mathematically significant rotation harmonized with dashboard
      let rotationAngle = rotateLongitudeDial(userLongitude);
      
      // If we have calculated rotation from astronomical data, blend it with longitude
      if (window.calculatedRotation !== undefined) {
        // Create harmonic blend of geographic and astronomical rotation
        // This creates mathematical synchronization with quantum identity system
        const harmonicBlend = (rotationAngle + window.calculatedRotation) / 2;
        console.log("Harmonic rotation blend:", harmonicBlend);
        // Update global variable for dashboard sync
        window.harmonicRotation = harmonicBlend;
      }
      
      // Show the zodiac wireframe to hold the ticks, but keep the circle and sectors transparent
      zodiacWireframe
        .css({
          display: 'block',
          opacity: 0,
          zIndex: 140,
          // Make sure it's properly sized
          width: '650px',
          height: '650px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '0 solid transparent' // Make the outer circle border transparent
        })
        .animate({ opacity: 0 }, 800); // Keep at 0 opacity for the wireframe itself
          
      // Make the zodiac sector lines transparent
      $(".zodiac-sector").css({
        backgroundColor: 'transparent',
        border: 'none'
      });
      
      // Display zodiac information
      displayZodiacAroundDial(userLongitude);
      toggleEastVisibility();
      
      // First place all planets at center, but don't move them to final positions yet
      // This ensures they're in the starting position but will wait for zodiac rotation to complete
      planets.forEach(({ id, name }) => {
        if (name === "Earth") {
          // Setup Earth marker but keep it at center
          $("#star-center").removeClass("hidden")
            .addClass("pulsing")
            .css({
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
              display: 'block',
              zIndex: 210
            });
            
          // Keep Earth marker styled but invisible
          $(id).css({
            left: `${centerX}px`,
            top: `${centerY}px`,
            opacity: 0, // Invisible
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            display: 'none', // Hidden
            zIndex: 209, // Behind star-center
            backgroundColor: '#0080ff',
            boxShadow: '0 0 8px #0080ff',
            width: '8px',
            height: '8px'
          });
          
          // Hide the tau symbol since Earth marker is now central
          $("#v4-center").fadeOut(500).css({ opacity: 0, display: 'none' });
        } else {
          // Initially just make other planets visible at center
          $(id).css({
            left: `${centerX}px`,
            top: `${centerY}px`,
            opacity: 1,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            display: 'block'
          });
        }
      });
      
      // Wait for zodiac rotation to complete before moving planets to their final positions
      // The rotation transition is 3.2s, so wait a bit longer to ensure it's complete
      setTimeout(() => {
        console.log("Zodiac rotation complete, now moving planets to final positions");
        
        // Now move planets to their actual positions after rotation is complete
        planets.forEach(({ id, name }) => {
          if (name !== "Earth") { // Skip Earth as it stays centered
            const astronomicalBody = astronomicalData[name];
            if (astronomicalBody && typeof astronomicalBody.longitude === "number") {
              // Log each planet's position data for debugging
              console.log(`Moving ${name} to longitude: ${astronomicalBody.longitude}°`);
              
              const angle = (astronomicalBody.longitude * Math.PI) / 180;
              const finalX = centerX + finalRadius * Math.cos(angle);
              const finalY = centerY + finalRadius * Math.sin(angle);
  
              // Move marker to final position with smooth transition
              $(id).css({
                left: `${finalX}px`,
                top: `${finalY}px`,
                transition: 'left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)', // Slower, smoother transition
                transform: 'translate(-50%, -50%)' // Ensure proper centering
              });
  
              // Add label with the final position
              const nameLabel = $("<div>")
                .addClass("planet-label")
                .attr("data-planet", name) // Add data attribute for easier selection
                .text(name)
                .css({
                  position: 'absolute',
                  left: `${finalX + labelOffset * Math.cos(angle)}px`,
                  top: `${finalY + labelOffset * Math.sin(angle)}px`,
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textShadow: '0 0 5px rgba(97, 218, 251, 0.6)',
                  fontSize: '12px',
                  zIndex: 200,
                  opacity: 0
                })
                .delay(300).fadeTo(1200, 1); // Delayed and slower fade-in for smoother appearance
  
              $(id).after(nameLabel);
            }
          }
        });
      }, 3500); // Wait slightly longer than rotation time (3.2s)
      
      // No Earth label to position - removed as requested

      // Step 5: Original sequence - turn off timepiece, fade out zodiac sectors, then restore timepiece
      // Delay this to start after planets have moved to their positions
      // Planet movement starts at 3.5s and takes 1.8s, so start this at 6.5s
      setTimeout(() => {
        console.log("Starting original sequence - keeping tick marks but fading out planet labels");
        
        // Keep the timepiece visible but ensure G-sync logo stays invisible
        $("#clock").removeClass("off").addClass("glass-visible");
        $("h1#center").css({ opacity: 0, display: 'none' }); // Make sure logo is invisible
        
        // Fade out zodiac labels but leave tick marks - with delay and slower transition
        $(".zodiac-label-container").delay(1000).fadeOut(2200);
        $(".zodiac-label").delay(1000).fadeOut(2200);
        
        // Hide zodiac wireframe but preserve tick marks permanently
        $("#zodiac-wireframe").css({
          opacity: 0 
        });
        
        // Ensure tick marks remain visible
        $(".zodiac-tick").css({
          opacity: 1,
          display: 'block'
        });
        
        // Ensure Node tick remains visible, let the labels fade with planet labels
        $(".true-node-tick").css({
          opacity: 1,
          display: 'block'
        });
        
        // Wait 9 seconds longer (original 4 + 5 extra seconds as requested) before fading out planetary markers 
        // to honor the intrinsic security properties
        setTimeout(() => {
          // Fade out planet labels over time - slower for more elegant transition
          $(".planet-label").fadeOut(4500);
          
          // Keep all planet markers visible - don't fade them out
          $("#Sun, #Mercury, #Venus, #Mars, #Jupiter, #Saturn, #Moon").css({
            opacity: 1,
            display: 'block'
          });
          
          // Earth wireframe should remain visible at center
          // Ensure it stays visible with proper styling
          $("#earth-wireframe").css({
            opacity: 0.8,
            zIndex: 150,
            display: 'block'
          });
          
          // No Earth label to hide - removed as requested
          
          // After planetary elements fade out, restore the timepiece visibility
          setTimeout(() => {
            // Make the clock face and casing visible
            $("#clock").removeClass("off").addClass("glass-visible");
            
            // Keep the Earth marker visible and don't bring back the tau symbol
            // This ensures the astronomical visualization remains consistent
            $("#v4-center").css({ opacity: 0, display: 'none' });
            
            // Keep the Earth marker (star-center) visible with pulsing effect
            $("#star-center").css({
              opacity: 1,
              display: 'block'
            }).addClass("pulsing");
            
            // Absolutely ensure the G-sync logo stays off at the end of the sequence
            $("h1#center").css({ opacity: 0, display: 'none' });
            
            // Double-check to make sure the G-sync logo stays off
            setTimeout(() => {
              $("h1#center").css({ opacity: 0, display: 'none' });
              
              // Just fade the opacity of header and footer without affecting layout
              // This preserves the document flow while making them invisible
              $(".header").animate({ opacity: 0 }, 2000);
              $(".footer").animate({ opacity: 0 }, 2000);
              
              // Subtle enhancement of Node and Zenith ticks at end of sequence
              // Make them slightly more prominent
              $(".true-node-tick").animate({
                boxShadow: "0 0 8px rgba(65, 105, 225, 0.7)",
                backgroundColor: "rgba(65, 105, 225, 0.9)"
              }, 1500);
              // Labels should already be faded out with planet labels
            }, 100);
            
            console.log("Animation sequence complete with tick marks preserved and planet labels faded. States:", {
              clickSequence,
              longAligned: LONG_ALIGNED,
              storedCoordinates: window.storedCoordinates ? true : false,
              storedAstronomicalData: window.storedAstronomicalData ? true : false,
              tickMarksVisible: $(".zodiac-tick-container").length,
              planetLabelsVisible: $(".planet-label:visible").length
            });
          }, 3000); // Wait until fadeout is complete - longer wait
        }, 9000); // Wait 9 seconds (original 4 + 5 extra) for planetary markers as requested
      }, 6500); // Start after planets have moved (3.5s + 1.8s + buffer)
    }, 1200); // Smooth rotation timing
}
  
  // Initialize the interactive clock
  $(document).ready(function () {
      console.log("Document ready - initializing clock...");
      
      // Clear any existing state to ensure fresh start
      window.storedCoordinates = null;
      window.storedAstronomicalData = null;
      clickSequence = 0;
      LONG_ALIGNED = false;
      
      // Initialize the clock
      draw();
      set_time();
      updateClock();
      
      // Initialize Julian Day for quantum security synchronization
      const now = new Date();
      window.currentJulianDay = (now.getTime() / 86400000) + 2440587.5;
      
      // Set up constants to match dashboard mathematical model from v0.3.2
      window.PHI = 1.618033988749895; // Golden ratio (φ = (1 + √5)/2)
      window.TWO_PI = Math.PI * 2;
      window.PRIMES = [7, 11, 13, 17]; // Prime number harmonics for security
      
      // Initialize security properties for astronomical identity
      window.securityProperties = {
          harmonics: [0, 0, 0, 0],
          position: { x: 0, y: 0, z: 0 },
          signature: 0,
          penroseSeed: 0,
          hilbertDepth: 3
      };
      
      // Initialize security status object matching dashboard structure
      window.securityStatus = {
          astronomicalSync: {
              julianDay: window.currentJulianDay,
              updateTime: Date.now()
          },
          quantumIdentity: {
              penroseSeed: 0,
              rotationValue: 0,
              updateTime: Date.now()
          },
          tokenValue: 0,
          breachDetected: false,
          breachReason: '',
          breachTimestamp: null
      };
      
      // Position planets with Earth at center
      positionPlanetsAtCenter();
            
      // Initialize Earth label below the Earth marker
      const centerX = 258;
      const centerY = 258;
      
      // Keep the tau symbol visible initially and don't show star-center yet
      $("#v4-center").css({
          opacity: 1,
          display: 'block'
      });
      
      // Hide star-center initially
      $("#star-center")
          .addClass("hidden")
          .removeClass("pulsing")
          .css({
              opacity: 0,
              display: 'none',
              transform: 'translate(-50%, -50%) scale(0)'
          });
      
      // Do not create Earth label - removed as requested
          
      // Initially hide earth-wireframe - will show it during animation
      $("#earth-wireframe").css({
          opacity: 0,
          display: 'none',
          zIndex: 150
      });
      
      
      // Run cleanup to ensure no stray elements
      cleanup();
  
      // Attach click event to central element with debugging
      console.log("Setting up click handlers");
      
      // Remove any previous click handlers to prevent memory leaks and duplicate handlers
      $("h1#center, #center, #center-v3, .center-element").off("click");
      $("#clock").off("click");
      $("#info-panel").off("click");
      $("#run-query").off("click");
      
      // Make center element take user to dashboard
      $("h1#center, #center, #center-v3, .center-element").on("click", function(e) {
          console.log("Center clicked! Redirecting to dashboard");
          // Redirect to dashboard
          window.location.href = "/dashboard";
          
          // Prevent event bubbling
          e.stopPropagation();
      });
      
      // Make the Source link run the query
      $("#run-query").on("click", function(e) {
          console.log("Source link clicked!", e.target);
          
          // Start from the beginning of the sequence
          if (clickSequence >= 2) {
              clickSequence = 0; // Reset to start if we're at the end
          }
          
          toggleDataDisplay();
          
          // Prevent default link behavior and event bubbling
          e.preventDefault();
          e.stopPropagation();
      });
      
      // Add a click handler to the entire clock as a fallback
      $("#clock").on("click", function(e) {
          console.log("Clock clicked!", e.target);
          // Only trigger if clicking near the center
          const rect = this.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const clickX = e.clientX;
          const clickY = e.clientY;
          const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));
          
          // If clicked within 50px of center, redirect to dashboard
          if (distance < 50) {
              console.log("Center area of clock clicked! Redirecting to dashboard");
              // Redirect to dashboard
              window.location.href = "/dashboard";
              
              // Prevent event bubbling
              e.stopPropagation();
          }
      });
      
      // Add a click handler to the info panel to dismiss it
      $("#info-panel").on("click", function(e) {
          console.log("Info panel clicked, with clickSequence =", clickSequence);
          e.stopPropagation(); // Prevent event bubbling
          
          // If we're in the visualization flow (clickSequence = 2), start the animation
          if (clickSequence === 2 && window.storedCoordinates && window.storedAstronomicalData) {
              // Add pulsing effect before fadeout
              $(this).addClass("panel-clicked");
              
              // Wait a moment before fading out to show the click effect
              setTimeout(() => {
                  $(this).fadeOut(800); // Fade out the info panel slower
                  
                  // Wait for panel to fade out before starting sequence
                  setTimeout(() => {
                      // Show Earth wireframe immediately with a quick fade-in
                      earthWireframe
                          .removeClass("hidden")
                          .css({ opacity: 0, zIndex: 150, display: 'block' })
                          .fadeTo(800, 1);
                          
                      // Earth marker will be shown during the planet animation
                      // Keep it hidden until the animation begins
                      $("#star-center").addClass("hidden")
                          .removeClass("pulsing")
                          .css({
                              opacity: 0,
                              display: 'none',
                              transform: 'translate(-50%, -50%) scale(0)'
                          });
                      
                      // FIXED: Do not show zodiac wireframe yet
                      // It will be shown by animateMarkers at the correct time
                      zodiacWireframe
                          .removeClass("hidden") 
                          .css({ opacity: 0, zIndex: 140, display: 'none' });
                      
                      // Start animation with stored data
                      animateMarkers(window.storedCoordinates, window.storedAstronomicalData);
                      
                      // Apply special highlight class to indicate active visualization
                      $("#clock").addClass("visualization-active");
                  }, 800);
              }, 300);
          } else {
              // Otherwise just dismiss the panel
              $(this).fadeOut();
              console.log("Info panel clicked, fadeout only");
          }
      });
      
      // Check if we're using v3 theme
      const isV3Theme = $("body").hasClass("v3-theme");
      
      // Apply appropriate styling based on theme
      if (isV3Theme) {
          console.log("Using v3 theme styling");
      } else {
          console.log("Using default theme styling");
      }
      
      // Log initial state
      console.log("Clock initialized. States:", {
          clickSequence,
          longAligned: LONG_ALIGNED,
          hasStoredData: false
      });
  });