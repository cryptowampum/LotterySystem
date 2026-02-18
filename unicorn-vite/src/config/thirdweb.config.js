import { createThirdwebClient, getContract } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon, arbitrum, optimism, base, sepolia } from "thirdweb/chains";

// ThirdWeb client
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const factoryAddress = import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS;

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables");
}
if (!factoryAddress) {
  console.error("VITE_THIRDWEB_FACTORY_ADDRESS is not set in environment variables");
}

export const client = createThirdwebClient({
  clientId: clientId || "",
});

// Chain selection from environment variable
const NETWORK_MAP = { polygon, arbitrum, optimism, base, sepolia };
export const chain = NETWORK_MAP[import.meta.env.VITE_APP_NETWORK_NAME] || polygon;

// Supported wallets
export const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: factoryAddress,
      chain: chain,
      gasless: true,
      sponsorGas: true,
    }
  })
];

// Contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("VITE_CONTRACT_ADDRESS is not set in environment variables");
}

export const contract = getContract({
  client,
  chain: chain,
  address: CONTRACT_ADDRESS || "",
});

export { clientId, factoryAddress };
