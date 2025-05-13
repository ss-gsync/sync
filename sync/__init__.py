"""
τCoin Quantum Security System Package

This package provides a tri-verified security architecture using:
1. Astronomical Synchronization
2. Quantum Identity
3. Ash (Æ) Token

The system provides cryptographically secure tokens that:
- Are anchored to verifiable celestial positions
- Use mathematically unique, non-repeating patterns
- Transform continuously to prevent replay attacks
"""

__version__ = '1.0.0'

# Import core components for easier access
from .astronomical_sync import AstronomicalSynchronization
from .ash_token import AshToken, SecurityAPI

# Try to import the full CPPN implementation
try:
    from .quantum_identity import QuantumIdentityCPPN
except ImportError:
    # Fall back to simple version if CPPN dependencies are missing
    from .quantum_identity_simple import SimpleQuantumIdentity as QuantumIdentityCPPN

# Import optional utilities
try:
    from .visualizer import TokenVisualizer
except ImportError:
    # Visualizer requires matplotlib
    pass


def create_security_api():
    """
    Create and initialize a SecurityAPI instance with all components
    
    Returns:
        Initialized SecurityAPI instance
    """
    astro_sync = AstronomicalSynchronization()
    quantum_id = QuantumIdentityCPPN()
    ash_token = AshToken(quantum_id, astro_sync)
    
    return SecurityAPI(astro_sync, quantum_id, ash_token)