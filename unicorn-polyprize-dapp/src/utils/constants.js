export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";
export const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID) || 137;
export const THIRDWEB_CLIENT_ID = process.env.REACT_APP_THIRDWEB_CLIENT_ID || "";

export const MESSAGES = {
  ACCESS_DENIED: "Access denied - unauthorized wallet",
  CLAIMING_IN_PROGRESS: "Claiming your soul-bound NFT...",
  CLAIM_SUCCESS: "Successfully claimed! 🎉",
  CLAIM_FAILED: "Claiming failed. Please try again.",
  DRAWING_ENDED: "Drawing has ended",
};

export const STATUS_TYPES = {
  AUTHORIZED: 'Authorized',
  UNAUTHORIZED: 'Unauthorized',
  CLAIMED: 'Claimed',
  NOT_CLAIMED: 'Not Claimed',
  ACTIVE: 'Active',
  ENDED: 'Ended',
  PAUSED: 'Paused',
};