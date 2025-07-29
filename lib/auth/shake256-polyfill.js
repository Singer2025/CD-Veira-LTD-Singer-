// This is a complete replacement for the shake256.js file in oidc-token-hash
// It mimics the original file's behavior but with proper error handling for edge runtime

// Create a safe implementation that handles all environments
let shake256 = false;

try {
  // Only attempt to check for shake256 support if we're in a Node.js environment
  // with access to process.version and crypto.getHashes()
  if (typeof process !== 'undefined' && 
      process !== null && 
      typeof process.version === 'string' && 
      process.version && 
      process.version.length > 1 && 
      typeof require === 'function') {
    
    // This is the original implementation with proper error handling
    const crypto = require('crypto');
    const versionStr = process.version.substring(1);
    const [major, minor] = versionStr.split('.').map((x) => parseInt(x, 10));
    const xofOutputLength = major > 12 || (major === 12 && minor >= 8);
    shake256 = xofOutputLength && 
              typeof crypto.getHashes === 'function' && 
              crypto.getHashes().includes('shake256');
  }
} catch (error) {
  // Any error means shake256 is not supported
  shake256 = false;
}

// Export the shake256 support flag
module.exports = shake256;