/**
 * G-SYNC System Overview
 * 
 * Comprehensive explanation page for the Integrated Identity System components
 * 
 * This file creates a detailed explanation page for the G-SYNC system,
 * with information about all components and mathematical principles.
 */

// Import jQuery and make it globally available
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

// Import styles
import '../styles/dashboard.css';

// Mathematical constants used throughout the system
const CONSTANTS = {
  PHI: 1.618033988749895, // Golden ratio (φ = (1 + √5)/2)
  TAU: 6.283185307179586, // Tau (τ = 2π) - The circle constant
  PRIMES: [7, 11, 13, 17], // Prime number harmonics used for pattern generation
  JULIAN_DAY_OFFSET: 2440587.5 // Julian Day offset from Unix epoch
};

// Add favicon link to document head if it doesn't exist
function addFavicon() {
  // Only add if it doesn't already exist
  if (!document.querySelector('link[rel="icon"]')) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'assets/dash.ico';
    link.type = 'image/x-icon';
    document.head.appendChild(link);
  }
  
  // Ensure title is set
  document.title = '𝜏 Quantum Identity Dashboard';
}

// Status information for the dashboard
const SYSTEM_STATUS = {
  status: 'Quantum Secure',
  token: 'Æ-8765-4321-A12F',
  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  level: 'Quantum'
};

