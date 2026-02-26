// Wallet session cache with lightweight obfuscation
// Caches wallet address in localStorage so return visits show the address instantly
// while ThirdWeb reconnects in the background.
// Obfuscation: XOR with salt + base64 (wallet addresses are public data —
// this just prevents casual plaintext reading in DevTools).

const CACHE_KEY = 'uw_session';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SALT = 0x55; // XOR salt byte

function xorBytes(str, salt) {
  return Array.from(str, ch => String.fromCharCode(ch.charCodeAt(0) ^ salt)).join('');
}

export function cacheWalletSession(address) {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return;
  try {
    const payload = JSON.stringify({ a: address, t: Date.now() });
    const encoded = btoa(xorBytes(payload, SALT));
    localStorage.setItem(CACHE_KEY, encoded);
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getCachedWalletSession() {
  try {
    const encoded = localStorage.getItem(CACHE_KEY);
    if (!encoded) return null;

    const payload = JSON.parse(xorBytes(atob(encoded), SALT));
    const { a: address, t: timestamp } = payload;

    // TTL check
    if (Date.now() - timestamp > TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return address;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function clearWalletCache() {
  localStorage.removeItem(CACHE_KEY);
}
