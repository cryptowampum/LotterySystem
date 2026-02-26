// NFT metadata cache — stores resolved image URL + isVideo flag in localStorage.
// Soul-bound NFT metadata never changes, so a 7-day TTL is safe.

const CACHE_KEY = 'uw_nft';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function cacheNFTData(imageUrl, isVideo) {
  if (!imageUrl) return;
  try {
    const payload = JSON.stringify({ u: imageUrl, v: !!isVideo, t: Date.now() });
    localStorage.setItem(CACHE_KEY, payload);
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getCachedNFTData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const { u: imageUrl, v: isVideo, t: timestamp } = JSON.parse(raw);

    if (Date.now() - timestamp > TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return { imageUrl, isVideo };
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}