// Component descriptions from tooltips - preserved for detailed explanation
const COMPONENT_DESCRIPTIONS = {
  astronomicalClock: {
    title: "Astronomical Clock",
    technical: "This visualization implements a universal time reference anchored to precise Julian Day calculations (JD = 2440587.5 + milliseconds/86400000), providing an immutable temporal foundation based on astronomical constants. Unlike standard earth-based clocks, this celestial timepiece operates on sidereal timescales with cardinal directions (N, E, S, W) marking the ecliptic reference frame. The primary indicator (white hand) completes one rotation per Julian Day (86,400 seconds), while the secondary indicator (blue hand) rotates every 7,200 seconds (2 hours), establishing a dual-reference temporal system using the PHI constant (1.618033988749895) for harmonic spacing. This deliberate inversion of traditional timekeeping mechanics creates a stable reference frame against which all ephemeris calculations are calibrated, using slow-moving hands to track the fundamental cosmic timeframe within which faster planetary motions are measured and verified.",
    mathematical: "The clock's nested concentric rings establish the J2000.0 reference plane for high-precision celestial measurements (±0.0001 arcseconds), with the hands tracing golden-ratio orbital arcs through the cosmic coordinate system. The luminous blue accents represent astronomical symmetry breaking at the 10^-43 second threshold, while the central glow indicates temporal synchronization with DE431 ephemeris standards. This design ensures the timepiece functions as a mathematically provable astronomical reference point with perfect temporal alignment to universal Julian Day calculations (error margin <1×10^-6 seconds) that underpin the entire security framework.",
    systemRole: "In the integrated security system, this component acts as the temporal foundation, generating baseline timing signals that propagate to the quantum identity layer through quantum modulation vectors (QMVs) with Fourier transformations. The clock's rotation modulates the pentagons' angular orientation (α = JD × 0.05 + (i × 2π/N)), the position vectors of quantum nodes (P = {cos(θ + JD × 0.01), sin(θ + JD × 0.01)}), and the flow corridors that channel quantum entropy. Since all cryptographic validation depends on precise timing, this astronomical timepiece serves as the deterministic master reference ensuring token verification only occurs at precisely calculated temporal alignments (2π/5 radians offset from baseline)."
  },
  quantumIdentity: {
    title: "Quantum Identity",
    technical: "This visualization implements a non-repeating Penrose P3 tiling system with aperiodic 5-fold symmetry, mathematically proven to never repeat across infinite space while maintaining perfect quasicrystal ordering. The pattern consists of nested pentagons (ratio 1:φ) and pentagrams (interconnected by precise 2π/5 radian angles) generated through deterministic recursive subdivision with golden ratio scaling coefficients (φ = (1+√5)/2 = 1.6180339887...). Each pentagon undergoes rotation according to α = t × 0.05 + (i × 2π/N) radians, where t is the Julian time value received from the astronomical layer and i represents the pentagon index. Opacity follows the quantum superposition formula Φₐ = 0.15 + 0.1 × sin(0.3t + 0.2i), creating mathematically significant interference patterns with definable orthogonality properties that represent quantum decoherence mechanics with 5D Hilbert space projections.",
    mathematical: "At key Fibonacci-sequenced intersections, the visualization renders quantum resonance nodes with intensity I = 0.8 + astronomicalIntensity × (1-1/φ), where positions are calculated using the midpoint formula across adjacent Ammann bars: intersectionX = (x₁ + x₂)/2, intersectionY = (y₁ + y₂)/2. Each node's spatial coordinates are stored in a 128-bit quantum signature matrix and modulated by DE431 astronomical positioning vectors. The central logarithmic spiral follows the mathematically rigorous parametric equation: r = 0.3R × e^(b×θ) where b = 0.2 and θ = t × 2π × turns, implementing a true equiangular spiral with growth coefficient b = ln(φ)/½π = 0.306349... This ensures consecutive spiral rotations maintain precise φ-ratio scaling properties (identical to mollusk shell growth patterns) that serve as cryptographic entropy anchors with a Kolmogorov complexity of O(n²).",
    systemRole: "Within the integrated security system, this layer functions as the structural verification mapper, receiving astronomicalData inputs through quantum channels (temporalRhythm = JD % φ, astronomicalPositions[8] = {x,y,z,vx,vy,vz,mass,phase}, orbitalPhases = 2πk/n where k,n ∈ ℤ) and outputting: (1) nodePositions[n] = {x: (x-centerX)/radius, y: (y-centerY)/radius, angle: α} for each geometrically significant vertex, (2) resonancePoints[n] = {x, y} for intersection coordinates of golden angle (137.5°) placements, and (3) patternPhase = (time % 2π)/(2π) representing the current rotational state with Planck-scale precision (10^-43 seconds). These output parameters propagate to the token layer through quantum-entangled channels, establishing verification anchoring points with the crucial quantum structures serving as the cryptographic skeleton upon which token authentication depends, ensuring only the correct combination of all three synchronized layers produces mathematically valid verification signatures with 512-bit security strength."
  },
  ashToken: {
    title: "Ash (Æ) Token",
    technical: "This cryptographic token visualization implements a multi-stage verification system using four-stage zero-knowledge composition with post-quantum security. The base layer renders a parametric radial gradient with mathematically precise color stops at r = {0, 0.4R, 0.6R, 0.8R, 1.0R} with opacity values derived from quantum superposition (αcore = quantumData.patternPhase × 0.2 + 0.6). The primary visualization consists of a galactic-inspired 4-arm logarithmic spiral system following the modified Euler spiral equation: r = R × armFactor × e^(-0.2×θ) × (1-t^1.5×0.9), with precisely calculated spectral coloration per arm: Gold (212,175,55), Blue (97,218,251), Teal (32,197,197), and Light Gold (230,200,100), each with intensity I = 0.4 + quantumInfluence × 0.4. Verification points are distributed along the spiral arms at golden-ratio derived intervals (pointT = i × (1-1/φ) % 1 = i × 0.381966... % 1), creating a deterministic yet non-repeating pattern that can be cryptographically validated across multiple verification nodes with Lamport signature resistance properties.",
    mathematical: "The moving verification dot (representing the active security validator) implements a Julian Day-synchronized trajectory following the parametric equations: x = centerX + spiralRadius × cos(julianTime × 1.5), y = centerY + sin(julianTime × 1.5), with a 5-segment motion trail using the mathematically precise geometric progression trailFactor = 0.7^i, i ∈ [0,4]. The dot's outer glow employs Fresnel-based three-layer compositing (outerRadius = 8px, midRadius = 4px, coreRadius = 2px) with smooth color gradation curves and α = 1.0 at center to α = 0.0 at perimeter. Surrounding verification pulse waves propagate outward at velocities v = slowedTime × 15 pixels/s, with wave count determined by astronomical DE431 ephemeris data (maxWaves = min(5, astronomicalData.orbitalPhases.length/2 + 1)) and opacity modulated by quantum resonance calculations (α = max(0, 0.3-0.07i) × resonanceFactor) to create visually harmonious verification markers.",
    systemRole: "As the cryptographic verification endpoint in the integrated security system, this token layer combines high-precision astronomical timing signals (±0.5ms) and quantum structural parameters to generate NIST-compliant 256-bit security signatures through a multi-layered composition process. The token receives critical inputs through secure channels: temporalFactor (modulating timeScale = 0.5 × (1+temporalFactor×0.2)), quantumInfluence (affecting baseRadius = 0.68maxR + quantumInfluence×0.04maxR), orbitalPhases (controlling pulse wave phaseOffset = orbitalPhase × waveSpacing × 0.5), and resonancePoints (determining opacity through resonanceFactor = √(x² + y²)). In a distributed multi-node implementation, this visual representation corresponds to the actual cryptographic verification protocol enabling validator nodes to synchronize astronomical positioning, quantum structural integrity, and token verification pathways through a mathematically rigorous shared-nothing architecture. The 99.9975% verification precision (equivalent to 512-bit entropy) represents the alignment accuracy required across distributed nodes for successful transaction validation, with sub-microsecond timing requirements that prevent even quantum computational attacks."
  },
  integratedSystem: {
    title: "Integrated Identity System",
    overview: "This visualization demonstrates a mathematically harmonious identity system that unifies astronomical principles with quantum patterning. At its foundation, the system uses precise Julian Day calculations (JD = 2440587.5 + ms/86400000) as its temporal cornerstone, anchoring all identity elements to an immutable astronomical reference. The underlying framework combines Penrose P3 tiling mathematics with golden ratio (φ = 1.6180339887...) principles to create perfect 5-fold symmetry arrangements that never repeat yet maintain mathematical consistency. The astronomical representation employs quaternion transformations for multi-dimensional rotations, while the quantum structural layer ensures non-predictability through mathematically significant interference patterns based on prime number harmonics [7, 11, 13, 17].",
    visual: "At the heart of the visualization rests a luminous astronomical body surrounded by a shimmering cloud of silver and gold light particles. This central element represents the τ (tau) constant (6.28318530718...), the fundamental circle constant that governs wave propagation properties throughout the identity system. The surrounding particles exhibit Fibonacci-derived distribution patterns with mathematically significant density gradients, creating natural aesthetic harmony through golden ratio proportions. Each particle's color, opacity, and position follows ergodic distribution functions that balance deterministic positioning with quantum uncertainty principles. The particles pulse subtly with frequencies derived from astronomical cycles, creating a visual representation of the system's foundational mathematical harmony. As the Julian Day advances with ultra-high precision (7-digit accuracy), the identity system maintains its position while continuously evolving its expressive properties, demonstrating the elegant balance between cosmic consistency and quantum dynamism that forms the core of this identity representation system."
  }
};

