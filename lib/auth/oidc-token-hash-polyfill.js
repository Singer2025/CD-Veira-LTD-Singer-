// Complete polyfill for oidc-token-hash library
// This avoids the issue with process.version.substring in edge runtime

const { createHash } = require('crypto');

// Always set shake256 to false to avoid the problematic code
const shake256 = false;

// Base64url encoding function
function encode(input) {
  if (Buffer.isEncoding('base64url')) {
    return input.toString('base64url');
  } else {
    const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return fromBase64(input.toString('base64'));
  }
}

// Get hash function based on algorithm
function getHash(alg, crv) {
  switch (alg) {
    case 'HS256':
    case 'RS256':
    case 'PS256':
    case 'ES256':
    case 'ES256K':
      return createHash('sha256');

    case 'HS384':
    case 'RS384':
    case 'PS384':
    case 'ES384':
      return createHash('sha384');

    case 'HS512':
    case 'RS512':
    case 'PS512':
    case 'ES512':
    case 'Ed25519':
      return createHash('sha512');

    case 'Ed448':
      if (!shake256) {
        throw new TypeError('Ed448 *_hash calculation is not supported in your Node.js runtime version');
      }
      return createHash('shake256', { outputLength: 114 });

    case 'EdDSA':
      switch (crv) {
        case 'Ed25519':
          return createHash('sha512');
        case 'Ed448':
          if (!shake256) {
            throw new TypeError('Ed448 *_hash calculation is not supported in your Node.js runtime version');
          }
          return createHash('shake256', { outputLength: 114 });
        default:
          throw new TypeError('unrecognized or invalid EdDSA curve provided');
      }

    default:
      throw new TypeError('unrecognized or invalid JWS algorithm provided');
  }
}

// Generate hash
function generate(token, alg, crv) {
  const digest = getHash(alg, crv).update(token).digest();
  return encode(digest.slice(0, digest.length / 2));
}

// Validate hash
function validate(names, actual, source, alg, crv) {
  if (typeof names.claim !== 'string' || !names.claim) {
    throw new TypeError('names.claim must be a non-empty string');
  }

  if (typeof names.source !== 'string' || !names.source) {
    throw new TypeError('names.source must be a non-empty string');
  }

  if (typeof actual !== 'string') {
    throw new TypeError(`${names.claim} must be a string`);
  }

  if (typeof source !== 'string') {
    throw new TypeError(`${names.source} must be a string`);
  }

  if (!source) {
    throw new TypeError(`${names.source} must not be empty`);
  }

  const expected = generate(source, alg, crv);

  if (actual !== expected) {
    throw new Error(`${names.claim} mismatch`);
  }
}

// Export the functions
module.exports = {
  generate,
  validate,
  // Also export shake256 for compatibility
  shake256
};