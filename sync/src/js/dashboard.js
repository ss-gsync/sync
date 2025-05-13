/**
 * Dashboard Entry Point
 * This file serves as the entry point for webpack bundling of the dashboard
 *
 * TAU (𝜏Coin) Quantum Security Dashboard
 *
 * The dashboard provides a mathematical visualization of the three core security components:
 * 1. Quantum Identity - Penrose-based non-repeating pattern for unique visual signature
 * 2. Ash (Æ) Token - Core mathematical identity with continuous transformation
 * 3. Temporal Synchronization - The 𝜏 value driving security components
 */
import '../styles/dashboard.css';

// Import jQuery as a module and ensure it's available globally
import $ from 'jquery';
window.$ = window.jQuery = $;

// Create a single global namespace for the dashboard to prevent conflicts
window.TAUDashboard = window.TAUDashboard || {};

// Track changes to showLabels with a getter/setter
let _showLabels = false;
Object.defineProperty(window.TAUDashboard, 'showLabels', {
    get: function() {
        return _showLabels;
    },
    set: function(value) {
        _showLabels = value;
    }
});

// Add a global function to toggle labels
window.toggleLabelsDisplay = function() {
    // Get the current value and invert it
    let currentValue = window.TAUDashboard.showLabels;
    let newValue = !currentValue;

    // Set the new value
    window.TAUDashboard.showLabels = newValue;

    // Store in localStorage for persistence across page loads
    try {
        localStorage.setItem('showLabels', newValue ? 'true' : 'false');
    } catch (e) {
        console.error("Could not save to localStorage:", e);
    }

    // Force a redraw
    window.TAUDashboard.forceUpdate = true;

    return newValue;
};

// Constants used across visualizations
const TAU = Math.PI * 2;
window.G_TAU = TAU; // Make it globally available
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

/**
 * Enhanced Astronomical Clock Implementation
 * 
 * This provides the updated visualization functions for the astronomical
 * synchronization component, featuring a realistic starfield background
 * and accurate planetary positions.
 */

// Initialize the astronomical canvas with token data
window.initAstronomicalCanvas = function(canvas, token) {
    if (!canvas) return;
    
    const container = document.getElementById('astronomical-container');
    if (!container) {
        console.error("Security breach: Container missing for Astronomical Canvas");
        return;
    }
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the container
    canvas.width = container.clientWidth || 200;
    canvas.height = container.clientHeight || 200;
    
    // Make sure the canvas is visible
    canvas.style.display = 'block';
    
    // Create an offscreen canvas for smooth rendering
    if (!ctx._offscreenCanvas) {
        ctx._offscreenCanvas = document.createElement('canvas');
        ctx._offscreenCanvas.width = canvas.width;
        ctx._offscreenCanvas.height = canvas.height;
        ctx._offscreenCtx = ctx._offscreenCanvas.getContext('2d', { alpha: false });
    }
    
    // Initial draw will happen in updateAstronomicalCanvas call
    window.updateAstronomicalCanvas(canvas, token);
};

// Define star spectral types (O, B, A, F, G, K, M) with realistic colors - Exact from v0.3.2
const spectralColors = [
    { color: 'rgba(155, 176, 255, 1)', atmosphere: 'rgba(155, 176, 255, 0.2)' }, // O - Blue
    { color: 'rgba(170, 191, 255, 1)', atmosphere: 'rgba(170, 191, 255, 0.2)' }, // B - Blue-white
    { color: 'rgba(249, 245, 255, 1)', atmosphere: 'rgba(249, 245, 255, 0.2)' }, // A - White
    { color: 'rgba(248, 247, 229, 1)', atmosphere: 'rgba(248, 247, 229, 0.2)' }, // F - Yellow-white
    { color: 'rgba(255, 244, 232, 1)', atmosphere: 'rgba(255, 244, 232, 0.2)' }, // G - Yellow (Sun-like)
    { color: 'rgba(255, 218, 181, 1)', atmosphere: 'rgba(255, 218, 181, 0.2)' }, // K - Orange
    { color: 'rgba(255, 187, 153, 1)', atmosphere: 'rgba(255, 187, 153, 0.2)' }  // M - Red
];

// The improved renderStarfieldBackground function with spectral star types - Exact from v0.3.2
// Enhanced to add more stars and create a J2000.0 reference plane alignment
function renderStarfieldBackground(ctx, width, height, time, starCount = 400) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw subtle J2000.0 reference plane as mentioned in the overlay
    // This is represented as a faint line across the celestial sphere
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = 'rgba(100, 140, 210, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Use deterministic seeding based on position for stable starfield
    for (let i = 0; i < starCount; i++) {
        // Use prime number factors for non-repeating pattern
        const seed1 = (i * 13) % 17;
        const seed2 = (i * 19) % 23;
        
        // Create pseudorandom but stable star positions
        const angleOffset = (seed1 / 17) * Math.PI * 2;
        const radiusOffset = (seed2 / 23) * 0.5;
        
        const angle = ((i / starCount) * Math.PI * 2) + angleOffset;
        const radiusFactor = 0.1 + (0.9 * radiusOffset);
        
        // Calculate position - stars are positioned in a spiral pattern
        // Add a slight concentration along the J2000.0 reference plane
        const x = centerX + Math.cos(angle) * width * 0.45 * radiusFactor;
        const y = centerY + Math.sin(angle) * height * 0.45 * radiusFactor * 
                 (1.0 + 0.2 * Math.sin(i * 0.1)); // Slight concentration along the plane
        
        // Calculate a pseudorandom but deterministic spectral class
        const spectralClass = Math.floor((seed1 * seed2) % 7);
        
        // Calculate star size based on spectral class (O stars are largest, M smallest)
        const baseSize = 3.0 - (spectralClass * 0.4);
        
        // Twinkling effect synchronized with Julian Day
        const twinkle = Math.sin(time * 2 + i) * 0.2 + 0.8;
        const size = baseSize * twinkle;
        
        // Draw star with three-layer approach for realistic appearance
        
        // 1. Outer glow (atmosphere)
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        const outerGlow = ctx.createRadialGradient(
            x, y, size * 0.5,
            x, y, size * 3
        );
        outerGlow.addColorStop(0, spectralColors[spectralClass].atmosphere);
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fill();
        
        // 2. Corona
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        const coronaGlow = ctx.createRadialGradient(
            x, y, size * 0.5,
            x, y, size * 1.5
        );
        
        // Modify corona color based on spectral class
        const coronaColor = spectralColors[spectralClass].color.replace('1)', '0.4)');
        coronaGlow.addColorStop(0, coronaColor);
        coronaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coronaGlow;
        ctx.fill();
        
        // 3. Star core
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = spectralColors[spectralClass].color;
        ctx.fill();
    }
}

// The enhanced astronomical canvas update function - Exact from v0.3.2
window.updateAstronomicalCanvas = function(canvas, token) {
    if (!canvas) return;
    
    // Validate token to ensure security compliance
    if (!token || !token.julianDay || !isFinite(token.julianDay) || !token.timestamp) {
        console.error("Security breach: Token missing critical astronomical data");
        return;
    }
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create offscreen canvas for smooth rendering
    if (!ctx._astronomicalOffscreen) {
        ctx._astronomicalOffscreen = document.createElement('canvas');
        ctx._astronomicalOffscreen.width = canvas.width;
        ctx._astronomicalOffscreen.height = canvas.height;
        ctx._astronomicalOffscreenCtx = ctx._astronomicalOffscreen.getContext('2d', { alpha: false });
    }
    
    // Ensure offscreen canvas matches main canvas size
    if (ctx._astronomicalOffscreen.width !== canvas.width || 
        ctx._astronomicalOffscreen.height !== canvas.height) {
        ctx._astronomicalOffscreen.width = canvas.width;
        ctx._astronomicalOffscreen.height = canvas.height;
    }
    
    const offCtx = ctx._astronomicalOffscreenCtx;
    
    // Clear offscreen canvas with deep space background
    offCtx.fillStyle = 'rgb(8, 12, 25)'; // Darker space background
    offCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Initialize a high-precision astronomical data structure
    const planetaryData = {
        orbitalPhases: [],
        celestialPositions: [],
        planetPositions: [],
        temporalRhythm: Math.sin(token.julianDay * 0.8) * 0.5 + 0.5,
        julianDay: token.julianDay // Calculate precise Julian Day
    };
    
    // Draw enhanced starfield with three-layer stars
    renderStarfieldBackground(offCtx, canvas.width, canvas.height, token.julianDay, 300);
    
    // Earth is at the center of this coordinate system (topographic coordinates)
    // Draw the Earth
    offCtx.save();
    offCtx.beginPath();
    const earthRadius = Math.min(canvas.width, canvas.height) * 0.04;
    offCtx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
    
    // Create Earth gradient
    const earthGradient = offCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, earthRadius
    );
    earthGradient.addColorStop(0, 'rgba(64, 96, 192, 0.8)');
    earthGradient.addColorStop(0.5, 'rgba(48, 104, 192, 0.9)');
    earthGradient.addColorStop(1, 'rgba(32, 64, 160, 1.0)');
    offCtx.fillStyle = earthGradient;
    offCtx.fill();
    
    // Draw a subtle grid on Earth
    offCtx.strokeStyle = 'rgba(150, 220, 255, 0.2)';
    offCtx.lineWidth = 0.5;
    
    // Draw longitude lines
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        offCtx.beginPath();
        offCtx.arc(centerX, centerY, earthRadius, angle, angle);
        offCtx.moveTo(centerX, centerY);
        offCtx.lineTo(centerX + Math.cos(angle) * earthRadius, centerY + Math.sin(angle) * earthRadius);
        offCtx.stroke();
    }
    
    // Draw latitude circles
    for (let r = earthRadius / 4; r < earthRadius; r += earthRadius / 4) {
        offCtx.beginPath();
        offCtx.arc(centerX, centerY, r, 0, Math.PI * 2);
        offCtx.stroke();
    }
    
    // Add a subtle glow around Earth - indicating temporal synchronization with DE431 ephemeris standards
    // Apply a pulsing effect synchronized with the Julian Day to represent temporal synchronization
    const pulseIntensity = 0.5 + 0.3 * Math.sin(token.julianDay * Math.PI * 2);
    
    offCtx.shadowColor = `rgba(97, 218, 251, ${pulseIntensity * 0.6})`;
    offCtx.shadowBlur = 12;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, earthRadius * 1.05, 0, Math.PI * 2);
    offCtx.fillStyle = `rgba(97, 218, 251, ${pulseIntensity * 0.15})`;
    offCtx.fill();
    
    // Add a second, outer glow for the DE431 ephemeris effect
    offCtx.shadowColor = `rgba(180, 230, 255, ${pulseIntensity * 0.4})`;
    offCtx.shadowBlur = 18;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, earthRadius * 1.1, 0, Math.PI * 2);
    offCtx.fillStyle = `rgba(140, 200, 255, ${pulseIntensity * 0.1})`;
    offCtx.fill();
    
    offCtx.shadowBlur = 0;
    offCtx.restore();
    
    // Draw 7 orbital paths with accurate planetary periods scaled by the golden ratio (φ)
    const PHI = 1.618033988749895; // Golden ratio for mathematically significant scaling
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.25; // Start orbital paths outside Earth
    
    // Define planetary colors based on traditional astronomical associations
    const planetColors = [
        'rgba(255, 238, 144, 0.7)', // Sun - Gold
        'rgba(240, 245, 255, 0.7)', // Moon - Silver
        'rgba(160, 232, 192, 0.7)', // Mercury - Green
        'rgba(208, 176, 255, 0.7)', // Venus - Purple
        'rgba(255, 144, 144, 0.7)', // Mars - Red
        'rgba(255, 186, 112, 0.7)', // Jupiter - Orange
        'rgba(176, 196, 222, 0.7)'  // Saturn - Blue-grey
    ];
    
    const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    
    // Calculate Julian time fraction for accurate astronomical alignment
    const julianFraction = token.julianDay - Math.floor(token.julianDay);
    
    // Draw orbits and planets with accurate orbital periods
    for (let i = 0; i < 7; i++) {
        // Scale orbital distances by golden ratio
        const orbitRadius = baseRadius + (baseRadius * 0.5 * i * (1 + (i * 0.2) / PHI));
        
        // Draw orbital path
        offCtx.beginPath();
        offCtx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        offCtx.strokeStyle = `rgba(100, 150, 255, ${0.15 - i * 0.015})`;
        offCtx.lineWidth = 1;
        offCtx.stroke();
        
        // Calculate orbital period - scaled by PHI for mathematical significance
        // Each planet has a unique period that creates non-repeating patterns
        const periodFactor = 1 / (0.8 + (i * 0.4) / PHI);
        const angleOffset = i * (Math.PI / 3.5);
        
        // Calculate position with respect to Julian Day for accurate astronomical alignment
        const angle = (julianFraction * Math.PI * 2 * periodFactor) + angleOffset;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        
        // Get planet color first to ensure it's defined for all code paths
        const planetColor = planetColors[i];
        const planetSize = 2 + i * 0.5;
        
        // Enhanced planet rendering based on v0.3.2 implementation
        // Different handling for special planets like Saturn and Sun
        if (planetNames[i] === "Saturn") {
            // Draw Saturn with rings as in celestial-alignment.js
            offCtx.beginPath();
            const saturnSize = 3 + i * 0.5;
            offCtx.arc(x, y, saturnSize, 0, Math.PI * 2);
            
            // Create gradient for Saturn
            const planetGradient = offCtx.createRadialGradient(
                x, y, 0,
                x, y, saturnSize
            );
            
            const baseColor = planetColor.replace('0.7', '1.0');
            planetGradient.addColorStop(0, baseColor);
            planetGradient.addColorStop(1, planetColor.replace('0.7', '0.4'));
            
            offCtx.fillStyle = planetGradient;
            offCtx.fill();
            
            // Draw Saturn's rings as an ellipse
            offCtx.save();
            offCtx.translate(x, y);
            offCtx.rotate(Math.PI / 4); // Tilt the rings
            
            try {
                offCtx.beginPath();
                offCtx.ellipse(0, 0, saturnSize * 1.8, saturnSize * 0.5, 0, 0, Math.PI * 2);
                offCtx.strokeStyle = `rgba(255, 240, 200, 0.7)`;
                offCtx.lineWidth = 1.5;
                offCtx.stroke();
            } catch (e) {
                // Fallback if ellipse not supported
                offCtx.beginPath();
                offCtx.arc(0, 0, saturnSize * 1.4, 0, Math.PI * 2);
                offCtx.strokeStyle = `rgba(255, 240, 200, 0.7)`;
                offCtx.lineWidth = 1.5;
                offCtx.stroke();
            }
            
            offCtx.restore();
        } else if (planetNames[i] === "Sun") {
            // Draw Sun with enhanced glow effect as in celestial-alignment.js
            const sunSize = 3 + i * 0.5;
            
            // Draw sun glow
            const gradient = offCtx.createRadialGradient(
                x, y, 0,
                x, y, sunSize * 2.5
            );
            
            gradient.addColorStop(0, planetColor);
            gradient.addColorStop(0.5, planetColor.replace('0.7', '0.5'));
            gradient.addColorStop(1, planetColor.replace('0.7', '0'));
            
            offCtx.beginPath();
            offCtx.fillStyle = gradient;
            offCtx.arc(x, y, sunSize * 2.5, 0, Math.PI * 2);
            offCtx.fill();
            
            // Draw sun core
            offCtx.beginPath();
            offCtx.fillStyle = planetColor.replace('0.7', '1.0');
            offCtx.arc(x, y, sunSize, 0, Math.PI * 2);
            offCtx.fill();
        } else {
            // Standard planet drawing with enhanced appearance
            offCtx.beginPath();
            offCtx.arc(x, y, planetSize, 0, Math.PI * 2);
            
            // Create gradient for planet - similar to celestial-alignment.js
            const planetGradient = offCtx.createRadialGradient(
                x, y, 0,
                x, y, planetSize
            );
            
            const baseColor = planetColor.replace('0.7', '1.0');
            planetGradient.addColorStop(0, baseColor);
            planetGradient.addColorStop(1, planetColor.replace('0.7', '0.4'));
            
            offCtx.fillStyle = planetGradient;
            offCtx.fill();
            
            // Add glow around planet
            offCtx.beginPath();
            offCtx.arc(x, y, planetSize * 2, 0, Math.PI * 2);
            const glowGradient = offCtx.createRadialGradient(
                x, y, planetSize,
                x, y, planetSize * 2
            );
            glowGradient.addColorStop(0, planetColor.replace('0.7', '0.3'));
            glowGradient.addColorStop(1, planetColor.replace('0.7', '0'));
            offCtx.fillStyle = glowGradient;
            offCtx.fill();
        }
        
        // Planet labels using the celestial-alignment.js style
        // Different handling for Sun to reduce clutter
        if (planetNames[i] === "Sun") {
            // Only show Sun label if labels are enabled
            if (window.TAUDashboard && window.TAUDashboard.showLabels) {
                const sunSize = 3 + i * 0.5;
                offCtx.font = '10px Arial';
                offCtx.fillStyle = 'rgba(255, 240, 180, 0.8)';  // Match Sun's color
                offCtx.textAlign = 'center';
                offCtx.textBaseline = 'middle';
                offCtx.fillText(planetNames[i], x, y - sunSize * 3);
            }
        } else if (planetNames[i] === "Saturn") {
            // Special handling for Saturn with rings
            const saturnSize = 3 + i * 0.5;
            offCtx.font = '10px Arial';
            offCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            offCtx.textAlign = 'center';
            offCtx.textBaseline = 'middle';
            offCtx.fillText(planetNames[i], x, y - saturnSize * 4); // Extra offset for rings
        } else {
            // Regular planets
            offCtx.font = '10px Arial';
            offCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            offCtx.textAlign = 'center';
            offCtx.textBaseline = 'middle';
            offCtx.fillText(planetNames[i], x, y - planetSize * 3);
        }
        
        // Calculate orbital phases for data output
        const phase = (angle % (Math.PI * 2)) / (Math.PI * 2);
        planetaryData.orbitalPhases.push(phase);
        
        // Store planetary positions for data flow
        planetaryData.planetPositions.push({
            name: planetNames[i],
            x: x / canvas.width,
            y: y / canvas.height,
            angle: angle,
            radius: orbitRadius,
            color: planetColor
        });
        
        // Store key celestial positions for data output
        if (i < 4) { // Use only first 4 planets for data flow
            planetaryData.celestialPositions.push({
                x: x / canvas.width,
                y: y / canvas.height,
                intensity: planetSize / 3,
                name: planetNames[i]
            });
        }
    }
    
    // Draw subtle nebula-like effects with mathematical precision
    const gradient = offCtx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.width * 0.7
    );
    
    gradient.addColorStop(0, 'rgba(97, 218, 251, 0.03)');
    gradient.addColorStop(0.5, 'rgba(32, 197, 197, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    offCtx.fillStyle = gradient;
    offCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add outer celestial coordinate system with cardinal directions (N, E, S, W)
    const clockRadius = Math.min(canvas.width, canvas.height) * 0.45;
    
    // Draw nested concentric rings as mentioned in the overlay description
    // Enhanced with zodiac, hour, month and day rings as in celestial-alignment-fix.js
    const TAU = Math.PI * 2;
    
    // Draw main clock circle with double rim - similar to celestial-alignment-fix.js
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, clockRadius, 0, TAU);
    offCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    offCtx.lineWidth = 1;
    offCtx.stroke();
    
    // Draw outer rim
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, clockRadius * 0.98, 0, TAU);
    offCtx.strokeStyle = 'rgba(155, 175, 255, 0.3)';
    offCtx.lineWidth = 1;
    offCtx.stroke();
    
    // Draw zodiac ring - similar to celestial-alignment-fix.js
    const zodiacRadius = clockRadius * 0.85;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, zodiacRadius, 0, TAU);
    offCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    offCtx.lineWidth = 1;
    offCtx.stroke();
    
    // Draw zodiac sectors - similar to celestial-alignment-fix.js
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * TAU;
        const startX = centerX + Math.cos(angle) * (zodiacRadius - clockRadius * 0.07);
        const startY = centerY + Math.sin(angle) * (zodiacRadius - clockRadius * 0.07);
        const endX = centerX + Math.cos(angle) * (zodiacRadius + clockRadius * 0.03);
        const endY = centerY + Math.sin(angle) * (zodiacRadius + clockRadius * 0.03);
        
        offCtx.beginPath();
        offCtx.moveTo(startX, startY);
        offCtx.lineTo(endX, endY);
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        offCtx.lineWidth = 1;
        offCtx.stroke();
    }
    
    // Draw hour markers - similar to celestial-alignment-fix.js
    const hourRadius = clockRadius * 0.7;
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * TAU;
        const markerLength = (i % 6 === 0) ? clockRadius * 0.1 : clockRadius * 0.05;
        
        const innerX = centerX + Math.cos(angle) * (hourRadius - markerLength);
        const innerY = centerY + Math.sin(angle) * (hourRadius - markerLength);
        const outerX = centerX + Math.cos(angle) * hourRadius;
        const outerY = centerY + Math.sin(angle) * hourRadius;
        
        offCtx.beginPath();
        offCtx.moveTo(innerX, innerY);
        offCtx.lineTo(outerX, outerY);
        offCtx.strokeStyle = (i % 6 === 0) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)';
        offCtx.lineWidth = (i % 6 === 0) ? 1.5 : 1;
        offCtx.stroke();
    }
    
    // Draw month ring - similar to celestial-alignment-fix.js
    const monthRadius = clockRadius * 0.55;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, monthRadius, 0, TAU);
    offCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    offCtx.lineWidth = 1;
    offCtx.stroke();
    
    // Draw month markers - similar to celestial-alignment-fix.js
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * TAU;
        const innerX = centerX + Math.cos(angle) * (monthRadius - clockRadius * 0.03);
        const innerY = centerY + Math.sin(angle) * (monthRadius - clockRadius * 0.03);
        const outerX = centerX + Math.cos(angle) * monthRadius;
        const outerY = centerY + Math.sin(angle) * monthRadius;
        
        offCtx.beginPath();
        offCtx.moveTo(innerX, innerY);
        offCtx.lineTo(outerX, outerY);
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        offCtx.lineWidth = 1;
        offCtx.stroke();
    }
    
    // Draw day ring - similar to celestial-alignment-fix.js
    const dayRadius = clockRadius * 0.4;
    offCtx.beginPath();
    offCtx.arc(centerX, centerY, dayRadius, 0, TAU);
    offCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    offCtx.lineWidth = 1;
    offCtx.stroke();
    
    // Add day and month indicators as in celestial-alignment.js
    // Get current date for day/month indicators
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    
    // Draw day indicator on day ring
    const dayAngle = ((currentDay - 1) / 31) * TAU;
    const dayX = centerX + Math.cos(dayAngle) * dayRadius;
    const dayY = centerY + Math.sin(dayAngle) * dayRadius;
    
    offCtx.beginPath();
    offCtx.arc(dayX, dayY, 4, 0, TAU);
    offCtx.fillStyle = 'rgba(212, 175, 55, 0.8)'; // Gold color
    offCtx.fill();
    
    // Draw month indicator on month ring
    const monthAngle = (currentMonth / 12) * TAU;
    const monthX = centerX + Math.cos(monthAngle) * monthRadius;
    const monthY = centerY + Math.sin(monthAngle) * monthRadius;
    
    offCtx.beginPath();
    offCtx.arc(monthX, monthY, 5, 0, TAU);
    offCtx.fillStyle = 'rgba(97, 218, 251, 0.8)'; // Blue color
    offCtx.fill();
    
    // Draw cardinal direction markers
    const directions = ['N', 'E', 'S', 'W'];
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) - (Math.PI / 2); // Start from North
        const x = centerX + Math.cos(angle) * (clockRadius + 15);
        const y = centerY + Math.sin(angle) * (clockRadius + 15);
        
        offCtx.font = '14px monospace';
        offCtx.fillStyle = 'rgba(150, 200, 255, 0.8)';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(directions[i], x, y);
    }
    
    // Draw hands that trace golden-ratio orbital arcs as mentioned in the overlay description
    // Use the existing PHI constant (already defined above)
    
    // Primary indicator (white hand) - completes one rotation per Julian Day
    const primaryAngle = (token.julianDay % 1) * Math.PI * 2;
    const primaryLength = clockRadius * 0.85;
    
    offCtx.beginPath();
    offCtx.moveTo(centerX, centerY);
    offCtx.lineTo(
        centerX + Math.cos(primaryAngle) * primaryLength,
        centerY + Math.sin(primaryAngle) * primaryLength
    );
    offCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    offCtx.lineWidth = 2;
    offCtx.stroke();
    
    // Secondary indicator (blue hand) - rotates every 7,200 seconds (2 hours) as mentioned in the overlay
    const secondaryAngle = (token.julianDay * 12) % (Math.PI * 2); // 12 times faster = 2 hours
    const secondaryLength = clockRadius * 0.65; // PHI ratio with primary length
    
    offCtx.beginPath();
    offCtx.moveTo(centerX, centerY);
    offCtx.lineTo(
        centerX + Math.cos(secondaryAngle) * secondaryLength,
        centerY + Math.sin(secondaryAngle) * secondaryLength
    );
    offCtx.strokeStyle = 'rgba(97, 218, 251, 0.9)';
    offCtx.lineWidth = 2;
    offCtx.stroke();
    
    // Third indicator (gold hand) - rotates at yet another harmonic rate
    // As implemented in celestial-alignment-fix.js
    const tertiaryAngle = (token.julianDay * 60) % (Math.PI * 2); // 60 times faster than primary
    const tertiaryLength = clockRadius * 0.7; // Different length for visual distinction
    
    offCtx.beginPath();
    offCtx.moveTo(centerX, centerY);
    offCtx.lineTo(
        centerX + Math.cos(tertiaryAngle) * tertiaryLength,
        centerY + Math.sin(tertiaryAngle) * tertiaryLength
    );
    offCtx.strokeStyle = 'rgba(212, 175, 55, 0.9)'; // Gold color
    offCtx.lineWidth = 1; // Thinner for visual distinction
    offCtx.stroke();
    
    // Add labels and Julian Day information
    // The Julian Day is central to the astronomical clock as mentioned in the overlay
    // "...universal time reference anchored to precise Julian Day calculations"
    const julianDayFormatted = token.julianDay.toFixed(7);
    
    // Display Julian Day at the bottom of the clock with a special visual treatment
    offCtx.font = 'bold 12px "Roboto Mono", monospace';
    offCtx.textAlign = 'center';
    offCtx.fillStyle = 'rgba(97, 218, 251, 0.9)';
    offCtx.fillText(`JD ${julianDayFormatted}`, centerX, centerY + clockRadius + 25);
    
    // Show additional information if labels are enabled
    const showLabels = window.TAUDashboard && window.TAUDashboard.showLabels;
    if (showLabels) {
        offCtx.font = '12px monospace';
        offCtx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        offCtx.textAlign = 'left';
        offCtx.fillText(`1. ASTRONOMICAL SYNCHRONIZATION`, 10, 20);
        offCtx.fillText(`Reference Plane: J2000.0`, 10, 40);
        offCtx.fillText(`Celestial Ephemeris: DE431`, 10, 60);
    }
    
    // Copy from offscreen canvas to main canvas in one operation at the end
    ctx.drawImage(offCtx.canvas, 0, 0);
    
    // Store astronomical data in global security state
    window.TAUDashboard.securityStatus.astronomicalFeed = {
        julianDay: token.julianDay,
        normalizedJulianDay: julianFraction,
        updateTime: Date.now(),
        planetaryData: planetaryData
    };
    
    // Return astronomical data for next component
    return planetaryData;
};

// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check localStorage for saved showLabels preference
    try {
        const savedShowLabels = localStorage.getItem('showLabels');
        if (savedShowLabels === 'true') {
            window.TAUDashboard.showLabels = true;
            // Update button text
            const labelsButton = document.getElementById('toggle-labels');
            if (labelsButton) {
                labelsButton.textContent = 'Hide Labels';
            }
        }
    } catch (e) {
        console.error("Error reading from localStorage:", e);
    }

    // Prevent multiple initialization
    if (window.TAUDashboard.initialized) {
        // Dashboard already initialized - using existing instance
        return;
    }

    // Dashboard initializing with unified visualization system
    window.TAUDashboard.initialized = true;

    // Remove any existing security breach overlays from previous runs
    const existingOverlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
    existingOverlays.forEach(overlay => {
        overlay.parentNode.removeChild(overlay);
    });

    // Constants for the entire system
    window.TAUDashboard.constants = {
        PHI: 1.618033988749895, // Golden ratio (φ = (1 + √5)/2)
        TWO_PI: Math.PI * 2,
        // Prime number harmonics used for security pattern generation
        PRIMES: [7, 11, 13, 17]
    };

    // Get all DOM elements
    const elements = {
        // Main elements
        tokenContainer: document.getElementById('token-container'),
        tokenContainerMain: document.getElementById('token-container'), // Updated from token-container-main
        advancedVis: document.getElementById('advanced-visualization'),
        quantumContainer: document.getElementById('quantum-container'),
        astronomicalContainer: document.getElementById('astronomical-container'),

        // Data elements
        tokenValueElement: document.getElementById('token-value'),
        tokenValueMain: document.getElementById('token-value-main'),
        dataTokenValue: document.getElementById('data-token-value'),
        dataRotation: document.getElementById('data-rotation'),
        dataTime: document.getElementById('data-time'),
        integratedDataTime: document.getElementById('integrated-data-time'),

        // Controls
        toggleLabelsButton: document.getElementById('toggle-labels'),
    };

    // Store elements in the namespace
    window.TAUDashboard.elements = elements;

    // Initialize time tracking
    let vortexTime = 0;

    // Timing variables for smooth animation
    let lastUpdateTime = 0;

    // Format numbers nicely (defined at top level scope)
    function formatNumber(num) {
        return (Math.round(num * 10000) / 10000).toFixed(4);
    }

    // Enhanced AshToken implementation with integrated security properties
    // Create within our TAUDashboard namespace to prevent conflicts
    window.TAUDashboard.AshToken = {
        // CPPN token generator synchronized with swisseph
        generate: function() {
            const now = new Date();

            // Use high-precision performance timing for microsecond precision
            // This provides the fine granularity needed for security calculations
            // while maintaining astronomical synchronization
            const highPrecisionTime = window.TAUDashboard.preciseTimestamp ?
                                   (window.TAUDashboard.preciseTimestamp.elapsedMs / 1000) :
                                   performance.now() / 1000;

            // Get timestamp in milliseconds with microsecond precision from performance API
            const timestamp = now.getTime() + (highPrecisionTime % 1);

            // Calculate Julian Day Number (JDN) for proper astronomical sync with enhanced precision
            // JDN = (timestamp / 86400000) + 2440587.5
            const julianDay = (timestamp / 86400000) + 2440587.5;

            // Use normalized JDN fraction for astronomical synchronization
            const normalizedJulianDay = julianDay % 1;

            // Calculate ephemeris-based planetary positions (simplified)
            // In a production system, these would come from the Swiss Ephemeris API
            const planetaryFactors = {
                mercury: normalizedJulianDay * 4.152,  // Mercury: ~88 day orbit
                venus: normalizedJulianDay * 1.624,    // Venus: ~225 day orbit
                earth: normalizedJulianDay,            // Earth: 365.25 day orbit (reference)
                mars: normalizedJulianDay * 0.532      // Mars: ~687 day orbit
            };

            // Generate oscillations using prime number harmonics for cryptographic properties
            // Each oscillation is influenced by both time and a specific planetary position
            const TWO_PI = window.TAUDashboard.constants.TWO_PI;
            const PRIMES = window.TAUDashboard.constants.PRIMES;

            const p1 = Math.sin(normalizedJulianDay * TWO_PI * PRIMES[0]) * (1 + Math.sin(planetaryFactors.mercury) * 0.2);
            const p2 = Math.cos(normalizedJulianDay * TWO_PI * PRIMES[1]) * (1 + Math.sin(planetaryFactors.venus) * 0.2);
            const p3 = Math.sin(normalizedJulianDay * TWO_PI * PRIMES[2]) * (1 + Math.sin(planetaryFactors.earth) * 0.2);
            const p4 = Math.cos(normalizedJulianDay * TWO_PI * PRIMES[3]) * (1 + Math.sin(planetaryFactors.mars) * 0.2);

            // Combine using golden ratio weighted mixing for mathematical significance
            const PHI = window.TAUDashboard.constants.PHI; // Golden ratio
            const tokenValue = (p1 * p2 * 0.5) + (p3 * p4 * (1/PHI) * 0.5);

            // Calculate standard time components for display and rotation
            const seconds = now.getSeconds();
            const minutes = now.getMinutes();
            const hours = now.getHours();

            // Security properties derived from token harmonics
            // These values are used by the visual components to create
            // security through mathematics
            const securityProperties = {
                // Harmonic spectrum analysis (provides entropy source)
                harmonics: [p1, p2, p3, p4],
                // Position vectors for visualization
                position: {
                    x: p1 * p4,
                    y: p2 * p3,
                    z: tokenValue
                },
                // Mathematical signature based on prime relations - prevent division by zero
                signature: (p1 + p2) / (p3 + p4 + 0.00001),
                // Penrose tiling seed value using golden ratio
                penroseSeed: Math.abs(p1 * p3 * PHI),
                // Hilbert space coordinate depth factor
                hilbertDepth: 3 + Math.floor(Math.abs(tokenValue) * 2)
            };

            // Calculate precise rotation value based on astronomical time
            const rotation = seconds / 60 * 360 + tokenValue * 20;

            return {
                value: tokenValue,
                time: normalizedJulianDay,
                timestamp: now,
                julianDay: julianDay,
                rotation: rotation,
                // Include security properties for component integration
                security: securityProperties
            };
        },

        // Render the Ash Token visualization
        render: function(container, token) {
            if (!container) {
                console.error("Security breach: Container missing for Ash token");
                throw new Error("Security breach: Container missing for Ash token");
            }

            // Create a canvas if it doesn't exist
            let canvas = container.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = container.clientWidth || 200;
                canvas.height = container.clientHeight || 200;
                container.appendChild(canvas);
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Security breach: Canvas context unavailable");
                throw new Error("Security breach: Canvas context unavailable");
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set up dimensions
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.9;

            // Draw minimal background
            ctx.fillStyle = "rgba(15, 20, 40, 1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Validate essential token properties - critical security validation
            if (!token || !token.security || !token.julianDay) {
                console.error("Security breach: Token missing critical security properties");
                this.renderFrozen(ctx, canvas.width, canvas.height, "BREACH: Token integrity compromised");
                throw new Error("Security breach: Token integrity compromised");
            }

            // Validate token data for mathematical correctness
            if (!isFinite(token.time) || !isFinite(token.julianDay) || !isFinite(token.value)) {
                console.error("Security breach: Token contains non-finite mathematical values");
                this.renderFrozen(ctx, canvas.width, canvas.height, "BREACH: Mathematical error");
                throw new Error("Security breach: Token contains non-finite values");
            }

            // Pure mathematical representation of time through token
            const TWO_PI = window.TAUDashboard.constants.TWO_PI;
            const PHI = window.TAUDashboard.constants.PHI;

            // No fallbacks - if token.time isn't valid, the security system should halt
            const now = token.time * TWO_PI; // Full cycle (0-2π) from normalized token time

            // Position based on golden ratio for mathematically optimal movement pattern
            // The golden ratio (φ = 1.618033988749895) ensures non-repeating, mathematically significant patterns

            // Get quantum identity input data - this ensures the Ash token receives proper input from Quantum Identity
            const quantumInput = window.TAUDashboard.securityStatus.quantumIdentity;

            // Position cycle with time-based component to ensure visible motion
            // This allows the dot to move continuously
            const normalizedJulianDay = token.julianDay % 1; // Fraction of Julian Day

            // Add active time component to ensure continuous motion
            const activeTime = Date.now() / 5000; // Time-based component for continuous motion

            // Position cycle based on time for continuous movement
            const positionCycle = normalizedJulianDay + activeTime;

            // Draw a simple geometric pattern synchronized with the token value
            // This creates the spinning vortex pattern
            for (let s = 0; s < 8; s++) {
                ctx.beginPath();
                // Use colors derived from security-relevant values - no fallbacks
                const harmonic = token.security.harmonics[s % 4];
                ctx.strokeStyle = `hsla(${s * 45 + harmonic * 30}, 70%, 60%, 0.3)`;
                ctx.lineWidth = 1;

                // Calculate a time-based rotation to ensure the vortex spins visibly
                const activeRotation = Date.now() / 10000; // Time-based rotation

                // Apply the rotation to create a continuously spinning vortex
                const timeOffset = ((token.julianDay % 1) + activeRotation) * TWO_PI * 0.5;

                for (let i = 0; i < 100; i++) {
                    const t = i / 100;
                    // This angle calculation creates the spiral pattern and animation
                    const angle = t * Math.PI * 10 + s * Math.PI / 4 + timeOffset;
                    const r = radius * t;

                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.stroke();
            }

            // The white point represents the quantum identity within mathematical order
            // Movement follows golden ratio-based path with active component to ensure visibility
            // Use the PHI constant from window.TAUDashboard.constants
            const pointAngle = (positionCycle / window.TAUDashboard.constants.PHI) * Math.PI; // Golden ratio based path

            // Make the point pulse synchronized with position cycle for mathematical harmony
            // The mathematical relationship is maintained while ensuring visible animation
            const pulseSpeed = positionCycle * 10;
            const pointRadius = 5 + Math.sin(pulseSpeed) * 2.5; // Visible pulsing

            // Create a varied orbital path based on golden ratio and position cycle
            // This maintains the CPPN's mathematical relationships while ensuring visible movement
            const pointDistance = radius * (0.42 + Math.sin(positionCycle * window.TAUDashboard.constants.PHI) * 0.08);

            // Calculate precise positions - no fallbacks for security critical calculations
            const pointX = centerX + pointDistance * Math.cos(pointAngle);
            const pointY = centerY + pointDistance * Math.sin(pointAngle);

            // Create more vibrant aura representing quantum state - enhanced for visibility
            ctx.beginPath();
            ctx.arc(pointX, pointY, pointRadius * 2.5, 0, Math.PI * 2);

            // Create enhanced gradient for better visibility of the moving dot
            try {
                const auraGradient = ctx.createRadialGradient(
                    pointX, pointY, 0,
                    pointX, pointY, pointRadius * 2.5
                );
                // Brighter white core fading to vivid blue - increased visibility
                auraGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                auraGradient.addColorStop(0.3, 'rgba(200, 230, 255, 0.85)');
                auraGradient.addColorStop(0.7, 'rgba(120, 180, 255, 0.6)');
                auraGradient.addColorStop(1, 'rgba(80, 140, 255, 0.3)');

                ctx.fillStyle = auraGradient;
            } catch (e) {
                // If gradient creation fails, this is a critical security issue
                console.error("Security breach: Critical rendering error:", e);
                this.renderFrozen(ctx, canvas.width, canvas.height, "BREACH: Rendering error");
                throw e;
            }
            ctx.fill();

            // Bright white center - core of the quantum identity
            ctx.beginPath();
            ctx.arc(pointX, pointY, pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Pure white center for the quantum identity
            ctx.fill();

            // Draw a simple orbit path to represent the mathematical trajectory
            ctx.beginPath();
            ctx.arc(centerX, centerY, pointDistance, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        },

        // Render a frozen token state when security breach is detected
        renderFrozen: function(ctx, width, height, message) {
            // Fill with red security breach background
            ctx.fillStyle = "rgba(40, 10, 10, 1)";
            ctx.fillRect(0, 0, width, height);

            // Add warning overlay
            ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Add warning text
            ctx.fillStyle = "white";
            ctx.font = "12px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Æ Token FROZEN", centerX, centerY - 15);
            ctx.fillText(message || "Security protocol activated", centerX, centerY + 15);
        }
    };

    // Render the Penrose-inspired pattern for Quantum Identity visualization
    function renderPenrosePattern(container, token) {
        if (!container) {
            console.error("Security breach: Container missing for Penrose pattern");
            throw new Error("Security breach: Container missing for Penrose pattern");
        }

        // Create a canvas if it doesn't exist
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = container.clientWidth || 200;
            canvas.height = container.clientHeight || 200;
            container.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("Security breach: Canvas context unavailable for Penrose pattern");
            throw new Error("Security breach: Canvas context unavailable for Penrose pattern");
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw minimal background
        ctx.fillStyle = "rgba(10, 15, 30, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.9;

        // Validate token security properties - critical security validation
        if (!token || !token.security || !token.security.harmonics || !token.security.penroseSeed) {
            console.error("Security breach: Token missing security properties for Penrose pattern");
            renderFrozenPattern(ctx, canvas.width, canvas.height, "BREACH: Token integrity compromised");
            throw new Error("Security breach: Token missing security properties for Penrose pattern");
        }

        // Get the astronomical feed to ensure synchronization with Julian Day
        const astroFeed = window.TAUDashboard.securityStatus.astronomicalFeed;

        // Use normalized time value from Julian Day - ensuring all components are in sync
        const TWO_PI = window.TAUDashboard.constants.TWO_PI;
        const julianDayFraction = astroFeed && astroFeed.normalizedJulianDay ?
                                 astroFeed.normalizedJulianDay :
                                 token.julianDay % 1;
        const now = julianDayFraction * TWO_PI;

        // Create a Penrose-inspired tiling based on golden ratio
        const PHI = window.TAUDashboard.constants.PHI; // Golden ratio
        const penroseDepth = 5; // Depth of recursion for the pattern

        // Use security properties from token to seed the pattern - no fallbacks
        const penroseSeed = token.security.penroseSeed;

        // Store quantum identity data for Ash token to use
        // Include astronomical data to maintain the proper flow through components
        window.TAUDashboard.securityStatus.quantumIdentity = {
            penroseSeed: penroseSeed,
            rotationValue: astronomicalRotation, // Use astronomically derived rotation
            julianDay: token.julianDay,
            // Don't include references to objects to avoid circular references
            updateTime: Date.now()
        };

        // Draw quantum entropy star-field background
        // This represents the quantum entropy field that provides the security base
        const starCount = 150; // Number of stars in the background

        // Add active component for visible animation while maintaining original design
        const activeTime = Date.now() / 20000; // Very slow-moving component for subtle animation

        for (let i = 0; i < starCount; i++) {
            // Use token security properties to derive star positions
            // This ensures the stars are actually part of the security system, not just decoration
            const seed = token.security.harmonics[i % 4];
            const angle = Math.PI * 2 * ((i * PHI) % 1) + (seed * Math.PI);

            // Use deterministic position based on golden ratio with subtle movement
            const dist = (0.3 + ((i * PHI) % 0.7) + Math.sin(activeTime + i * 0.1) * 0.05) * radius;

            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            // Star size varies with token security properties
            const starSize = Math.max(0.5, 0.5 + ((i * PHI) % 1.2) + (seed * 0.8));

            // Star color varies with token harmonics
            // Map harmonics to a hue value (stay in blue range)
            const starHue = 180 + token.security.harmonics[i % 4] * 40;

            // Star brightness varies deterministically with subtle animation
            const brightness = 50 + ((i * julianDayFraction * seed * 100) % 30) +
                               Math.sin(activeTime * Math.PI * 2 + i * 0.1) * 10;

            // Opacity also deterministic with subtle animation
            const opacity = 0.3 + ((i * julianDayFraction * seed * 100) % 0.4) +
                            Math.sin(activeTime * Math.PI + i * 0.2) * 0.1;

            // Draw the star
            ctx.beginPath();
            ctx.arc(x, y, starSize, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${starHue}, 70%, ${brightness}%, ${opacity})`;
            ctx.fill();
        }

        // Draw the Penrose-inspired pattern
        ctx.save();
        ctx.translate(centerX, centerY);

        // Calculate rotation based on Julian Day from astronomical data
        // This ensures the pattern rotation is driven by astronomical synchronization
        const astronomicalRotation = astroFeed && astroFeed.julianDay ?
                                    (astroFeed.julianDay * 10) % 360 : // Derive rotation from Julian Day
                                    token.rotation; // Fallback to token rotation

        // Convert to radians for rotation application
        const rotationRadians = astronomicalRotation * (Math.PI / 180);
        ctx.rotate(rotationRadians);

        // Draw pentagon structure (5-fold symmetry is key to Penrose tilings)
        const sides = 5; // Pentagon

        // Generate multiple nested pentagons with golden ratio scaling
        for (let level = 0; level < penroseDepth; level++) {
            const scale = Math.pow(1/PHI, level); // Each level scales by inverse golden ratio
            const r = radius * scale;

            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (i * 2 * Math.PI / sides) + penroseSeed;
                const x = r * Math.cos(angle);
                const y = r * Math.sin(angle);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // Use colors derived from token harmonics - no fallbacks
            const hue = 180 + token.security.harmonics[level % 4] * 40;

            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 + level * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw connecting lines to create the Penrose structure
        for (let i = 0; i < sides; i++) {
            const angle1 = (i * 2 * Math.PI / sides) + penroseSeed;
            const angle2 = ((i+2) % sides * 2 * Math.PI / sides) + penroseSeed;

            ctx.beginPath();
            ctx.moveTo(radius * Math.cos(angle1), radius * Math.sin(angle1));
            ctx.lineTo(radius * Math.cos(angle2) / PHI, radius * Math.sin(angle2) / PHI);

            ctx.strokeStyle = 'rgba(120, 180, 255, 0.25)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // Restore the context to undo the rotation and translation
        ctx.restore();
    }

    // Helper function to render a frozen pattern when security breach is detected
    function renderFrozenPattern(ctx, width, height, message) {
        // Fill with red security breach background
        ctx.fillStyle = "rgba(40, 10, 10, 1)";
        ctx.fillRect(0, 0, width, height);

        // Add warning overlay
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // Add warning text
        ctx.fillStyle = "white";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Quantum Identity FROZEN", centerX, centerY - 15);
        ctx.fillText(message || "Security protocol activated", centerX, centerY + 15);
    }

    // Render the Astronomical Synchronization component with a timepiece snapshot
    function renderAstronomicalSync(container, token) {
        if (!container) {
            console.error("Security breach: Container missing for Astronomical Synchronization");
            throw new Error("Security breach: Container missing for Astronomical Synchronization");
        }

        // Validate token properties - critical for astronomical synchronization
        if (!token || !token.julianDay || !isFinite(token.julianDay) || !token.timestamp) {
            console.error("Security breach: Token missing critical astronomical data");
            renderFrozenAstronomical(container, "BREACH: Astronomical data invalid");
            throw new Error("Security breach: Token missing critical astronomical data");
        }

        // Store Julian Day in global security state to ensure all components are synchronized
        window.TAUDashboard.securityStatus.astronomicalFeed = {
            julianDay: token.julianDay,
            normalizedJulianDay: token.julianDay % 1,
            updateTime: Date.now()
        };

        // Remove SVG element if it exists (non-functional top clock)
        const svgElement = container.querySelector('object');
        if (svgElement) {
            container.removeChild(svgElement);
        }

        // Remove jdOverlay if it exists
        const jdOverlay = container.querySelector('.jd-overlay');
        if (jdOverlay) {
            container.removeChild(jdOverlay);
        }

        const dataTimeEl = document.getElementById('data-time');
        if (dataTimeEl) {
            dataTimeEl.textContent = token.julianDay.toFixed(7);
        }

        // If using fallback canvas, update it
        const fallbackCanvas = container.querySelector('.fallback-canvas');
        if (fallbackCanvas && fallbackCanvas.style.display === 'block') {
            updateFallbackCanvas(fallbackCanvas, token);
        }

        // We're only using the canvas now - directly use it

        // Ensure the astronomical canvas is visible and updated
        const astronomicalCanvas = container.querySelector('#astronomical-canvas');
        if (astronomicalCanvas) {
            // Make sure canvas is visible
            astronomicalCanvas.style.display = 'block';
            
            // Initialize the astronomical canvas if it hasn't been already
            if (!window.TAUDashboard.astronomicalClockInitialized) {
                // We've defined initAstronomicalCanvas in the global scope
                window.initAstronomicalCanvas(astronomicalCanvas, token);
                window.TAUDashboard.astronomicalClockInitialized = true;
            } else {
                // Update the astronomical canvas with new token data
                window.updateAstronomicalCanvas(astronomicalCanvas, token);
            }
            
            // Make sure the Julian Day value is used for the data card
            const dataTimeEl = document.getElementById('data-time');
            if (dataTimeEl) {
                dataTimeEl.textContent = token.julianDay.toFixed(7);
            }
        }

        // Function to update the fallback canvas if needed
        function updateFallbackCanvas(canvas, token) {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Security breach: Canvas context unavailable for Astronomical Sync");
                throw new Error("Security breach: Canvas context unavailable for Astronomical Sync");
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background - match SVG color (#0c1428)
            ctx.fillStyle = "#0c1428";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.85;

            // Draw outer clock face - match SVG color (#3a5a8c)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#3a5a8c';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw degree markings - match SVG
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.07, 0, Math.PI * 2);
            ctx.strokeStyle = '#2e4b6a';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 10]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw hour ticks - match SVG color (#6b96cc)
            for (let i = 0; i < 12; i++) {
                const angle = i * Math.PI / 6;
                ctx.beginPath();
                ctx.moveTo(
                    centerX + Math.cos(angle) * radius * 0.95,
                    centerY + Math.sin(angle) * radius * 0.95
                );
                ctx.lineTo(
                    centerX + Math.cos(angle) * radius * 0.85,
                    centerY + Math.sin(angle) * radius * 0.85
                );
                ctx.strokeStyle = '#6b96cc';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw cardinal directions - match SVG color (#89c4f4)
            ctx.font = '12px monospace';
            ctx.fillStyle = '#89c4f4';
            ctx.textAlign = 'center';

            // North, East, South, West
            ctx.fillText("N", centerX, centerY - radius * 0.8);
            ctx.fillText("E", centerX + radius * 0.8, centerY);
            ctx.fillText("S", centerX, centerY + radius * 0.8);
            ctx.fillText("W", centerX - radius * 0.8, centerY);

            // Draw simplified planets - match SVG colors exactly
            const planets = [
                { name: "Sun", distance: radius * 0.6, angle: 30 * Math.PI/180, size: 8, color: "#f7dc6f" },
                { name: "Mercury", distance: radius * 0.3, angle: 120 * Math.PI/180, size: 3, color: "#d0d3d4" },
                { name: "Venus", distance: radius * 0.5, angle: 200 * Math.PI/180, size: 5, color: "#e59866" },
                { name: "Mars", distance: radius * 0.7, angle: 280 * Math.PI/180, size: 4, color: "#cb4335" },
                { name: "Jupiter", distance: radius * 0.4, angle: 330 * Math.PI/180, size: 6, color: "#f5cba7" },
                { name: "Saturn", distance: radius * 0.65, angle: 160 * Math.PI/180, size: 7, color: "#f9e79f" },
                { name: "Moon", distance: radius * 0.25, angle: 80 * Math.PI/180, size: 5, color: "#f4f6f7" }
            ];

            planets.forEach(planet => {
                const x = centerX + Math.cos(planet.angle) * planet.distance;
                const y = centerY + Math.sin(planet.angle) * planet.distance;

                ctx.beginPath();

                // For Saturn, draw ellipse if possible
                if (planet.name === "Saturn" && ctx.ellipse) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(Math.PI / 4);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, planet.size, planet.size * 0.7, 0, 0, Math.PI * 2);
                    ctx.restore();
                } else {
                    ctx.arc(x, y, planet.size, 0, Math.PI * 2);
                }

                ctx.fillStyle = planet.color;
                ctx.fill();
            });

            // Draw the current time
            const seconds = token.timestamp.getSeconds();
            const minutes = token.timestamp.getMinutes();
            const hours = token.timestamp.getHours() % 12;

            // Draw hour, minute, second hands - match SVG colors exactly
            drawHand(ctx, centerX, centerY, (hours + minutes/60) * Math.PI/6 - Math.PI/2, radius * 0.6, 4, '#89c4f4'); // Hour
            drawHand(ctx, centerX, centerY, minutes * Math.PI/30 - Math.PI/2, radius * 0.75, 3, '#a9cce3'); // Minute
            drawHand(ctx, centerX, centerY, seconds * Math.PI/30 - Math.PI/2, radius * 0.85, 1, '#d4e6f1'); // Second

            // Draw center point - match SVG color (#5dade2)
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#5dade2';
            ctx.fill();

            // Don't display Julian Day text on the clock
            ctx.font = '11px monospace';
            ctx.fillStyle = '#89c4f4';
            ctx.textAlign = 'center';
            ctx.fillText("Astronomical Clock", centerX, centerY - radius * 0.3);
        }

        // Helper function to draw clock hands
        function drawHand(ctx, centerX, centerY, angle, length, width, color) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    // Helper function to render a frozen astronomical display when security breach is detected
    function renderFrozenAstronomical(container, message) {
        // Remove any existing content
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Create a canvas for the frozen state
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth || 200;
        canvas.height = container.clientHeight || 200;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with red security breach background
        ctx.fillStyle = "rgba(40, 10, 10, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add warning overlay
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Add warning text
        ctx.fillStyle = "white";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Astronomical Sync FROZEN", centerX, centerY - 15);
        ctx.fillText(message || "Security protocol activated", centerX, centerY + 15);

        // Add Julian Day overlay text showing the error
        const jdOverlay = document.createElement('div');
        jdOverlay.className = 'jd-overlay';
        jdOverlay.style.position = 'absolute';
        jdOverlay.style.bottom = '10px';
        jdOverlay.style.left = '0';
        jdOverlay.style.width = '100%';
        jdOverlay.style.textAlign = 'center';
        jdOverlay.style.color = 'rgba(255, 100, 100, 0.9)';
        jdOverlay.style.fontFamily = 'monospace';
        jdOverlay.style.fontSize = '11px';
        jdOverlay.style.padding = '5px';
        jdOverlay.style.background = 'rgba(40, 10, 10, 0.8)';
        jdOverlay.style.display = 'none'; // Hide the Julian Day display
        jdOverlay.textContent = `Julian Day: ERROR`;
        container.appendChild(jdOverlay);
    }

    // Global system status to track security state
    window.TAUDashboard.securityStatus = {
        systemActive: true,
        breachDetected: false,
        breachReason: null,
        breachTimestamp: null,
        // Actively track the astronomical data feeding into quantum identity
        astronomicalFeed: {
            julianDay: null,
            normalizedJulianDay: null,
            updateTime: null
        },
        // Actively track the quantum identity feeding into the Ash token
        quantumIdentity: {
            penroseSeed: null,
            rotationValue: null,
            updateTime: null
        }
    };

    // Single update function for all visualizations with stabilized timing
    // Expose updateVisualizations globally so it can be called from HTML
    window.updateVisualizations = function updateVisualizations() {
        // Check for system-wide security breach
        if (window.TAUDashboard.securityStatus.breachDetected) {
            // System is frozen - do not continue visualization updates
            return;
        }

        // Only update at 30fps to prevent performance issues
        const now = Date.now();
        if (now - lastUpdateTime < 33) { // ~30fps (1000ms/30 ≈ 33ms)
            return;
        }

        lastUpdateTime = now;

        try {
            // Generate token with consistent time base using our enhanced AshToken
            const token = window.TAUDashboard.AshToken.generate();

            // Get reference to constants
            const TWO_PI = window.TAUDashboard.constants.TWO_PI;

            // Use Julian Day fraction directly for perfect synchronization
            // This ensures the vortex spins according to Julian Day
            // No fallbacks - if julianDay is invalid, let it throw an error
            const julianDayFraction = token.julianDay % 1;
            vortexTime = julianDayFraction * TWO_PI;

            // Update the astronomical feed that drives the quantum identity
            window.TAUDashboard.securityStatus.astronomicalFeed = {
                julianDay: token.julianDay,
                normalizedJulianDay: julianDayFraction,
                updateTime: Date.now()
            };

            // Get elements reference from global namespace
            const elements = window.TAUDashboard.elements;

            // Update static header cards with token values
            const staticHarmonic = document.getElementById('static-harmonic');
            if (staticHarmonic) {
                staticHarmonic.textContent = formatNumber(token.value);
            }

            const staticRotation = document.getElementById('static-rotation');
            if (staticRotation) {
                staticRotation.textContent = `${Math.round(token.rotation)}°`;
            }
            
            // Generate and update dynamic system signature
            const dynamicSignature = document.getElementById('dynamic-signature');
            if (dynamicSignature) {
                // Generate a deterministic but unique signature based on token values
                const seed = Math.abs(token.value * 10000);
                const prefix = 'Æ-';
                
                // Use token security properties for a more complex signature
                const harmonics = token.security && token.security.harmonics ? token.security.harmonics : [0, 0, 0, 0];
                
                // Generate each part of the signature using different aspects of the token
                const part1 = Math.floor(Math.abs(harmonics[0] || 0) * 10000).toString(16).padStart(4, '0').toUpperCase();
                const part2 = Math.floor(Math.abs(harmonics[1] || 0) * 10000).toString(16).padStart(4, '0').toUpperCase();
                const part3 = Math.floor(Math.abs(token.rotation / 3.6) % 256).toString(16).padStart(2, '0').toUpperCase() + 
                             Math.floor(seed % 256).toString(16).padStart(2, '0').toUpperCase();
                
                // Set the dynamically generated system signature
                dynamicSignature.textContent = `${prefix}${part1}-${part2}-${part3}`;
            }
            
            // Keep updating the hidden original elements for backward compatibility
            if (elements.dataTokenValue) {
                elements.dataTokenValue.textContent = formatNumber(token.value);
            }

            if (elements.dataRotation) {
                elements.dataRotation.textContent = `${Math.round(token.rotation)}°`;
            }
            
            // System signature remains static, no need to update
            
            // Update Julian Cycle display in the integrated view (if it exists)
            if (elements.integratedDataTime) {
                elements.integratedDataTime.textContent = token.julianDay.toFixed(7);
            }
            
            // Legacy elements - keep for backward compatibility but they may not be used anymore
            if (elements.tokenValueElement) {
                elements.tokenValueElement.textContent = formatNumber(token.value);
            }
            
            if (elements.tokenValueMain) {
                elements.tokenValueMain.textContent = formatNumber(token.value);
            }

            // Render the three core security components in proper sequence:
            // 1. Astronomical Synchronization feeds into 2. Quantum Identity, which generates 3. Ash Token

            // First, render Astronomical Synchronization
            if (elements.astronomicalContainer) {
                renderAstronomicalSync(elements.astronomicalContainer, token);
            }

            // Next, render Quantum Identity with input from Astronomical Synchronization
            if (elements.quantumContainer) {
                renderPenrosePattern(elements.quantumContainer, token);

                // Update the quantum identity feed that drives the Ash token
                window.TAUDashboard.securityStatus.quantumIdentity = {
                    penroseSeed: token.security.penroseSeed,
                    rotationValue: token.rotation,
                    updateTime: Date.now()
                };
            }

            // Finally, render Ash Token with input from Quantum Identity
            if (elements.tokenContainer) {
                window.TAUDashboard.AshToken.render(elements.tokenContainer, token);
            }

            if (elements.tokenContainerMain) {
                window.TAUDashboard.AshToken.render(elements.tokenContainerMain, token);
            }

            // Render the Identity Vortex (integration of all three components)
            if (elements.advancedVis) {
                const vortexCanvas = document.getElementById('integrated-canvas');
                if (vortexCanvas) {
                    // Make sure canvas fills the container
                    if (vortexCanvas.width !== elements.advancedVis.clientWidth ||
                        vortexCanvas.height !== elements.advancedVis.clientHeight) {
                        vortexCanvas.width = elements.advancedVis.clientWidth;
                        vortexCanvas.height = elements.advancedVis.clientHeight;
                    }

                    // Render directly to the canvas
                    const ctx = vortexCanvas.getContext('2d');
                    if (ctx) {
                        renderIdentityVortex(ctx, vortexCanvas.width, vortexCanvas.height, token);
                    }
                }
            }
        } catch (err) {
            // CRITICAL SECURITY BREACH DETECTED
            // Stop the entire animation system when a security breach occurs
            console.error("SECURITY BREACH DETECTED:", err);

            // Record the security breach
            window.TAUDashboard.securityStatus.breachDetected = true;
            window.TAUDashboard.securityStatus.breachReason = err.message || "Unknown security breach";
            window.TAUDashboard.securityStatus.breachTimestamp = new Date();

            // Get elements to show the frozen state across all visualizations
            const elements = window.TAUDashboard.elements;

            // Render frozen states in all containers
            if (elements.tokenContainerMain) {
                const ctx = elements.tokenContainerMain.querySelector('canvas')?.getContext('2d');
                if (ctx) {
                    window.TAUDashboard.AshToken.renderFrozen(
                        ctx,
                        elements.tokenContainerMain.clientWidth,
                        elements.tokenContainerMain.clientHeight,
                        "System frozen due to security breach"
                    );
                }
            }

            // Update display text to show frozen state
            if (elements.tokenValueMain) {
                elements.tokenValueMain.textContent = "FROZEN";
            }

            if (elements.dataTokenValue) {
                elements.dataTokenValue.textContent = "FROZEN";
            }

            if (elements.dataRotation) {
                elements.dataRotation.textContent = "FROZEN";
            }

            // Just log the error but don't cancel animation
            // We want the system to continue trying to visualize

            // Add a more subtle error indicator instead of a full-screen overlay
            console.error("Visualization error:", err);

            // Update text displays to show error state
            if (elements.tokenValueMain) {
                elements.tokenValueMain.textContent = "𝜏 Harmonic: Recalculating...";
            }

            if (elements.dataTokenValue) {
                elements.dataTokenValue.textContent = "Recalculating...";
            }

            // Continue animation by restarting it
            setTimeout(() => {
                startAnimation();
            }, 1000);
        }
    }

    // Render the Identity Vortex - a true integration of all three identity components
    // This creates a visual representation of how the three components work together
    // IDENTITY FLOW: 1. Astronomical Synchronization (Source) produces 2. Quantum Identity mechanism, which generates 3. Ash Token
    function renderIdentityVortex(ctx, width, height, token) {
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // Get Quantum Identity input data at the beginning to use throughout the function
        // This ensures it's available for all parts of the visualization
        const quantumInput = window.TAUDashboard.securityStatus.quantumIdentity;

        // Fill with dark background
        ctx.fillStyle = "rgba(10, 15, 30, 1)";
        ctx.fillRect(0, 0, width, height);

        // Normalized time value (0-2π) - from Astronomical Synchronization
        // Use constants from the global namespace
        const TWO_PI = window.TAUDashboard.constants.TWO_PI;
        const PHI = window.TAUDashboard.constants.PHI;

        // Ensure token.time is valid
        const tokenTime = isFinite(token.time) ? token.time : 0;
        const time = tokenTime * TWO_PI; // Full cycle (0-2π) from normalized token time

        // 1. ASTRONOMICAL SYNCHRONIZATION - Primary driver of the system
        // Julian Day rotation factor - the driver of the entire security system
        // This is the SOURCE that produces Quantum Identity
        // Extract normalized Julian Day fraction for rotation (0-1 range)
        const julianDayFraction = isFinite(token.julianDay) ? token.julianDay % 1 : 0;
        
        // Calculate astronomical timing cycles
        const JULIAN_DAY_SECONDS = 86400; // One rotation per Julian Day (used by primary hand)
        const SECONDARY_CYCLE = 7200; // Secondary indicator rotates every 7,200 seconds (2 hours)
        const TERTIARY_CYCLE = SECONDARY_CYCLE / PHI; // ~4,450 seconds - golden ratio relationship
        
        // Calculate temporal phase based on astronomical clock cycles
        // Ensure we have valid token data with proper fallback
        const julianDaySeconds = token && token.julianDay ? 
                               (token.julianDay % 1) * JULIAN_DAY_SECONDS : 
                               (Date.now() / 86400000) % 1 * JULIAN_DAY_SECONDS;
        
        const tertiaryPhase = isFinite(julianDaySeconds) ? 
                            (julianDaySeconds % TERTIARY_CYCLE) / TERTIARY_CYCLE : 
                            (Date.now() / TERTIARY_CYCLE) % 1;
        
        // Convert to radians (0-2π) for smooth rotation based on astronomical time
        // Standard rotation for the integrated view - FOUNDATIONAL to the entire system
        const globalRotation = julianDayFraction * Math.PI * 2;

        // Draw quantum entropy star-field background - EXACTLY the same as in Quantum Identity
        // This represents the quantum entropy field that provides security foundation
        const starCount = 150; // Same as in Quantum Identity
        const maxRadius = Math.min(width, height) * 0.45;

        // First create the star field across the whole canvas
        for (let i = 0; i < starCount; i++) {
            // Use token security properties to derive star positions - EXACTLY as in Quantum Identity
            // This ensures the stars are actually part of the security system, not just decoration
            const seed = token.security && token.security.harmonics ?
                          Math.abs(token.security.harmonics[i % 4] || 0.5) :
                          Math.random();
            const angle = Math.PI * 2 * ((i * PHI) % 1) + (seed * Math.PI);

            // Distribute stars across the entire canvas
            const dist = Math.random() * Math.max(width, height) * 0.7;

            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;

            // Make sure the star is within the canvas
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                // Star size - EXACTLY MATCHING Quantum Identity pattern
                const starSize = Math.max(0.5, 0.5 + ((i * PHI) % 1.2) + (seed * 0.8));

                // Star color varies with token harmonics - SAME as Quantum Identity
                let starHue = 210;
                if (token.security && token.security.harmonics) {
                    // Map harmonics to a hue value (stay in blue range)
                    starHue = 180 + (token.security.harmonics[i % 4] || 0) * 40;
                }

                // Star brightness varies with Julian Day for synchronized fluctuation
                // Use a deterministic formula based on index, Julian Day, and seed - SAME as Quantum Identity
                const brightness = 50 + ((i * julianDayFraction * seed * 100) % 40);

                // Opacity also driven by Julian Day and harmonics - SAME as Quantum Identity
                const opacity = 0.3 + ((i * julianDayFraction * (seed + 0.5) * 100) % 0.7);

                // Draw the star
                ctx.beginPath();
                ctx.arc(x, y, starSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${starHue}, 70%, ${brightness}%, ${opacity})`;
                ctx.fill();
            }
        }

        // CRITICAL: Establish the global rotation framework first
        // This creates the foundation for the entire visualization
        // All other elements exist within this rotated coordinate system
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(globalRotation);

        // Draw visual connections showing how Astronomical Sync PRODUCES Quantum Identity
        // This visualizes the security flow where component 1 produces component 2

        // Current time through token - from Astronomical Synchronization
        // Using the same time value as previously calculated
        const now = time; // Already validated and calculated above

        // Position based on golden ratio - from Astronomical Synchronization to Quantum Identity
        // The golden ratio (φ = 1.618033988749895) ensures mathematically significant, non-repeating patterns

        // Position cycle - EXACTLY MATCHING the Ash token's calculation
        // This ensures the identity point's movement is consistent across visualizations
        const activeComponentIntegrated = Date.now() / 10000; // Same active component as Ash token
        const positionCycle = julianDayFraction + activeComponentIntegrated;

        // Draw connection lines showing how Astronomical Sync PRODUCES Quantum Identity
        // This visualizes the security flow from component 1 to component 2
        const astroSyncRadius = maxRadius * 0.75; // Astronomical synchronization radius
        const quantumRadius = maxRadius * 0.4; // Quantum Identity radius

        // Use security properties from token to seed the pattern - same as in Quantum Identity
        // Consistent with the Quantum Identity pattern
        const tilePattern = token.security && token.security.penroseSeed ?
                          token.security.penroseSeed :
                          (Math.abs(token.value) * PHI || 0);

        // Draw flow lines showing the production process
        for (let a = 0; a < 5; a++) { // 5 lines for pentagon symmetry
            const sourceAngle = (a * Math.PI * 2 / 5) + globalRotation;
            const sourceX = astroSyncRadius * Math.cos(sourceAngle);
            const sourceY = astroSyncRadius * Math.sin(sourceAngle);

            const targetAngle = (a * Math.PI * 2 / 5) + tilePattern;
            const targetX = quantumRadius * Math.cos(targetAngle);
            const targetY = quantumRadius * Math.sin(targetAngle);

            // Check all coordinates are valid before creating gradient
            if (!isFinite(sourceX) || !isFinite(sourceY) || !isFinite(targetX) || !isFinite(targetY)) {
                continue; // Skip this connection if any coordinate is not finite
            }

            // Create gradient to show flow direction: Astronomical → Quantum
            let strokeStyle;

            // Only attempt gradient creation if all coordinates are valid
            if (isFinite(sourceX) && isFinite(sourceY) && isFinite(targetX) && isFinite(targetY)) {
                try {
                    const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
                    gradient.addColorStop(0, 'rgba(137, 196, 244, 0.3)'); // Start color from Astronomical Sync
                    gradient.addColorStop(1, `hsla(${180 + a * 20}, 80%, 60%, 0.2)`); // End color matching Quantum Identity
                    strokeStyle = gradient;
                } catch (e) {
                    // If gradient creation fails, use a solid color as fallback
                    console.error("Error creating gradient:", e);
                    strokeStyle = 'rgba(137, 196, 244, 0.3)';
                }
            } else {
                // Fallback to solid color if any coordinate is invalid
                strokeStyle = 'rgba(137, 196, 244, 0.3)';
            }

            ctx.beginPath();
            ctx.moveTo(sourceX, sourceY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        // Draw the spiral vortex using the exact same pattern as in the Ash Token CPPN
        // This vortex pattern should rotate with Julian Day
        for (let s = 0; s < 8; s++) {
            ctx.beginPath();

            // Use the EXACT colors from Ash Token CPPN - using harmonics the same way
            const harmonics = token.security && token.security.harmonics ?
                             token.security.harmonics : [0, 0, 0, 0];

            // This matches the coloring algorithm in TAUDashboard.AshToken.render exactly
            ctx.strokeStyle = `hsla(${s * 45 + (harmonics[s % 4] || 0) * 30}, 70%, 60%, 0.3)`;
            ctx.lineWidth = 1;

            // Calculate a rotation value based directly on the token properties
            // This ensures we don't depend on variables from other functions
            const tokenRotation = token.rotation / 360; // Convert degrees to fraction of a circle

            // Draw the exact same geometric pattern as in the Ash token CPPN
            // This spiral vortex pattern is the core of the CPPN visualization
            for (let i = 0; i < 100; i++) {
                const t = i / 100;

                // Calculate a time-based rotation to match Ash token
                const activeRotation = Date.now() / 10000; // Same time-based rotation as Ash token

                // Apply the rotation to create a continuously spinning vortex
                const timeOffset = ((token.julianDay % 1) + activeRotation) * TWO_PI * 0.5;
                const angle = t * Math.PI * 10 + s * Math.PI / 4 + timeOffset;
                const r = maxRadius * 0.8 * t;

                const x = r * Math.cos(angle);
                const y = r * Math.sin(angle);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
        }

        // Draw the integrated vortex pattern - this is the visual manifestation of the security system
        // combining all three components working together

        // 1. ASTRONOMICAL SYNCHRONIZATION - Julian Day timing driving the system
        // This outer ring represents the celestial timing providing synchronization

        // 2. QUANTUM IDENTITY - PRODUCED BY Astronomical Synchronization
        // This is the EXACT SAME pattern as in the Quantum Identity component
        // The Quantum Identity is PRODUCED BY the Astronomical Synchronization

        // Create a Penrose-inspired tiling based on golden ratio - IDENTICAL to Quantum Identity component
        const penroseDepth = 5; // Depth of recursion for the pattern - SAME as Quantum Identity

        // Use the same tilePattern already defined above
        // This ensures consistency with earlier calculations

        // The Quantum Identity component should rotate based on astronomical data
        // Calculate rotation directly from Julian Day

        // Calculate rotation based on Julian Day from astronomical data
        const integratedRotation = token.julianDay ?
                                 (token.julianDay * 10) % 360 : // Derive rotation from Julian Day
                                 token.rotation; // Fallback to token rotation

        // Convert to radians for rotation application
        const rotationRadians = integratedRotation * (Math.PI / 180);

        // Draw pentagon structure (5-fold symmetry is key to Penrose tilings) - IDENTICAL to Quantum Identity
        const sides = 5; // Pentagon - SAME as Quantum Identity

        // Save the current transform state before rotating
        ctx.save();

        // Apply rotation for proper animation - EXACTLY as in Quantum Identity view
        // Note: We save/restore to avoid affecting other components
        ctx.rotate(rotationRadians);

        // Generate multiple nested pentagons with golden ratio scaling - IDENTICAL to Quantum Identity
        for (let level = 0; level < penroseDepth; level++) {
            const scale = Math.pow(1/PHI, level); // Each level scales by inverse golden ratio - SAME as Quantum Identity
            const r = maxRadius * 0.7 * scale;

            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (i * 2 * Math.PI / sides) + tilePattern;
                const x = r * Math.cos(angle);
                const y = r * Math.sin(angle);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // Use colors derived from token harmonics - EXACTLY SAME as in Quantum Identity
            let hue = 210;
            if (token.security && token.security.harmonics) {
                // Map harmonics to a hue value - SAME as Quantum Identity
                hue = 180 + (token.security.harmonics[level % 4] || 0) * 40;
            }

            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 + level * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw connecting lines to create the Penrose structure - IDENTICAL to Quantum Identity
        for (let i = 0; i < sides; i++) {
            const angle1 = (i * 2 * Math.PI / sides) + tilePattern;
            const angle2 = ((i+2) % sides * 2 * Math.PI / sides) + tilePattern;

            ctx.beginPath();
            ctx.moveTo(maxRadius * 0.7 * Math.cos(angle1), maxRadius * 0.7 * Math.sin(angle1));
            ctx.lineTo(maxRadius * 0.7 * Math.cos(angle2) / PHI, maxRadius * 0.7 * Math.sin(angle2) / PHI);

            ctx.strokeStyle = 'rgba(120, 180, 255, 0.25)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // Restore the context to undo the rotation
        ctx.restore();

        // 3. ASH TOKEN - GENERATED BY Quantum Identity mechanism (which was produced by the Astronomical Source)
        // The Ash Token is the final output of the identity flow: 1 → 2 → 3
        // This demonstrates how the identity expression manifests through the system

        // Calculate identity comet position using a modified formula that allows it to travel
        // freely around the entire interior of the largest concentric ring
        // The position is determined by the tau harmonic value from the token

        // Get the normalized Julian Day for base timing
        const normalizedJulianDayIntegrated = token.julianDay % 1;

        // Using the quantumInput declared at the top of the function

        // Use a dampened movement rate with golden ratio modulation for fluid transitions
        // This creates a more artistic orbital motion with natural-looking variations
        const tauValue = Math.abs(token.value || 0); // Get absolute value of tau harmonic
        
        // Drastically dampen the movement rate to make it extremely subtle
        const dampingFactor = 0.02; // Extremely slow movement (was 0.12 before, which was still too fast)
        const tauBasedSpeed = dampingFactor + (tauValue * 0.01); // Minimal speed variation with tau
        
        // Use a vastly longer time divisor to slow down the motion dramatically
        const activeTimeIntegrated = Date.now() / (90000000 / tauBasedSpeed); // Virtually static (6000x slower than original)
        
        // Use golden ratio to create more aesthetically pleasing orbital patterns
        // This creates non-repeating spiral-like motions
        // Using the global PHI constant
        const goldenOffset = normalizedJulianDayIntegrated * PHI;
        
        // Create a more complex position calculation using golden ratio for fluid transitions
        const positionCycleIntegrated = normalizedJulianDayIntegrated + activeTimeIntegrated * PHI;
        
        // Calculate base angle for rotation, then apply golden ratio modifiers
        const baseAngle = positionCycleIntegrated * TWO_PI; 
        
        // Use golden ratio to modulate the orbital angle with a natural-feeling pattern
        // This creates a more organic, flowing path around the center
        const cometAngle = baseAngle + (Math.sin(positionCycleIntegrated * PHI) * 0.2);
        
        // Enhanced pulse calculation synchronized with astronomical clock
        // This creates a visual pulsation that aligns with the radial position
        const pulseSpeed = tertiaryPhase * Math.PI;
        
        // Create a radial position synchronized with tertiary phase
        // Calculate a position that travels across the full radius of the vortex
        // while maintaining astronomical synchronization
        let radialPosition;
        
        try {
            // Calculate with safety checks and incorporate golden ratio harmonics for more fluid motion
            if (isFinite(tertiaryPhase)) {
                // Main position derived from tertiary phase (the clock's tertiary hand)
                // Use a sine wave to create the full radial motion
                const primaryCycle = Math.abs(Math.sin(tertiaryPhase * Math.PI)) * 0.8; // Full range motion
                
                // Add a smaller secondary harmonic based on golden ratio for more organic movement
                // This creates a motion that feels more natural and less mechanical
                const harmonicOffset = Math.sin(tertiaryPhase * Math.PI * (1/PHI)) * 0.15;
                
                // Allow full radial travel while ensuring the point is intimately tied to the center
                // This enables the identity point to utilize the full radius of the vortex system
                radialPosition = primaryCycle + harmonicOffset;
                
                // Allow full range motion from near center to outer edge
                radialPosition = Math.max(0.05, Math.min(0.85, radialPosition));
            } else {
                // Fallback to a mid-range value if calculation fails
                radialPosition = 0.45; // Mid-radius position as fallback
                console.log("Using fallback radial position - non-finite tertiaryPhase");
            }
            
            // Final safety check
            if (!isFinite(radialPosition)) {
                radialPosition = 0.45; // Ensure we have a valid number
                console.log("Corrected non-finite radialPosition");
            }
        } catch (e) {
            radialPosition = 0.45; // Fallback value in mid-range
            console.error("Error calculating radial position:", e);
        }
        
        // Size pulsation - larger when near center, smaller at outer edges
        // This creates a visual effect of "concentration" at the center
        const sizePulseBase = 4; // Base size
        const sizePulseAmplitude = 2.2; // Size variation range
        const sizePulseFactor = 1 - radialPosition * 0.5; // Inverse relationship with radial position
        
        // Final size calculation with multiple harmonic influences
        const cometHeadSize = sizePulseBase + (Math.sin(pulseSpeed) * sizePulseAmplitude * sizePulseFactor);
        
        // Apply golden ratio variations for natural, non-mechanical movement
        const distanceVariation = 0.08 * Math.sin(baseAngle * (1/PHI) + goldenOffset);
        
        // Scale to travel from 0.05 (near center) to maximum of 0.35 of maxRadius
        // This keeps the identity point traveling near center as requested
        const cometOrbitalDistance = maxRadius * (0.05 + radialPosition + distanceVariation * 0.1);

        // CRITICAL: Calculate identity point position in LOCAL coordinates within the rotated system
        // Using the coordinates relative to the transformation origin (after translate and rotate)
        // This ensures the identity point correctly participates in the global rotation
        // Without this, the point would disrupt the rotational framework
        let cometX = cometOrbitalDistance * Math.cos(cometAngle);
        let cometY = cometOrbitalDistance * Math.sin(cometAngle);

        // Track normalized distance for visual effects - used for orbit coloring and glow intensity
        // This is a standardized value from 0 (center) to 1 (edge)
        const distanceNormalized = radialPosition;

        // Draw the orbit path showing how the Quantum Identity generates the Ash Token
        // This clearly visualizes the identity flow where component 2 generates component 3
        // Only draw if orbital distance is valid
        if (isFinite(cometOrbitalDistance) && cometOrbitalDistance > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, cometOrbitalDistance, 0, Math.PI * 2);
            
            // Enhanced orbit visibility based on distance from center
            // Creates a more vibrant path when the dot is near center
            // This visualizes the "activation" of the system when the comet approaches center
            let orbitAlpha, orbitColor;
            
            // If very close to center, create a more vibrant orbit
            if (distanceNormalized < 0.2) {
                // Calculate intensity boost based on proximity to center
                const proximityFactor = 1 - (distanceNormalized / 0.2);
                
                // Create a slightly pulsing orbit with golden hue when near center
                // This creates visual confirmation of the harmonic connection
                const pulseIntensity = 0.1 * Math.sin(Date.now() / 300) * proximityFactor;
                const baseAlpha = 0.3 + (0.3 * proximityFactor);
                orbitAlpha = baseAlpha + pulseIntensity;
                
                // Shift color toward gold when near center
                const hue = 210 - (50 * proximityFactor); // Shift from blue toward gold
                const saturation = 70 + (10 * proximityFactor);
                const lightness = 60 + (10 * proximityFactor);
                orbitColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${orbitAlpha})`;
            } else {
                // Standard orbit style for outer positions
                orbitColor = 'rgba(120, 180, 255, 0.3)';
            }
            
            ctx.strokeStyle = orbitColor;
            
            // Add a subtle glow to the orbit when near center
            if (distanceNormalized < 0.15) {
                // Start with a slightly wider shadow to create a subtle glow effect
                ctx.shadowColor = 'rgba(180, 220, 255, 0.5)';
                ctx.shadowBlur = 4;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
            
            ctx.lineWidth = 1.2;
            ctx.stroke();
            
            // Reset shadow after drawing
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            
            // Add a permanent bright central energy burst with Penrose star effect
            // Draw a brighter, non-pulsing glow at the center
            const centerGlowSize = 23; // Fixed size, no pulsing
            
            // Create a star-like Penrose pattern at the center
            ctx.save();
            
            // Draw the main glow center with colors complementary to azure (#e2e9fa)
            try {
                const burstGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerGlowSize);
                burstGradient.addColorStop(0, 'rgba(226, 233, 250, 0.75)'); // Azure core, more gentle
                burstGradient.addColorStop(0.3, 'rgba(215, 225, 245, 0.6)'); // Lighter azure, softened
                burstGradient.addColorStop(0.6, 'rgba(200, 215, 240, 0.35)'); // Faded azure, reduced intensity
                burstGradient.addColorStop(1, 'rgba(180, 200, 235, 0)'); // Transparent edge
                
                ctx.beginPath();
                ctx.arc(0, 0, centerGlowSize, 0, Math.PI * 2);
                ctx.fillStyle = burstGradient;
                ctx.fill();
            } catch (e) {
                // Fallback to simpler glow if gradient creation fails
                ctx.beginPath();
                ctx.arc(0, 0, centerGlowSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(226, 233, 250, 0.6)'; // Azure fallback, more gentle
                ctx.fill();
            }
            
            // Add Penrose star effect to the center, rotating with the quantum identity
            const starPoints = 23; // Fixed at 23 points as required
            const innerRadius = centerGlowSize * 0.15;
            const outerRadius = centerGlowSize * 0.35;
            
            // Get rotation from quantum identity mechanism
            // Use tilePattern from the quantum identity for synchronized rotation
            const starRotation = tilePattern || (julianDayFraction * Math.PI);
            
            ctx.beginPath();
            for (let i = 0; i < starPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                // Add starRotation to synchronize with quantum identity
                const angle = (i * Math.PI) / starPoints + starRotation;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            // Use a color complementary to azure with gentle luminescence
            ctx.fillStyle = 'rgba(230, 240, 255, 0.65)'; 
            ctx.fill();
            
            ctx.restore();
        }

        // Draw subtle connection lines from Quantum Identity to Ash Token
        // This shows how the Quantum Identity mechanism feeds into the comet path
        const connectionPoints = 3; // Just a few subtle connection lines
        for (let c = 0; c < connectionPoints; c++) {
            const sourceAngle = (c * Math.PI * 2 / connectionPoints) + (now * 0.1);
            const sourceRadius = maxRadius * 0.35; // Source from Quantum Identity
            const sourceX = sourceRadius * Math.cos(sourceAngle);
            const sourceY = sourceRadius * Math.sin(sourceAngle);

            // Check for valid coordinates before creating gradient
            if (!isFinite(sourceX) || !isFinite(sourceY) || !isFinite(cometX) || !isFinite(cometY)) {
                continue; // Skip this connection if any coordinate is not a finite number
            }

            // Create subtle connection line with valid coordinates
            let strokeStyle;
            
            try {
                const gradient = ctx.createLinearGradient(sourceX, sourceY, cometX, cometY);
                gradient.addColorStop(0, `hsla(190, 70%, 60%, 0.15)`); // Start color from Quantum Identity
                gradient.addColorStop(1, `hsla(45, 80%, 60%, 0.15)`); // End color matching comet
                strokeStyle = gradient;
            } catch (e) {
                strokeStyle = 'rgba(150, 180, 220, 0.12)'; // Fallback
            }
            
            ctx.beginPath();
            ctx.moveTo(sourceX, sourceY);
            ctx.lineTo(cometX, cometY);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }

        // Significantly increase particle count and distribution range
        const particleCount = 60 + Math.floor(Math.random() * 20); // Much more particles
        
        // Create three layers of particles for depth effect:
        // 1. Inner dense cloud close to comet
        // 2. Mid-range particles with moderate density
        // 3. Outer sparse particles for extended reach
        
        for (let layer = 0; layer < 3; layer++) {
            const layerParticleCount = layer === 0 ? particleCount : 
                                      layer === 1 ? Math.floor(particleCount * 0.7) : 
                                      Math.floor(particleCount * 0.4);
            
            // Layer-specific distance ranges
            const minDistFactor = layer === 0 ? 1.0 : 
                                 layer === 1 ? 2.5 : 
                                 4.0;
            
            const maxDistFactor = layer === 0 ? 2.5 : 
                                 layer === 1 ? 4.0 : 
                                 6.0;
                                 
            // Layer-specific opacity ranges
            const minOpacity = layer === 0 ? 0.4 : 
                              layer === 1 ? 0.25 : 
                              0.15;
                              
            const maxOpacity = layer === 0 ? 0.8 : 
                              layer === 1 ? 0.5 : 
                              0.3;
            
            for (let p = 0; p < layerParticleCount; p++) {
                // Random position around the comet head
                const particleAngle = Math.random() * Math.PI * 2;
                const particleDistance = cometHeadSize * (minDistFactor + Math.random() * (maxDistFactor - minDistFactor));
                const particleX = cometX + Math.cos(particleAngle) * particleDistance;
                const particleY = cometY + Math.sin(particleAngle) * particleDistance;
                
                // Variable small particles, smaller for outer layers
                const sizeRange = layer === 0 ? 1.2 : 
                                 layer === 1 ? 0.9 : 
                                 0.7;
                const particleSize = 0.3 + Math.random() * sizeRange;
                
                // Random gold or silver color, with distribution varying by layer
                const goldProbability = layer === 0 ? 0.5 :  // Equal distribution in inner layer
                                       layer === 1 ? 0.35 :  // More silver in middle layer
                                       0.25;                 // Mostly silver in outer layer
                
                const isGold = Math.random() < goldProbability;
                
                // Gold has warmer colors, silver has cooler colors
                const particleHue = isGold ? 
                    // Gold with variations from yellow-gold to rose-gold
                    35 + Math.random() * 25 : 
                    // Silver with variations from silver-white to silver-blue
                    200 + Math.random() * 30;
                
                const particleSat = isGold ? 
                    // Gold has higher saturation
                    60 + Math.random() * 30 : 
                    // Silver has lower saturation
                    10 + Math.random() * 25;
                
                const particleBright = 75 + Math.random() * 25;
                
                // Opacity varies by layer and has some pulsation effect
                const timeOffset = p * 0.1;
                const pulseFactor = 0.1 * Math.sin(Date.now() * 0.001 + timeOffset);
                const particleOpacity = Math.max(0.1, Math.min(0.9, minOpacity + Math.random() * (maxOpacity - minOpacity) + pulseFactor));
                
                // Draw the dust particle
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particleHue}, ${particleSat}%, ${particleBright}%, ${particleOpacity})`;
                ctx.fill();
            }
        }
        
        // Add a few special bright particles with glow effect
        const specialParticleCount = 8 + Math.floor(Math.random() * 5);
        
        for (let s = 0; s < specialParticleCount; s++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const particleDistance = cometHeadSize * (1.5 + Math.random() * 3.5);
            const particleX = cometX + Math.cos(particleAngle) * particleDistance;
            const particleY = cometY + Math.sin(particleAngle) * particleDistance;
            
            // Larger bright particles
            const particleSize = 1.0 + Math.random() * 1.5;
            
            // Special particles are mostly gold
            const isGold = Math.random() < 0.7;
            const particleHue = isGold ? 45 + Math.random() * 15 : 180 + Math.random() * 20;
            const particleSat = isGold ? 80 + Math.random() * 20 : 30 + Math.random() * 20;
            const particleBright = 85 + Math.random() * 15;
            
            // Higher opacity for better visibility
            const particleOpacity = 0.6 + Math.random() * 0.4;
            
            // Draw glow around special particles
            const glowSize = particleSize * 3;
            
            // Safety check for non-finite values before creating gradient
            if (isFinite(particleX) && isFinite(particleY) && isFinite(glowSize) && glowSize > 0) {
                try {
                    const glowGradient = ctx.createRadialGradient(
                        particleX, particleY, 0,
                        particleX, particleY, glowSize
                    );
                    
                    // Safely calculate color values
                    const safeHue = isFinite(particleHue) ? particleHue : 45;
                    const safeSat = isFinite(particleSat) ? particleSat : 60;
                    const safeBright = isFinite(particleBright) ? particleBright : 80;
                    const safeOpacity = isFinite(particleOpacity) ? particleOpacity : 0.7;
                    
                    glowGradient.addColorStop(0, `hsla(${safeHue}, ${safeSat * 0.8}%, ${safeBright}%, ${safeOpacity * 0.8})`);
                    glowGradient.addColorStop(0.5, `hsla(${safeHue}, ${safeSat * 0.6}%, ${safeBright - 10}%, ${safeOpacity * 0.3})`);
                    glowGradient.addColorStop(1, `hsla(${safeHue}, ${safeSat * 0.4}%, ${safeBright - 20}%, 0)`);
                    
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, glowSize, 0, Math.PI * 2);
                    ctx.fillStyle = glowGradient;
                    ctx.fill();
                } catch (e) {
                    // Fallback to a solid color if gradient creation fails
                    console.error("Error creating particle glow gradient:", e);
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, glowSize, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${particleHue}, ${particleSat * 0.7}%, ${particleBright}%, ${particleOpacity * 0.5})`;
                    ctx.fill();
                }
            } else {
                // Skip rendering this particle if values aren't valid
                console.log("Skipped rendering particle with non-finite values");
            }
            
            // Draw the bright center of special particles (only if coordinates are valid)
            if (isFinite(particleX) && isFinite(particleY) && isFinite(particleSize) && particleSize > 0) {
                // Safely calculate color values
                const safeHue = isFinite(particleHue) ? particleHue : 45;
                const safeSat = isFinite(particleSat) ? particleSat : 60;
                const safeBright = isFinite(particleBright) ? particleBright : 80;
                const safeOpacity = isFinite(particleOpacity) ? particleOpacity : 0.7;
                
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${safeHue}, ${safeSat}%, ${safeBright}%, ${safeOpacity})`;
                ctx.fill();
            }
        }
        
        // Enhanced comet core with brighter center and multiple layers of glow
        
        // Only render comet if coordinates are valid
        if (!isFinite(cometX) || !isFinite(cometY) || !isFinite(cometHeadSize) || cometHeadSize <= 0) {
            console.log("Skipping comet rendering - invalid coordinates or size");
        } else {
            // Outer soft glow layer
            ctx.beginPath();
            ctx.arc(cometX, cometY, cometHeadSize * 2.5, 0, Math.PI * 2);
            
            try {
                // Double-check all values are valid before creating gradient
                if (isFinite(cometX) && isFinite(cometY) && isFinite(cometHeadSize)) {
                    const outerGlow = ctx.createRadialGradient(
                        cometX, cometY, 0,
                        cometX, cometY, cometHeadSize * 2.5
                    );
                    
                    // Create a subtle outer glow that blends with the particle cloud
                    outerGlow.addColorStop(0, 'rgba(255, 240, 220, 0.8)');
                    outerGlow.addColorStop(0.3, 'rgba(255, 230, 200, 0.5)');
                    outerGlow.addColorStop(0.6, 'rgba(240, 220, 190, 0.3)');
                    outerGlow.addColorStop(1, 'rgba(220, 210, 190, 0.0)');
                    
                    ctx.fillStyle = outerGlow;
                } else {
                    // Fallback if values are invalid
                    ctx.fillStyle = 'rgba(255, 240, 220, 0.4)';
                }
            } catch (e) {
                // Error fallback
                ctx.fillStyle = 'rgba(255, 240, 220, 0.4)';
            }
            ctx.fill();
            
            // Middle glow layer - blend of gold and silver
            ctx.beginPath();
            ctx.arc(cometX, cometY, cometHeadSize * 1.8, 0, Math.PI * 2);
            
            try {
                // Double-check all values are valid before creating gradient
                if (isFinite(cometX) && isFinite(cometY) && isFinite(cometHeadSize)) {
                    const middleGlow = ctx.createRadialGradient(
                        cometX, cometY, 0,
                        cometX, cometY, cometHeadSize * 1.8
                    );
                    
                    // Create a richer middle glow with more pronounced golden tones
                    middleGlow.addColorStop(0, 'rgba(255, 245, 220, 0.9)');
                    middleGlow.addColorStop(0.4, 'rgba(250, 230, 190, 0.7)');
                    middleGlow.addColorStop(0.7, 'rgba(240, 220, 180, 0.4)');
                    middleGlow.addColorStop(1, 'rgba(230, 210, 170, 0.0)');
                    
                    ctx.fillStyle = middleGlow;
                } else {
                    // Fallback if values are invalid
                    ctx.fillStyle = 'rgba(250, 235, 200, 0.6)';
                }
            } catch (e) {
                // Error fallback
                console.error("Error creating middle glow gradient:", e);
                ctx.fillStyle = 'rgba(250, 235, 200, 0.6)';
            }
            ctx.fill();
            
            // Inner core glow - golden with enhanced pulsation synchronized with astronomical clock
            ctx.beginPath();
            
            // Enhanced intensity factor with exponential curve for more dramatic center effect
            // This creates an exponential brightness increase as the dot approaches center
            // Specifically engineered to feel like a gravitational intensification
            const intensityFactor = isFinite(distanceNormalized) ? 
                                  1.2 + Math.pow(1 - distanceNormalized, 2) * 0.8 : // Exponential intensity near center
                                  1.0; // Fallback if calculations are invalid
            
            // Create a phase-shifted harmonic that pulsates counter to the radial motion
            // This creates a breathing effect that intensifies when near the center
            const harmonicPhaseShift = Math.PI / 3; // 60° phase shift for natural counterpoint
            const counterHarmonic = Math.sin(pulseSpeed * 1.2 + harmonicPhaseShift);
            
            // Enhanced core pulsation synchronized with astronomical timing with counter-harmonic
            // This creates a more complex visual rhythm that feels alive and responsive
            const corePulseBase = 0.25 * Math.sin(pulseSpeed * 1.2);
            const corePulseEnhancement = 0.15 * counterHarmonic * (1 - distanceNormalized); // Stronger near center
            const corePulse = corePulseBase + corePulseEnhancement;
            
            // Final core size calculation with positional enhancement
            // Creates a dramatic expansion when the dot reaches center
            const nearCenterBoost = isFinite(distanceNormalized) ? 
                                  Math.pow(Math.max(0, 0.2 - distanceNormalized) * 5, 2) : 0;
            const innerCoreSize = cometHeadSize * (1.2 + corePulse) * intensityFactor * (1 + nearCenterBoost);
            
            ctx.arc(cometX, cometY, innerCoreSize, 0, Math.PI * 2);
            
            try {
                const innerGlow = ctx.createRadialGradient(
                    cometX, cometY, 0,
                    cometX, cometY, innerCoreSize
                );
                
                // Create a vibrant inner core with richer golden tones
                // Brightness enhanced when near center (with safety checks)
                const centralBrightness = isFinite(distanceNormalized) ? 
                                        1.0 + (0.1 * (1 - distanceNormalized)) : 
                                        1.0;
                
                // Safely calculate color values to avoid NaN or non-finite values
                const safeColorCalc = (base, maxAdd, factor) => {
                    const addition = isFinite(factor) ? Math.min(maxAdd, maxAdd * factor) : 0;
                    return Math.min(255, Math.max(0, Math.round(base + addition)));
                };
                
                // Color adjustments based on position - more golden/white near center
                const redValue = 255;
                const greenValue = safeColorCalc(250, 5, (1-distanceNormalized));
                const blueValue = safeColorCalc(230, 25, (1-distanceNormalized));
                const opacityBase = Math.min(1.0, isFinite(centralBrightness) ? centralBrightness : 1.0);
                
                innerGlow.addColorStop(0, `rgba(${redValue}, ${greenValue}, ${blueValue}, ${opacityBase})`);
                innerGlow.addColorStop(0.3, `rgba(255, 240, ${safeColorCalc(200, 20, (1-distanceNormalized))}, ${isFinite(intensityFactor) ? 0.9 * intensityFactor : 0.9})`);
                innerGlow.addColorStop(0.7, `rgba(250, 225, 180, ${isFinite(intensityFactor) ? 0.7 * intensityFactor : 0.7})`);
                innerGlow.addColorStop(1, 'rgba(245, 215, 170, 0.0)');
                
                ctx.fillStyle = innerGlow;
            } catch (e) {
                ctx.fillStyle = 'rgba(255, 245, 215, 0.9)';
            }
            ctx.fill();
            
            // Bright central core - very small but intense
            // Size and brightness enhance dramatically when near the center
            ctx.beginPath();
            
            // Core size increases as dot approaches center (with safety checks)
            const centralCoreSizeFactor = isFinite(distanceNormalized) ? 
                                       0.7 * (1 + (0.5 * (1 - distanceNormalized))) : 
                                       0.7; // Fallback to base size
            
            // Ensure we're using valid coordinates and sizes
            if (isFinite(cometX) && isFinite(cometY) && isFinite(cometHeadSize) && isFinite(centralCoreSizeFactor)) {
                const safeSize = Math.max(0.1, cometHeadSize * centralCoreSizeFactor);
                ctx.arc(cometX, cometY, safeSize, 0, Math.PI * 2);
                
                // Enhanced color transformation with dramatic shift from gold to white
                // Creating a profound "activation" effect when the dot reaches the center
                const distanceFactor = isFinite(distanceNormalized) ? (1-distanceNormalized) : 0;
                
                // Create a dynamic color that shifts from gold to brilliant white as it approaches center
                let coreFillStyle;
                
                // If very close to center (within 15%), create a pure white glow
                if (distanceNormalized < 0.15) {
                    // Calculate how close to absolute center (0-1 range where 1 is exactly at center)
                    const centerProximity = 1 - (distanceNormalized / 0.15);
                    
                    // Create pulsating opacity near center for "energy concentration" effect
                    const centerPulse = 0.15 * Math.sin(Date.now() / 150) * centerProximity;
                    const opacityBoost = 0.2 * centerProximity + centerPulse;
                    
                    // As we get closer to center, transition to pure white
                    // When extremely close (centerProximity > 0.8), make it pure white
                    if (centerProximity > 0.8) {
                        // Pure white core for highest intensity at center
                        coreFillStyle = `rgba(255, 255, 255, ${Math.min(1.0, 1.0 + opacityBoost)})`;
                    } else {
                        // Transition from gold to white as we approach center
                        const whitenessFactor = centerProximity * 1.25; // Faster transition to white
                        const whiteness = Math.min(255, 220 + Math.floor(35 * centerProximity));
                        // More white and less gold as we approach center
                        const goldness = Math.max(180, 255 - Math.floor(75 * whitenessFactor));
                        const blueValue = Math.min(255, 200 + Math.floor(55 * whitenessFactor));
                        
                        coreFillStyle = `rgba(255, ${goldness}, ${blueValue}, ${Math.min(1.0, 1.0 + opacityBoost)})`;
                    }
                } else {
                    // Standard white-gold gradient for outer positions
                    const whiteness = Math.min(255, 220 + Math.floor(35 * distanceFactor));
                    coreFillStyle = `rgba(255, ${whiteness}, ${whiteness * 0.9}, 1.0)`;
                }
                
                ctx.fillStyle = coreFillStyle;
            } else {
                // Fallback rendering for safety
                ctx.arc(cometX || 0, cometY || 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Pure white fallback
            }
            ctx.fill();
            
            // Calculate tau value once
            const tauValue = token.value ? token.value.toFixed(7) : "0.0000000"; // 7 decimal places
            
            // Get the label visibility state from localStorage
            let labelVisibility = true;
            try {
                const savedVisibility = localStorage.getItem('TAUDashboard_identityLabelsVisible');
                if (savedVisibility !== null) {
                    labelVisibility = savedVisibility === 'true';
                }
            } catch (e) {
                // Default to true if there's an error
                console.log("Error getting label visibility:", e);
            }
            
            // Only draw the label if labels are visible
            if (labelVisibility) {
                // Save current transformation to ensure horizontal text
                ctx.save();
                // Reset rotation to keep text horizontal while maintaining position
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.translate(centerX + cometX, centerY + cometY);
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.font = '11px "Space Mono", monospace';
                ctx.fillText(`τ: ${tauValue}`, 0, 0);
                ctx.restore();
            }
        }
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';

        // Restore context after global rotation
        ctx.restore();

        // Read from localStorage for label visibility
        let labelVisibility = true;
        try {
            // Always use TAUDashboard_identityLabelsVisible as the source of truth
            const savedVisibility = localStorage.getItem('TAUDashboard_identityLabelsVisible');
            if (savedVisibility !== null) {
                labelVisibility = savedVisibility === 'true';
            }
            
            // Update the global state variable for consistency
            window.TAUDashboard.showLabels = labelVisibility;
        } catch (e) {
            console.log("Could not read label visibility from localStorage");
        }

        // The Æ button is now an HTML element with its own click handler in toggleLabels()
        // Draw labels after restoring context to ensure they're not rotated
        // This ensures they remain readable regardless of rotation
        if (labelVisibility) {
            // Title is now an HTML element so we don't need to draw it in the canvas
            
            // Draw Julian Cycle counter at the bottom
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(170, 210, 250, 0.8)';
            ctx.font = '12px "Space Mono", monospace'; // Increased font size by 1
            // Format Julian Day with exactly 7 decimal places
            const jdParts = token.julianDay.toString().split('.');
            const julianDayWhole = jdParts[0];
            const julianDayFraction = jdParts.length > 1 ? 
                                     (jdParts[1] + '0000000').substring(0, 7) : 
                                     '0000000';
            const julianDayDisplay = `${julianDayWhole}.${julianDayFraction}`;
            ctx.fillText(`Julian Cycle: ${julianDayDisplay}`, centerX, centerY + maxRadius + 25);
            
            // Add pulsing dot next to Julian Cycle counter at the bottom
            const dotPulse = Math.sin(Date.now() / 300) * 0.5 + 0.5; // Pulsing effect
            ctx.beginPath();
            ctx.arc(centerX - ctx.measureText(`Julian Cycle: ${julianDayDisplay}`).width / 2 - 10, 
                    centerY + maxRadius + 25 - 3, 
                    3 + dotPulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 190, 255, ${0.7 + dotPulse * 0.3})`;
            ctx.fill();
            
            // Æ button is now an HTML element, so we don't draw it on the canvas
        }
    }

    function setup3DToggle() {
        const toggleLabelsButton = document.getElementById('toggle-labels');

        if (toggleLabelsButton && !toggleLabelsButton._initialized) {
            toggleLabelsButton._initialized = true;
            toggleLabelsButton.addEventListener('click', function() {
                try {
                    const labelsShown = window.TAUDashboard.showLabels;

                    // Toggle the labels state
                    window.TAUDashboard.showLabels = !labelsShown;

                    // Update button text
                    if (labelsShown) {
                        // Labels were shown, now hiding
                        this.textContent = 'Labels';
                    } else {
                        // Labels were hidden, now showing
                        this.textContent = 'Hide Labels';
                    }
                } catch (err) {
                    console.error("3D toggle error:", err);
                }
            });
        }
    }

    // Animation control function
    function startAnimation() {
        // Cancel any existing animation
        if (window.animationId) {
            cancelAnimationFrame(window.animationId);
        }

        // Track animation start time for frame-independent timing
        const animationStartTime = performance.now();

        // Animation loop function
        function animationLoop(currentTime) {
            try {
                // Calculate elapsed time for precise timing calculations
                const elapsedMs = currentTime - animationStartTime;

                // Store timing info for token calculations
                window.TAUDashboard.preciseTimestamp = {
                    startTime: animationStartTime,
                    currentTime: currentTime,
                    elapsedMs: elapsedMs
                };

                // Check if we need to force an update (e.g., labels toggled)
                const forceUpdate = window.TAUDashboard.forceUpdate;
                if (forceUpdate) {
                                        // Clear the flag
                    window.TAUDashboard.forceUpdate = false;

                    // Force redraw of canvases
                    document.querySelectorAll('canvas').forEach(function(canvas) {
                        if (canvas && canvas.getContext) {
                            const w = canvas.width;
                            canvas.width = 1;
                            canvas.width = w;
                        }
                    });
                }

                // Update all visualizations
                updateVisualizations();
            } catch (error) {
                // Log error but don't stop animation
                console.error("Animation loop error:", error);
            } finally {
                // Always request next frame even if there was an error
                window.animationId = requestAnimationFrame(animationLoop);
            }
        }

        // Start the loop
        window.animationId = requestAnimationFrame(animationLoop);
    }

    // Initialize the 3D toggle
    setup3DToggle();

    // Start the animation
    startAnimation();
    
    // Explicitly initialize the astronomical clock after the animation has started
    setTimeout(() => {
        console.log("Initializing astronomical clock directly");
        const astroCanvas = document.getElementById('astronomical-canvas');
        if (astroCanvas) {
            // Force initialization of the astronomical clock with the current token
            implementAstronomicalClock();
        } else {
            console.error("Could not find astronomical canvas element");
        }
    }, 500);

    // Make animateAstronomicalClock function available at global scope
    window.astronomicalClock_animate = null;
    
    // ===== COMPLETE ASTRONOMICAL CLOCK IMPLEMENTATION FROM v0.3.2 =====
    function implementAstronomicalClock() {
        console.log("Attempting to implement astronomical clock - v0.3.2");
        
        // Track state to prevent multiple initializations
        if (window.astronomicalClockImplemented) {
            console.log("Astronomical clock already implemented, skipping initialization");
            return;
        }
        
        // Find the canvas - this is crucial
        const astroCanvas = document.getElementById('astronomical-canvas');
        if (!astroCanvas) {
            console.error("Cannot find astronomical-canvas element");
            return;
        }
        
        console.log("Found astronomical canvas, dimensions:", astroCanvas.width, "x", astroCanvas.height);
        window.astronomicalClockImplemented = true;
        
        console.log("Creating new astronomical clock implementation - v0.3.2");
        
        // Get animation ID handling if it exists, or create it
        if (!window.animationIDs) {
            window.animationIDs = {};
        }
        
        // Cancel existing animation if running
        if (window.animationIDs.astronomical) {
            cancelAnimationFrame(window.animationIDs.astronomical);
            window.animationIDs.astronomical = null;
        }
        
        // We already have the canvas from earlier
        
        // Create an offscreen canvas for double buffering
        const offscreenCanvas = document.createElement('canvas');
        const astroContext = astroCanvas.getContext('2d');
        const offscreenContext = offscreenCanvas.getContext('2d');
        
        // Store a global reference to the offscreen canvas for other functions
        window.clockOffscreenCanvas = offscreenCanvas;
        
        // Store ephemeris data for celestial calculations
        let ephemerisData = null;
        
        // Set up resize handling
        function resizeCanvas() {
            const container = astroCanvas.parentElement;
            if (!container) return;
            
            // Set dimensions to match container
            astroCanvas.width = container.clientWidth;
            astroCanvas.height = container.clientHeight;
            
            // Update offscreen canvas dimensions
            offscreenCanvas.width = astroCanvas.width;
            offscreenCanvas.height = astroCanvas.height;
        }
        
        // Initial resize
        resizeCanvas();
        
        // Handle window resize with debouncing
        window.addEventListener('resize', function() {
            if (window.astroResizeTimeout) {
                clearTimeout(window.astroResizeTimeout);
            }
            window.astroResizeTimeout = setTimeout(resizeCanvas, 100);
        });
        
        // Start the animation immediately
        console.log("Starting astronomical clock animation");
        try {
            // Make sure this is called after the function is defined
            setTimeout(() => {
                window.animationIDs.astronomical = requestAnimationFrame(animateAstronomicalClock);
                console.log("Animation started with ID:", window.animationIDs.astronomical);
            }, 0);
        } catch (e) {
            console.error("Error starting animation:", e);
        }
        
        // Function to draw a single star
        function drawStar(ctx, x, y, size, color) {
            // Ensure size is always positive to avoid canvas errors
            const safeSize = Math.max(0.1, size);
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, safeSize, 0, TAU);
            ctx.fill();
        }
        
        // Predefined fixed stars to match real astronomical patterns
        const fixedStars = [
            // Major stars in geocentric coordinates
            // Name, RA-based angle, declination-based factor, magnitude (brightness), spectral class
            // Northern hemisphere prominent stars
            { name: "Polaris", angle: 0.45, distance: 0.1, magnitude: 2.0, spectrum: 2 }, // North Star
            { name: "Vega", angle: 4.7, distance: 0.3, magnitude: 0.03, spectrum: 0 },
            { name: "Deneb", angle: 5.23, distance: 0.2, magnitude: 1.25, spectrum: 0 },
            { name: "Altair", angle: 5.0, distance: 0.4, magnitude: 0.77, spectrum: 3 },
            { name: "Capella", angle: 1.4, distance: 0.25, magnitude: 0.08, spectrum: 4 },
            { name: "Aldebaran", angle: 1.8, distance: 0.35, magnitude: 0.85, spectrum: 6 },
            { name: "Castor", angle: 2.0, distance: 0.3, magnitude: 1.58, spectrum: 0 },
            { name: "Pollux", angle: 2.05, distance: 0.32, magnitude: 1.14, spectrum: 6 },
            // Zodiac belt stars
            { name: "Regulus", angle: 2.5, distance: 0.45, magnitude: 1.35, spectrum: 1 },
            { name: "Spica", angle: 3.3, distance: 0.52, magnitude: 1.04, spectrum: 1 },
            { name: "Antares", angle: 4.0, distance: 0.55, magnitude: 1.09, spectrum: 6 },
            // Southern hemisphere prominent stars
            { name: "Sirius", angle: 1.9, distance: 0.6, magnitude: -1.46, spectrum: 0 }, // Brightest star
            { name: "Canopus", angle: 1.7, distance: 0.65, magnitude: -0.74, spectrum: 2 },
            { name: "Alpha Centauri", angle: 3.6, distance: 0.75, magnitude: -0.27, spectrum: 4 },
            { name: "Rigel", angle: 1.4, distance: 0.5, magnitude: 0.12, spectrum: 1 },
            { name: "Betelgeuse", angle: 1.5, distance: 0.45, magnitude: 0.42, spectrum: 6 },
            { name: "Procyon", angle: 2.2, distance: 0.55, magnitude: 0.34, spectrum: 2 },
            { name: "Achernar", angle: 0.75, distance: 0.8, magnitude: 0.46, spectrum: 1 },
            { name: "Fomalhaut", angle: 5.7, distance: 0.7, magnitude: 1.16, spectrum: 2 },
            // Additional stars to create recognizable patterns/constellations
            { name: "Bellatrix", angle: 1.35, distance: 0.47, magnitude: 1.64, spectrum: 1 },
            { name: "Saiph", angle: 1.55, distance: 0.53, magnitude: 2.09, spectrum: 1 },
            { name: "Mintaka", angle: 1.43, distance: 0.51, magnitude: 2.23, spectrum: 1 },
            { name: "Alnilam", angle: 1.45, distance: 0.51, magnitude: 1.69, spectrum: 1 },
            { name: "Alnitak", angle: 1.48, distance: 0.51, magnitude: 1.77, spectrum: 1 }
        ];
        
        // Function to draw the starfield with realistic fixed stars
        function drawStarfield(ctx, width, height, time) {
            // Ensure we have valid dimensions to prevent errors
            if (width <= 0 || height <= 0) return;
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            // Create a realistic star rotation effect (sidereal day)
            // One full rotation every 23 hours 56 minutes (sidereal day)
            const siderealDay = 86164; // seconds in sidereal day
            const siderealRotation = (time % siderealDay) / siderealDay;
            const rotationAngle = siderealRotation * TAU;
            
            // Draw fixed stars from our predefined set
            fixedStars.forEach(star => {
                // Calculate star position with proper rotation
                const starAngle = star.angle + rotationAngle;
                const distanceFactor = star.distance;
                
                // Calculate coordinates
                const x = centerX + Math.cos(starAngle) * width/2 * distanceFactor;
                const y = centerY + Math.sin(starAngle) * height/2 * distanceFactor;
                
                // Calculate star size based on magnitude (brightness)
                // Magnitude is inverse - lower values are brighter
                // Convert to a reasonable size range (0.5 to 3.0) - slightly smaller stars
                const baseMagnitude = Math.min(6, Math.max(-1.5, star.magnitude));
                const sizeScale = 3.0 - ((baseMagnitude + 1.5) / 7.5) * 2.5;
                
                // Add subtle twinkling with reduced flicker
                const flicker = Math.sin(time * (1 + (star.magnitude / 2)) + star.angle * 10) * 0.1;
                const brightness = 0.4 + Math.min(0.5, Math.max(0, 0.7 - (baseMagnitude / 5)));
                const adjustedBrightness = Math.max(0.1, Math.min(0.8, brightness + flicker));
                
                // Determine color based on spectral class with slightly more subtle colors
                let starColor;
                if (star.spectrum === 0) {
                    // O/B-type (Blue) stars
                    starColor = `rgba(155, 176, 255, ${adjustedBrightness})`;
                } else if (star.spectrum === 1) {
                    // B-type (Blue-white) stars
                    starColor = `rgba(170, 191, 255, ${adjustedBrightness})`;
                } else if (star.spectrum === 2) {
                    // A-type (White) stars
                    starColor = `rgba(249, 245, 255, ${adjustedBrightness})`;
                } else if (star.spectrum === 3) {
                    // F-type (Yellow-white) stars
                    starColor = `rgba(248, 247, 229, ${adjustedBrightness})`;
                } else if (star.spectrum === 4) {
                    // G-type (Yellow) stars - Sun-like
                    starColor = `rgba(255, 244, 232, ${adjustedBrightness})`;
                } else if (star.spectrum === 5) {
                    // K-type (Orange) stars
                    starColor = `rgba(255, 218, 181, ${adjustedBrightness})`;
                } else {
                    // M-type (Red) stars
                    starColor = `rgba(255, 187, 153, ${adjustedBrightness})`;
                }
                
                // Draw the star with size based on magnitude
                drawStar(ctx, x, y, sizeScale, starColor);
                
                // Label major stars (only the brightest ones)
                if (star.magnitude < 0.5) {
                    ctx.font = '6px Arial';
                    ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Position label just below the star
                    const labelY = y + sizeScale * 2;
                    ctx.fillText(star.name, x, labelY);
                }
            });
            
            // Draw additional background stars for richness
            const backgroundStarCount = 100;
            
            for (let i = 0; i < backgroundStarCount; i++) {
                // Use prime numbers for non-repeating patterns
                const seed1 = (i * 13) % 17;
                const seed2 = (i * 19) % 23;
                
                // Create a base angle that includes sidereal rotation
                const baseAngle = (i * 0.37) + rotationAngle;
                
                // Add some variety to the orbits with different radiuses
                const orbitVariation = ((seed1 * seed2) % 5) * 0.1;
                const distanceFactor = 0.2 + 0.8 * ((i / backgroundStarCount) + orbitVariation);
                
                // Calculate position with slight elliptical orbit
                const ellipticalFactor = 1.0 + ((seed1 % 3) * 0.05);
                const x = centerX + Math.cos(baseAngle) * width/2 * distanceFactor * ellipticalFactor;
                const y = centerY + Math.sin(baseAngle) * height/2 * distanceFactor;
                
                // Background stars are dimmer and smaller
                const brightness = 0.1 + Math.random() * 0.3;
                
                // Smaller size for background stars
                const size = 0.3 + Math.random() * 0.8;
                
                // Random spectral class for background stars
                const spectralClass = Math.floor(Math.random() * 7);
                
                let starColor;
                if (spectralClass === 0) {
                    starColor = `rgba(155, 176, 255, ${brightness})`;
                } else if (spectralClass === 1) {
                    starColor = `rgba(170, 191, 255, ${brightness})`;
                } else if (spectralClass === 2) {
                    starColor = `rgba(249, 245, 255, ${brightness})`;
                } else if (spectralClass === 3) {
                    starColor = `rgba(248, 247, 229, ${brightness})`;
                } else if (spectralClass === 4) {
                    starColor = `rgba(255, 244, 232, ${brightness})`;
                } else if (spectralClass === 5) {
                    starColor = `rgba(255, 218, 181, ${brightness})`;
                } else {
                    starColor = `rgba(255, 187, 153, ${brightness})`;
                }
                
                // Draw the background star
                drawStar(ctx, x, y, size, starColor);
            }
        }
        
        // Function to draw astronomical bodies (planets) with proper orbital periods
        function drawAstronomicalBodies(ctx, centerX, centerY, radius, time) {
            // Planetary data with accurate orbital periods in Earth days
            const planets = [
                { 
                    name: "Mercury", 
                    color: "rgba(180, 180, 180, 0.8)", 
                    size: 3, 
                    orbit: 0.38, 
                    period: 87.97, // orbital period in Earth days
                    offset: 0.3,
                    glow: "rgba(180, 180, 180, 0.3)" 
                },
                { 
                    name: "Venus", 
                    color: "rgba(255, 198, 130, 0.8)", 
                    size: 5, 
                    orbit: 0.5, 
                    period: 224.7, 
                    offset: 1.2,
                    glow: "rgba(255, 198, 130, 0.3)" 
                },
                { 
                    name: "Earth", 
                    color: "rgba(100, 180, 255, 0.8)", 
                    size: 5, 
                    orbit: 0.6, 
                    period: 365.25, 
                    offset: 2.1,
                    glow: "rgba(100, 180, 255, 0.3)" 
                },
                { 
                    name: "Mars", 
                    color: "rgba(255, 100, 60, 0.8)", 
                    size: 4, 
                    orbit: 0.7, 
                    period: 686.98, 
                    offset: 0.8,
                    glow: "rgba(255, 100, 60, 0.3)" 
                },
                { 
                    name: "Jupiter", 
                    color: "rgba(255, 222, 150, 0.8)", 
                    size: 8, 
                    orbit: 0.8, 
                    period: 4332.59, 
                    offset: 1.5,
                    glow: "rgba(255, 222, 150, 0.3)" 
                },
                { 
                    name: "Saturn", 
                    color: "rgba(240, 220, 180, 0.8)", 
                    size: 7, 
                    orbit: 0.85, 
                    period: 10759.22, 
                    offset: 4.2,
                    glow: "rgba(240, 220, 180, 0.3)" 
                },
                { 
                    name: "Moon", 
                    color: "rgba(220, 220, 220, 0.9)", 
                    size: 2.5, 
                    orbit: 0.62, // slightly larger than Earth's orbit
                    period: 29.53, // lunar month
                    offset: 0, // will be calculated relative to Earth
                    parentPlanet: "Earth", // orbits around Earth
                    parentDistance: 0.025, // distance from parent
                    glow: "rgba(220, 220, 220, 0.3)" 
                }
            ];
            
            // Draw zodiac ring
            const zodiacRadius = radius * 0.87;
            ctx.beginPath();
            ctx.arc(centerX, centerY, zodiacRadius, 0, TAU);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = radius * 0.05;
            ctx.stroke();
            
            // Draw zodiac constellations (simplified)
            const zodiacSigns = [
                "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
            ];
            
            // Draw zodiac sign indicators with labels
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            zodiacSigns.forEach((sign, i) => {
                const angle = (i / 12) * TAU;
                const x = centerX + Math.cos(angle) * zodiacRadius * 0.93;
                const y = centerY + Math.sin(angle) * zodiacRadius * 0.93;
                
                // Draw small dot for sign
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, TAU);
                ctx.fill();
                
                // Add small zodiac label
                const labelRadius = zodiacRadius * 0.87; // Position labels inside the zodiac ring
                const labelX = centerX + Math.cos(angle) * labelRadius;
                const labelY = centerY + Math.sin(angle) * labelRadius;
                
                // Draw very small, subtle zodiac label
                ctx.font = '5px Arial';
                ctx.fillStyle = 'rgba(255, 220, 180, 0.4)';
                ctx.fillText(sign.charAt(0), labelX, labelY); // Just the first letter for minimal space usage
            });
            
            // Draw orbital paths
            planets.forEach(planet => {
                if (planet.name !== "Moon") { // Don't draw Moon's orbit as a separate path
                    const orbitRadius = radius * planet.orbit;
                    
                    // Draw orbit path
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, orbitRadius, 0, TAU);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
            
            // Calculate planet positions based on current time and orbital periods
            // First, pass through all non-moon planets
            const planetPositions = {};
            
            planets.forEach(planet => {
                // Skip moons for now
                if (planet.parentPlanet) return;
                
                // Calculate angle based on orbital period (convert time to days)
                // 86400 seconds per day
                const timeInDays = time / 86400;
                // Calculate current position in orbit using period and offset
                const orbitalProgress = (timeInDays % planet.period) / planet.period;
                const angle = orbitalProgress * TAU + planet.offset;
                
                // Save position for moons to reference
                planetPositions[planet.name] = {
                    angle: angle,
                    orbit: planet.orbit,
                    x: Math.cos(angle) * radius * planet.orbit,
                    y: Math.sin(angle) * radius * planet.orbit
                };
                
                // Calculate final screen coordinates
                const x = centerX + planetPositions[planet.name].x;
                const y = centerY + planetPositions[planet.name].y;
                
                // Draw planet
                ctx.fillStyle = planet.color;
                ctx.beginPath();
                ctx.arc(x, y, planet.size, 0, TAU);
                ctx.fill();
                
                // Draw planet glow without gradients
                const glowSize = planet.size * 1.8;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.arc(x, y, glowSize, 0, TAU);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(x, y, glowSize * 1.3, 0, TAU);
                ctx.fill();
                
                // Add planet label
                ctx.font = '8px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Position label just below the planet
                const labelY = y + planet.size * 2.5;
                ctx.fillText(planet.name, x, labelY);
            });
            
            // Now draw moons and other satellites
            planets.forEach(planet => {
                // Only process moons
                if (!planet.parentPlanet) return;
                
                // Get parent planet position
                const parent = planetPositions[planet.parentPlanet];
                if (!parent) return; // Skip if parent not found
                
                // Calculate moon's position relative to its parent
                // Calculate angle based on lunar orbital period (convert time to days)
                const timeInDays = time / 86400;
                // Calculate current position in orbit
                const orbitalProgress = (timeInDays % planet.period) / planet.period;
                // Additional orbit from parent
                const angle = orbitalProgress * TAU + parent.angle;
                
                // Position moon relative to parent planet
                const moonOrbitRadius = radius * planet.parentDistance;
                const relativeX = Math.cos(angle) * moonOrbitRadius;
                const relativeY = Math.sin(angle) * moonOrbitRadius;
                
                // Calculate final screen coordinates (parent position + relative position)
                const x = centerX + parent.x + relativeX;
                const y = centerY + parent.y + relativeY;
                
                // Draw moon
                ctx.fillStyle = planet.color;
                ctx.beginPath();
                ctx.arc(x, y, planet.size, 0, TAU);
                ctx.fill();
                
                // Draw subtle glow
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(x, y, planet.size * 1.5, 0, TAU);
                ctx.fill();
                
                // Add moon label
                ctx.font = '7px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Position label just below the moon
                const labelY = y + planet.size * 2;
                ctx.fillText(planet.name, x, labelY);
                
                // Save moon position
                planetPositions[planet.name] = {
                    angle: angle,
                    orbit: parent.orbit,
                    x: parent.x + relativeX,
                    y: parent.y + relativeY
                };
            });
            
            // Store position data for other visualizations
            const positions = [];
            for (const [name, pos] of Object.entries(planetPositions)) {
                positions.push({
                    name: name,
                    x: pos.x / (radius * pos.orbit), // Normalize to unit circle
                    y: pos.y / (radius * pos.orbit),
                    angle: pos.angle,
                    distance: pos.orbit
                });
            }
            
            // Make data available to other visualizations
            window.astronomicalData = {
                time: time,
                bodies: positions,
                julianCycle: time
            };
            
            return positions;
        }
        
        // Function to draw the clock face with precise markers and cardinal directions
        function drawClockFace(ctx, centerX, centerY, radius, time, celestialBodies) {
            // Constants for astronomical timing
            const JULIAN_DAY_SECONDS = 86400; // One complete rotation per Julian Day (86,400 seconds)
            const SECONDARY_CYCLE = 7200; // Secondary indicator rotates every 7,200 seconds (2 hours)
            const PHI = 1.618033988749895; // Golden ratio for harmonic spacing
            const TERTIARY_CYCLE = SECONDARY_CYCLE / PHI; // ~4,450 seconds - maintains golden ratio with secondary hand
            
            // Calculate rotation angles for each hand based on their astronomical cycles
            // Primary indicator (white hand) - completes one rotation per Julian Day
            const primaryHandAngle = (time % JULIAN_DAY_SECONDS) / JULIAN_DAY_SECONDS * TAU;
            
            // Secondary indicator (blue hand) - rotates every 7,200 seconds (2 hours)
            const secondaryHandAngle = (time % SECONDARY_CYCLE) / SECONDARY_CYCLE * TAU;
            
            // Tertiary indicator (gold hand) - golden ratio relationship with secondary hand
            const tertiaryHandAngle = (time % TERTIARY_CYCLE) / TERTIARY_CYCLE * TAU;
            
            // Cardinal directions (N,E,S,W) positions
            const cardinalDirections = [
                { text: "N", angle: 0 },    // North at top
                { text: "E", angle: TAU/4 }, // East at right
                { text: "S", angle: TAU/2 }, // South at bottom
                { text: "W", angle: (3*TAU)/4 } // West at left
            ];
            
            // Draw blue outer ring (from the right pane clock)
            ctx.strokeStyle = 'rgba(61, 174, 233, 0.8)'; // Blue color matching the right pane, slightly brighter
            ctx.lineWidth = 0.5; // Reduced thickness by 1px (from 1.5px to 0.5px)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.02, 0, TAU);
            ctx.stroke();
            
            // Draw secondary rim
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, TAU);
            ctx.stroke();
            
            // Draw inner rim
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.9, 0, TAU);
            ctx.stroke();
            
            // Draw hour markers
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * TAU;
                const markerLength = radius * 0.1;
                
                // Calculate marker positions
                const outerX = centerX + Math.cos(angle) * (radius * 0.9);
                const outerY = centerY + Math.sin(angle) * (radius * 0.9);
                const innerX = centerX + Math.cos(angle) * (radius * 0.9 - markerLength);
                const innerY = centerY + Math.sin(angle) * (radius * 0.9 - markerLength);
                
                // Draw marker
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = i % 3 === 0 ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(outerX, outerY);
                ctx.lineTo(innerX, innerY);
                ctx.stroke();
            }
            
            // Draw minute markers
            for (let i = 0; i < 60; i++) {
                // Skip positions where hour markers are
                if (i % 5 === 0) continue;
                
                const angle = (i / 60) * TAU;
                const markerLength = radius * 0.03;
                
                // Calculate marker positions
                const outerX = centerX + Math.cos(angle) * (radius * 0.9);
                const outerY = centerY + Math.sin(angle) * (radius * 0.9);
                const innerX = centerX + Math.cos(angle) * (radius * 0.9 - markerLength);
                const innerY = centerY + Math.sin(angle) * (radius * 0.9 - markerLength);
                
                // Draw marker
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(outerX, outerY);
                ctx.lineTo(innerX, innerY);
                ctx.stroke();
            }
            
            // Draw cardinal directions (N, E, S, W) in blue color matching the outer ring
            ctx.font = '9px Arial'; // Smaller font size to fit better
            ctx.fillStyle = 'rgba(61, 174, 233, 0.8)'; // Slightly brighter for better visibility
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            cardinalDirections.forEach(direction => {
                // Position text at exactly 95% of the radius
                const textRadius = radius * 0.95; // Perfect position
                const textX = centerX + Math.cos(direction.angle) * textRadius;
                const textY = centerY + Math.sin(direction.angle) * textRadius;
                
                // Draw direction label
                ctx.fillText(direction.text, textX, textY);
            });
            
            // Draw astronomical clock hands with shadows for depth
            // Primary indicator (white hand) - completes one rotation per Julian Day (86,400 seconds)
            drawClockHand(ctx, centerX, centerY, primaryHandAngle, radius * 0.5, 3, 'rgba(255, 255, 255, 0.9)');
            
            // Secondary indicator (blue hand) - rotates every 7,200 seconds (2 hours)
            drawClockHand(ctx, centerX, centerY, secondaryHandAngle, radius * 0.7, 2, 'rgba(97, 218, 251, 0.9)');
            
            // Tertiary indicator (gold hand) - golden ratio harmonic with secondary hand (~4,450 seconds)
            drawClockHand(ctx, centerX, centerY, tertiaryHandAngle, radius * 0.8, 1, 'rgba(212, 175, 55, 0.9)');
            
            // Draw central point with shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(centerX + 1, centerY + 1, 4, 0, TAU);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, TAU);
            ctx.fill();
            
            // No Julian Cycle text display
        }
        
        // Helper function to draw clock hands with shadow
        function drawClockHand(ctx, centerX, centerY, angle, length, width, color) {
            // Draw shadow first
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = width + 1;
            ctx.beginPath();
            ctx.moveTo(centerX + 1, centerY + 1);
            ctx.lineTo(
                centerX + Math.cos(angle) * length + 1,
                centerY + Math.sin(angle) * length + 1
            );
            ctx.stroke();
            
            // Then draw hand
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            ctx.stroke();
        }
        
        // Draw subtle radial nebula in the background
        function drawNebula(ctx, centerX, centerY, radius, time) {
            // Simple approach without gradients to avoid browser compatibility issues
            
            // Draw outer nebula
            ctx.fillStyle = 'rgba(97, 218, 251, 0.03)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.2, 0, TAU);
            ctx.fill();
            
            // Draw middle nebula layer
            ctx.fillStyle = 'rgba(97, 218, 251, 0.05)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.8, 0, TAU);
            ctx.fill();
            
            // Draw nebula core that pulses subtly
            const coreSize = 20 + Math.sin(time * 0.5) * 5;
            ctx.fillStyle = 'rgba(97, 218, 251, 0.08)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreSize, 0, TAU);
            ctx.fill();
        }
        
        // Main animation function for the astronomical clock
        function animateAstronomicalClock(timestamp) {
            try {
                // Ensure we have valid inputs
                if (!offscreenContext || !astroContext || !astroCanvas) {
                    console.warn("Missing context or canvas in astronomical clock animation");
                    return;
                }
                
                console.log("Animating astronomical clock at", new Date().toLocaleTimeString());
                
                // Store reference to this function in global scope so it can be called from outside
                window.astronomicalClock_animate = animateAstronomicalClock;
                
                // Convert timestamp to seconds for easier math
                const time = timestamp * 0.001;
                
                // For accurate synchronized time, use the token's Julian Day if available
                // If no token data is available, fallback to animation time
                let julianDay = time;
                
                // Try to use token data if available, without wiping out animation time
                if (window.astronomicalClockData && window.astronomicalClockData.julianDay) {
                    // Use stored astronomical data
                    julianDay = window.astronomicalClockData.julianDay;
                } else if (window.TAUDashboard && window.TAUDashboard.currentToken && window.TAUDashboard.currentToken.julianDay) {
                    // Fallback to dashboard token data
                    julianDay = window.TAUDashboard.currentToken.julianDay;
                }
                
                // Get dimensions - ensure they're valid
                const width = astroCanvas.width || 300;
                const height = astroCanvas.height || 200;
                
                // Calculate the center for a truly centered single clock
                // This is the critical part - we're centering in the ENTIRE pane
                const centerX = width / 2;
                const centerY = height / 2;
                
                // Make the clock significantly larger to fill more of the available space
                // This ensures it's a prominent single clock, not a dual-pane view
                const radius = Math.max(10, Math.min(width, height) * 0.48);
                
                // Completely clear both canvases
                astroContext.clearRect(0, 0, width, height);
                offscreenContext.clearRect(0, 0, width, height);
                
                // Fill with dark background
                offscreenContext.fillStyle = 'rgb(10, 15, 30)';
                offscreenContext.fillRect(0, 0, width, height);
                
                // Draw the starfield as background
                if (width > 0 && height > 0) {
                    drawStarfield(offscreenContext, width, height, julianDay);
                }
                
                // Draw nebula effect beneath the clock
                if (radius > 0) {
                    drawNebula(offscreenContext, centerX, centerY, radius, julianDay);
                }
                
                // Draw astronomical bodies and their orbits
                const astronomicalBodies = drawAstronomicalBodies(offscreenContext, centerX, centerY, radius, julianDay);
                
                // Draw the clock face with precise markers and small cardinal direction labels
                drawClockFace(offscreenContext, centerX, centerY, radius, julianDay, astronomicalBodies);
                
                // Copy the fully composed image to the visible canvas
                astroContext.clearRect(0, 0, width, height);
                astroContext.drawImage(offscreenCanvas, 0, 0);
                
                // Log that we're actually rendering the clock
                console.log("Rendering astronomical clock frame at " + new Date().toLocaleTimeString());
                
                // Store time information globally
                window.currentTauCycle = julianDay;
                
                // Use multiple approaches to ensure our image stays visible
                // 1. Set a timeout to redraw in case something tries to clear our canvas
                setTimeout(() => {
                    astroContext.drawImage(offscreenCanvas, 0, 0);
                }, 0);
                
                // 2. Store our image for the global enforcer interval
                window.clockOffscreenCanvas = offscreenCanvas;
            } catch (error) {
                console.error("Error in astronomical clock animation:", error);
            } finally {
                // Always continue the animation, even if there was an error
                if (window.animationIDs) {
                    window.animationIDs.astronomical = requestAnimationFrame(animateAstronomicalClock);
                    console.log("Requested next animation frame");
                } else {
                    console.error("animationIDs not defined, cannot continue animation");
                }
            }
        }
    }
    
    // Let the normal initialization flow handle things
    // The updateAstronomicalCanvas hook will call our implementation
    
    // Hook for initializing the astronomical clock from the updateAstronomicalCanvas function
    const originalUpdateAstronomicalCanvas = window.updateAstronomicalCanvas;
    window.updateAstronomicalCanvas = function(canvas, token) {
        // Store the token data for use by our clock implementation
        window.astronomicalClockData = {
            julianDay: token ? token.julianDay : (Date.now() / 86400000 + 2440587.5),
            timestamp: token ? token.timestamp : Date.now()
        };
        
        // If our implementation hasn't been initialized yet, do it now
        if (!window.astronomicalClockImplemented) {
            console.log("Initializing v0.3.2 astronomical clock implementation");
            implementAstronomicalClock();
        }
        
        // No drawing here - implementAstronomicalClock takes over rendering completely
    };
    
    // Hook for initializing the astronomical clock from the initAstronomicalCanvas function
    const originalInitAstronomicalCanvas = window.initAstronomicalCanvas;
    window.initAstronomicalCanvas = function(canvas, token) {
        // Store the token for later access
        window.TAUDashboard = window.TAUDashboard || {};
        window.TAUDashboard.currentToken = token;
        window.astronomicalClockData = {
            julianDay: token ? token.julianDay : (Date.now() / 86400000 + 2440587.5),
            timestamp: token ? token.timestamp : Date.now()
        };
        
        // Initialize the astronomical clock
        console.log("Initializing astronomical clock from initAstronomicalCanvas");
        implementAstronomicalClock();
    };
    
    // No toggle function - the v0.3.2 implementation is now the default
    
    // Global function to force the astronomical clock to start (can be called from console)
    window.startAstronomicalClock = function() {
        console.log("Manually starting astronomical clock");
        window.astronomicalClockImplemented = false; // Reset the flag so we can reinitialize
        
        // Initialize the clock, which will start its own animation
        implementAstronomicalClock();
    };
    
    // Don't force initialization - this will happen naturally when the dashboard calls
    // window.updateAstronomicalCanvas during its normal initialization sequence
});