/**
 * Generate a pseudo-random string based on a seed using golden ratio PRNG
 * @param {number} length - Length of the output string
 * @param {number} seed - Seed for random number generation
 * @returns {string} - Random string of specified length
 */
function generatePseudoRandomString(length, seed) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789τφπξψω';
  const phi = CONSTANTS.PHI; // Golden ratio
  let result = '';
  let value = seed;
  
  for (let i = 0; i < length; i++) {
    // Use golden ratio multiplier for the PRNG
    value = (value * phi) % 1;
    const charIndex = Math.floor(value * chars.length);
    result += chars.charAt(charIndex);
  }
  
  return result;
}

/**
 * Calculate Julian Day from a JavaScript Date object
 * @param {Date} date - JavaScript Date object
 * @returns {number} - Julian Day Number with fractional component
 */
function calculateJulianDay(date) {
  // Get timestamp in milliseconds
  const timestamp = date.getTime();
  
  // JDN = (timestamp / 86400000) + 2440587.5
  const julianDay = (timestamp / 86400000) + CONSTANTS.JULIAN_DAY_OFFSET;
  
  return julianDay;
}

/**
 * Format a number with scientific notation for display
 * @param {number} num - Number to format
 * @param {number} precision - Decimal precision
 * @returns {string} - Formatted number
 */
function formatScientific(num, precision = 6) {
  if (Math.abs(num) < 0.000001 || Math.abs(num) >= 1000000) {
    return num.toExponential(precision);
  }
  return num.toFixed(precision);
}

/**
 * Create component description section in the overview page
 * @param {Object} component - Component description object
 * @param {HTMLElement} container - Container to append the description
 */
