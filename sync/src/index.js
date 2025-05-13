/**
 * Main entry point for the 𝜏 Quantum Identity application
 */

// Import jQuery and make it globally available
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

// Add version info to the console
console.log(`𝜏 Identity System v${APP_VERSION || '0.4.0'}`);
console.log('Interactive timepiece with quantum identity verification');

// Import stylesheets
import './styles/style.css';

// Import core functionality AFTER jQuery is defined globally
import './js/time';

// Initialize on page load
$(document).ready(function() {
    console.log('Application initialized');
});