function createComponentSection(component, container) {
  const section = document.createElement('section');
  section.className = 'component-section';
  
  // Create header with component title
  const header = document.createElement('h2');
  header.textContent = component.title;
  header.className = 'component-title';
  section.appendChild(header);
  
  // Create collapsible sections
  const sections = [
    { title: 'Technical Implementation', content: component.technical, class: 'technical' },
    { title: 'Mathematical Foundation', content: component.mathematical, class: 'mathematical' },
    { title: 'System Role', content: component.systemRole, class: 'system-role' }
  ];
  
  // For integrated system, use different sections
  if (component.title === 'Integrated Identity System') {
    sections.length = 0;
    sections.push(
      { title: 'System Overview', content: component.overview, class: 'technical' },
      { title: 'Visual Representation', content: component.visual, class: 'mathematical' }
    );
  }
  
  // Create each collapsible section
  sections.forEach(sectionData => {
    if (!sectionData.content) return;
    
    const subSection = document.createElement('div');
    subSection.className = `component-subsection ${sectionData.class}`;
    
    const subHeader = document.createElement('h3');
    subHeader.textContent = sectionData.title;
    subHeader.className = 'subsection-title';
    subSection.appendChild(subHeader);
    
    const content = document.createElement('div');
    content.className = 'subsection-content';
    content.innerHTML = formatMathText(sectionData.content);
    subSection.appendChild(content);
    
    section.appendChild(subSection);
  });
  
  container.appendChild(section);
}

/**
 * Format text with mathematical notation for better readability
 * Converts notation like φ, τ, ±, etc. to properly styled HTML
 * @param {string} text - Input text with mathematical notation
 * @returns {string} - HTML formatted text with styled math
 */
function formatMathText(text) {
  // Replace mathematical symbols with formatted versions
  return text
    .replace(/φ/g, '<span class="math-symbol phi">φ</span>')
    .replace(/τ/g, '<span class="math-symbol tau">τ</span>')
    .replace(/π/g, '<span class="math-symbol pi">π</span>')
    .replace(/±/g, '<span class="math-symbol">±</span>')
    .replace(/√/g, '<span class="math-symbol sqrt">√</span>')
    .replace(/\b([A-Za-z])([A-Za-z\d]*)\b\s*=/g, '<span class="math-var">$1$2</span> =')
    .replace(/\((\d+\.\d+)\)/g, '(<span class="math-num">$1</span>)')
    // Highlight formulas enclosed in mathematical notation
    .replace(/(\w+)\s*=\s*([^.,;]+)/g, '<span class="math-formula">$1 = $2</span>');
}

/**
 * Create the overview page layout and populate with component descriptions
 * Working with the existing overview.html structure
 */
function createOverviewPage() {
  // Add favicon to the page
  addFavicon();
  
  // Update the Julian Day display
  const julianDayElement = document.getElementById('current-jd');
  if (julianDayElement) {
    updateJulianDay();
  } else {
    // If the Julian Day display doesn't exist, create it
    const headerElement = document.querySelector('.header');
    if (headerElement) {
      const julianDayDisplay = document.createElement('div');
      julianDayDisplay.className = 'julian-day-display';
      julianDayDisplay.innerHTML = `<span>Julian Day:</span> <span id="current-jd" class="jd-value">0000000.0000000</span>`;
      headerElement.appendChild(julianDayDisplay);
    }
  }
  
  // Update the status values
  const securityStatusElement = document.getElementById('security-status');
  if (securityStatusElement) {
    securityStatusElement.textContent = SYSTEM_STATUS.status;
  }
  
  const tokenDisplayElement = document.getElementById('token-display');
  if (tokenDisplayElement) {
    tokenDisplayElement.textContent = SYSTEM_STATUS.token;
  }
  
  const timestampElement = document.getElementById('timestamp');
  if (timestampElement) {
    timestampElement.textContent = SYSTEM_STATUS.timestamp;
  }
  
  const securityLevelElement = document.getElementById('security-level');
  if (securityLevelElement) {
    securityLevelElement.textContent = SYSTEM_STATUS.level;
  }
  
  // Populate the component panels
  populateComponentsPanel();
  
  // Populate the constants panel
  populateConstantsPanel();
  
  // Set up tab switching
  setupTabs();
  
  // Update Julian Day in real-time
  updateJulianDay();
  setInterval(updateJulianDay, 100); // Update every 100ms for high precision
}

/**
 * Populate the components panel with detailed component descriptions
 */
function populateComponentsPanel() {
  const identityPanel = document.getElementById('identity-panel');
  if (!identityPanel) return;
  
  const componentGrid = identityPanel.querySelector('.visualization-grid');
  if (!componentGrid) return;
  
  // Create sections for each component
  const components = [
    COMPONENT_DESCRIPTIONS.astronomicalClock,
    COMPONENT_DESCRIPTIONS.quantumIdentity,
    COMPONENT_DESCRIPTIONS.ashToken
  ];
  
  components.forEach(component => {
    const card = document.createElement('div');
    card.className = 'visualization-card';
    
    // Component title
    const title = document.createElement('h3');
    title.className = 'visualization-title';
    title.textContent = component.title;
    card.appendChild(title);
    
    // Add a short description first
    let shortDescription = "";
    if (component.title === "Astronomical Clock") {
      shortDescription = "Temporal synchronization pattern for secure time-based verification";
    } else if (component.title === "Quantum Identity") {
      shortDescription = "Non-repeating digital signature based on Penrose tiling patterns";
    } else if (component.title === "Ash (Æ) Token") {
      shortDescription = "Mathematical identity protection with non-repeating, complex verification patterns";
    }
    
    const descriptionP = document.createElement('p');
    descriptionP.className = 'visualization-description';
    descriptionP.textContent = shortDescription;
    card.appendChild(descriptionP);
    
    // Technical implementation section
    const technicalSection = document.createElement('div');
    technicalSection.className = 'component-section';
    
    const technicalTitle = document.createElement('h4');
    technicalTitle.className = 'section-title';
    technicalTitle.textContent = 'Technical Implementation';
    technicalSection.appendChild(technicalTitle);
    
    const technicalContent = document.createElement('div');
    technicalContent.className = 'visualization-description';
    technicalContent.innerHTML = formatMathText(component.technical);
    technicalSection.appendChild(technicalContent);
    
    card.appendChild(technicalSection);
    
    // Mathematical foundation section
    const mathSection = document.createElement('div');
    mathSection.className = 'component-section';
    
    const mathTitle = document.createElement('h4');
    mathTitle.className = 'section-title';
    mathTitle.style.color = 'var(--accent-green)';
    mathTitle.textContent = 'Mathematical Foundation';
    mathSection.appendChild(mathTitle);
    
    const mathContent = document.createElement('div');
    mathContent.className = 'visualization-description';
    mathContent.innerHTML = formatMathText(component.mathematical);
    mathSection.appendChild(mathContent);
    
    card.appendChild(mathSection);
    
    // System role section
    if (component.systemRole) {
      const roleSection = document.createElement('div');
      roleSection.className = 'component-section';
      
      const roleTitle = document.createElement('h4');
      roleTitle.className = 'section-title';
      roleTitle.style.color = 'var(--secondary-color)';
      roleTitle.textContent = 'System Role';
      roleSection.appendChild(roleTitle);
      
      const roleContent = document.createElement('div');
      roleContent.className = 'visualization-description';
      roleContent.innerHTML = formatMathText(component.systemRole);
      roleSection.appendChild(roleContent);
      
      card.appendChild(roleSection);
    }
    
    componentGrid.appendChild(card);
  });
}

/**
 * Populate the constants panel with mathematical constants
 */
function populateConstantsPanel() {
  const metricsPanel = document.getElementById('metrics-panel');
  if (!metricsPanel) return;
  
  const constantsList = metricsPanel.querySelector('.metrics-panel');
  if (!constantsList) return;
  
  // Add each constant with formatted value
  [
    { name: 'Golden Ratio (φ)', value: CONSTANTS.PHI, symbol: 'φ', description: 'Used for quantum identity pattern generation and spiral calculations' },
    { name: 'Tau (τ)', value: CONSTANTS.TAU, symbol: 'τ', description: 'The circle constant (2π) used for wave propagation and rotational transforms' },
    { name: 'Prime Harmonics', value: CONSTANTS.PRIMES.join(', '), isArray: true, description: 'Prime numbers used for verification pattern generation and non-repeating sequences' },
    { name: 'Julian Day Offset', value: CONSTANTS.JULIAN_DAY_OFFSET, description: 'Offset value for Julian Day calculation from Unix epoch milliseconds' }
  ].forEach(constant => {
    const metricCard = document.createElement('div');
    metricCard.className = 'metric-card';
    
    const metricTitle = document.createElement('div');
    metricTitle.className = 'metric-title';
    metricTitle.textContent = constant.name;
    metricCard.appendChild(metricTitle);
    
    const metricValue = document.createElement('div');
    metricValue.className = 'metric-value';
    if (constant.isArray) {
      metricValue.textContent = constant.value;
    } else {
      metricValue.textContent = formatScientific(constant.value);
    }
    metricCard.appendChild(metricValue);
    
    const metricDescription = document.createElement('div');
    metricDescription.className = 'metric-description';
    metricDescription.textContent = constant.description;
    metricCard.appendChild(metricDescription);
    
    constantsList.appendChild(metricCard);
  });
}

/**
 * Set up tab switching functionality and theme toggling
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.dashboard-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Hide all panels
      document.querySelectorAll('.dashboard-panel').forEach(panel => {
        panel.style.display = 'none';
      });
      
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Show the selected panel and activate the tab
      const panelId = this.getAttribute('data-panel');
      document.getElementById(panelId).style.display = 'block';
      this.classList.add('active');
    });
  });
  
  // Check if a theme preference is saved in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'v3') {
    applyV3Theme();
  }

  // Add event listener for theme toggling
  document.getElementById('theme-toggle').addEventListener('click', function() {
    if (document.body.classList.contains('v3-theme')) {
      // Switch to v4 theme
      applyV4Theme();
      localStorage.setItem('theme', 'v4');
    } else {
      // Switch to v3 theme
      applyV3Theme();
      localStorage.setItem('theme', 'v3');
    }
  });
}

/**
 * Function to apply v3 theme
 */
function applyV3Theme() {
  document.body.classList.add('v3-theme');
  const securityStatus = document.querySelector('#security-status');
  if (securityStatus) {
    securityStatus.textContent = 'Quantum Secure';
  }
  
  // Create pulsing star-center effect specific to v3 theme
  setTimeout(() => {
    // Add star-like center effect if it doesn't exist
    if (!document.getElementById('star-center')) {
      const starCenter = document.createElement('div');
      starCenter.id = 'star-center';
      starCenter.style.position = 'absolute';
      starCenter.style.width = '16px';
      starCenter.style.height = '16px';
      starCenter.style.top = '50%';
      starCenter.style.left = '50%';
      starCenter.style.transform = 'translate(-50%, -50%)';
      starCenter.style.borderRadius = '50%';
      starCenter.style.background = 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(150,210,255,0.8) 40%, rgba(100,160,255,0.3) 70%, transparent 100%)';
      starCenter.style.boxShadow = '0 0 12px rgba(160, 210, 255, 0.8), 0 0 20px rgba(100, 160, 255, 0.5)';
      starCenter.style.animation = 'star-breathing 3s infinite ease-in-out';
      starCenter.style.zIndex = '150';
      
      // Create the keyframes if they don't exist
      if (!document.getElementById('star-keyframes')) {
        const style = document.createElement('style');
        style.id = 'star-keyframes';
        style.textContent = `
          @keyframes star-breathing {
            0%, 100% {
              transform: translate(-50%, -50%) scale(0.8);
              background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(130,190,255,0.8) 40%, rgba(80,140,255,0.3) 70%, transparent 100%);
              box-shadow: 0 0 8px rgba(150, 200, 255, 0.7), 0 0 12px rgba(80, 140, 255, 0.4);
            }
            
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(150,210,255,0.8) 40%, rgba(100,160,255,0.3) 70%, transparent 100%);
              box-shadow: 0 0 12px rgba(160, 210, 255, 0.8), 0 0 20px rgba(100, 160, 255, 0.5);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Add to the visualization container
      const container = document.querySelector('.visualization-canvas-container');
      if (container) {
        container.appendChild(starCenter);
      } else {
        document.body.appendChild(starCenter);
      }
    }
  }, 1000);
}

/**
 * Function to apply v4 theme
 */
function applyV4Theme() {
  document.body.classList.remove('v3-theme');
  const securityStatus = document.querySelector('#security-status');
  if (securityStatus) {
    securityStatus.textContent = 'Secure';
  }
  
  // Remove v3-specific elements
  const starCenter = document.getElementById('star-center');
  if (starCenter) {
    starCenter.remove();
  }
}

/**
 * Update the Julian Day display with the current time
 */
function updateJulianDay() {
  const julianDayElement = document.getElementById('current-jd');
  if (julianDayElement) {
    const now = new Date();
    const jd = calculateJulianDay(now);
    julianDayElement.textContent = jd.toFixed(7); // Display with 7 decimal places
  }
}

/**
 * Add CSS styles for the overview page
 * Based on the styles in overview.html
 */
function addOverviewStyles() {
  // Add fonts
  const fontLinks = `
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:100,400,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=PT+Mono" rel="stylesheet">
  `;
  document.head.insertAdjacentHTML('beforeend', fontLinks);
  
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* v0.4 Styles */
    :root {
        --background-color: #000000;
        --primary-color: #40a0ff;
        --secondary-color: #ff8040;
        --tertiary-color: #40ff80;
        --quaternary-color: #ffc080;
        --text-color: #ffffff;
        --accent-blue: #61DAFB;
        --accent-green: #4CAF50;
        --accent-teal: #03DAC5;
        --quantum-glow: rgba(97, 218, 251, 0.6);
        --token-gold: rgba(212, 175, 55, 0.9);
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: 'Roboto', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        overflow-x: hidden;
    }
    
    /* v0.3 Theme */
    body.v3-theme {
        background: radial-gradient(circle at 50% 50%, #454545 20%, #1A1A1A 100%);
        font-family: "PT Mono", monospace;
        width: 100vw;
        height: 100vh;
        overscroll-behavior: none; /* Prevent bounce effect on some browsers */
        -webkit-tap-highlight-color: transparent; /* Prevent tap highlight on mobile */
        -webkit-touch-callout: none; /* Prevent iOS callout on long press */
        touch-action: manipulation; /* Optimize for touch */
    }
    
    /* Additional v3-theme styling for dashboard */
    body.v3-theme .card {
        background: rgba(30, 34, 42, 0.8);
        border: 1px solid rgba(100, 130, 200, 0.3);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
    }
    
    body.v3-theme .card-title {
        color: #a0c0ff;
        text-shadow: 0 0 5px rgba(100, 150, 255, 0.5);
        font-family: "Montserrat", sans-serif;
    }
    
    body.v3-theme .value-display,
    body.v3-theme .data-value {
        font-family: "PT Mono", monospace;
        color: #d0e0ff;
    }
    
    body.v3-theme .header {
        background: rgba(20, 25, 40, 0.7);
        border-bottom: 1px solid rgba(80, 100, 160, 0.4);
    }

    .header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(64, 160, 255, 0.2);
        margin-bottom: 20px;
    }
    
    body.v3-theme .header {
        border-bottom: 1px solid rgba(150, 133, 80, 0.3);
    }

    h1 {
        color: var(--primary-color);
        font-size: 2rem;
        text-align: center;
        margin-bottom: 10px;
    }
    
    .logo {
        max-width: 240px;
        height: auto;
        margin: 15px 0 15px 0;
        cursor: pointer;
    }

    .description {
        font-size: 1rem;
        text-align: center;
        max-width: 800px;
        margin-bottom: 30px;
        font-weight: 300;
    }

    .dashboard-container {
        width: 100%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .status-bar {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: rgba(10, 20, 40, 0.4);
        border: 1px solid rgba(64, 160, 255, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        font-family: 'Roboto Mono', monospace;
    }

    body.v3-theme .status-bar {
        background-color: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(150, 133, 80, 0.5);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }

    .status-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .status-label {
        font-size: 0.8rem;
        color: var(--primary-color);
        margin-bottom: 5px;
    }

    body.v3-theme .status-label {
        color: rgb(150, 133, 80);
    }

    .status-value {
        font-size: 1rem;
        font-weight: 700;
    }

    .status-indicator {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        margin-right: 10px;
    }

    .status-indicator.secure {
        background-color: #40ff80;
        box-shadow: 0 0 10px #40ff80;
    }

    body.v3-theme .status-indicator.secure {
        background-color: rgb(150, 133, 80);
        box-shadow: 0 0 10px rgba(150, 133, 80, 0.7);
    }

    .dashboard-tabs {
        display: flex;
        width: 100%;
        border-bottom: 1px solid rgba(64, 160, 255, 0.3);
        margin-bottom: 20px;
    }

    body.v3-theme .dashboard-tabs {
        border-bottom: 1px solid rgba(150, 133, 80, 0.3);
    }

    .dashboard-tab {
        padding: 10px 20px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s ease;
        border-bottom: 2px solid transparent;
    }

    .dashboard-tab:hover {
        color: var(--primary-color);
    }

    body.v3-theme .dashboard-tab:hover {
        color: rgb(180, 160, 120);
    }

    .dashboard-tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
    }

    body.v3-theme .dashboard-tab.active {
        color: rgb(150, 133, 80);
        border-bottom: 2px solid rgb(150, 133, 80);
    }

    .dashboard-panels {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .dashboard-panel {
        width: 100%;
        display: none;
    }

    .visualization-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        width: 100%;
    }

    .visualization-card {
        background-color: rgba(10, 20, 40, 0.4);
        border: 1px solid rgba(64, 160, 255, 0.3);
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        transition: all 0.3s ease;
        margin-bottom: 20px;
    }

    body.v3-theme .visualization-card {
        background-color: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(150, 133, 80, 0.5);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), 
                    box-shadow 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), 
                    border-color 0.3s ease;
    }

    .visualization-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 0 20px rgba(64, 160, 255, 0.2);
    }

    body.v3-theme .visualization-card:hover {
        border-color: rgb(180, 160, 120);
        box-shadow: 0 0 20px rgba(150, 133, 80, 0.3);
        transform: translateY(-5px);
    }

    .visualization-title {
        color: var(--primary-color);
        font-size: 1.2rem;
        margin-bottom: 15px;
        text-align: center;
    }

    body.v3-theme .visualization-title {
        color: rgb(150, 133, 80);
        font-family: "Montserrat", sans-serif;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    .visualization-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        margin-bottom: 15px;
        text-align: left;
        line-height: 1.5;
    }

    .visualization-canvas-container {
        width: 600px;
        height: 400px;
        position: relative;
        margin-bottom: 15px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        overflow: hidden;
    }

    .component-section {
        width: 100%;
        margin-bottom: 20px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(64, 160, 255, 0.2);
    }

    .section-title {
        color: var(--primary-color);
        font-size: 1rem;
        margin-bottom: 10px;
        font-weight: 600;
    }

    .julian-day-display {
        font-family: 'Roboto Mono', monospace;
        font-size: 0.9rem;
        background-color: rgba(10, 20, 40, 0.5);
        padding: 5px 10px;
        border-radius: 4px;
        color: var(--primary-color);
        margin: 10px 0;
        display: inline-block;
    }

    .jd-value {
        font-weight: bold;
    }
    
    body.v3-theme .julian-day-display {
        background-color: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(150, 133, 80, 0.5);
        color: rgb(150, 133, 80);
        font-family: "PT Mono", monospace;
    }

    .metrics-panel {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 20px;
    }

    .metric-card {
        width: calc(33.33% - 20px);
        background-color: rgba(10, 20, 40, 0.4);
        border: 1px solid rgba(64, 160, 255, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
    }

    body.v3-theme .metric-card {
        background-color: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(150, 133, 80, 0.5);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }

    .metric-title {
        color: var(--primary-color);
        font-size: 1rem;
        margin-bottom: 10px;
    }

    body.v3-theme .metric-title {
        color: rgb(150, 133, 80);
        font-family: "Montserrat", sans-serif;
    }

    .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 5px;
    }

    .metric-description {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid rgba(64, 160, 255, 0.2);
        width: 100%;
        text-align: center;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
    }

    body.v3-theme .footer {
        border-top: 1px solid rgba(150, 133, 80, 0.3);
    }

    .footer a {
        color: var(--primary-color);
        text-decoration: none;
    }

    body.v3-theme .footer a {
        color: rgb(150, 133, 80);
    }

    .footer a:hover {
        text-decoration: underline;
    }

    /* Math-specific styling */
    .math-symbol {
        font-family: 'Cambria Math', 'Times New Roman', serif;
        color: var(--accent-blue);
        font-weight: bold;
    }
    
    .math-symbol.phi {
        color: #FF9800;
    }
    
    .math-symbol.tau {
        color: var(--accent-teal);
    }
    
    .math-symbol.pi {
        color: #F06292;
    }
    
    .math-var {
        font-style: italic;
        color: var(--accent-blue);
    }
    
    .math-num {
        color: var(--accent-green);
    }
    
    .math-formula {
        background-color: rgba(10, 20, 40, 0.5);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Roboto Mono', monospace;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .visualization-grid {
            grid-template-columns: 1fr;
        }

        .metric-card {
            width: 100%;
        }

        .status-bar {
            flex-direction: column;
            align-items: flex-start;
        }

        .status-item {
            margin-bottom: 10px;
            width: 100%;
        }
        
        .logo {
            max-width: 180px;
        }
        
        .visualization-canvas-container {
            width: 100%;
            height: 300px;
        }
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Initialize overview page on document ready
document.addEventListener('DOMContentLoaded', function() {
  // Add page styles
  addOverviewStyles();
  
  // Create the overview page layout
  createOverviewPage();
});