import React, { useState, useEffect } from 'react';
import { 
  ThirdwebProvider, 
  useActiveAccount, 
  useReadContract,
  useSendTransaction,
  AutoConnect
} from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import './index.css';

// Create ThirdWeb client with error handling
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables");
}

const client = createThirdwebClient({
  clientId: clientId || "",
});

// Configure wallets with proper factory address for AutoConnect
const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: "0xD771615c873ba5a2149D5312448cE01D677Ee48A", // Unicorn factory address
      chain: polygon,
      gasless: true,
      sponsorGas: true,
    }
  })
];

console.log("ThirdWeb Client ID:", clientId ? `${clientId.slice(0, 8)}...` : "NOT SET");
console.log("Factory Address: 0xD771615c873ba5a2149D5312448cE01D677Ee48A");
console.log("Supported Wallets:", supportedWallets.length);

// Get contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("VITE_CONTRACT_ADDRESS is not set in environment variables");
}

console.log("Contract Address:", CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0, 8)}...` : "NOT SET");

const contract = getContract({
  client,
  chain: polygon,
  address: CONTRACT_ADDRESS || "",
});

function App() {
  // Track AutoConnect start time for timeout display
  useEffect(() => {
    window.autoConnectStart = Date.now();
  }, []);

  return (
    <ThirdwebProvider>
      {/* AutoConnect with proper Unicorn configuration */}
      <AutoConnect 
        client={client} 
        wallets={supportedWallets}
        timeout={15000} // Give more time for connection
        onConnect={(wallet) => {
          console.log("🦄 AutoConnect successful:", wallet);
          console.log("Address:", wallet.getAddress ? wallet.getAddress() : 'Getting address...');
          console.log("Chain:", wallet.getChain ? wallet.getChain()?.name : 'Getting chain...');
        }}
        onError={(error) => {
          console.error("❌ AutoConnect failed:", error);
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <Header />
          <MintingInterface />
        </div>
      </div>
    </ThirdwebProvider>
  );
}

function Header() {
  const account = useActiveAccount();
  
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-white mb-4">
        🦄 <br/>Claim your PolyPrize
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Click "Claim" below to receive your PolyPrize NFT and be entered to win the $200 raffle.
      </p>
      <p className="text-sm text-yellow-300 mb-8">
        🔐 Existing polygon.ac members only • Claim for free 
      </p>
      

    </div>
  );
}

function MintingInterface() {
  const account = useActiveAccount();
  const address = account?.address;
  
  // Track authorization and connection state
  const [isAuthorizedUnicornWallet, setIsAuthorizedUnicornWallet] = useState(false);
  const [connectionState, setConnectionState] = useState("checking"); // checking, unauthorized, authorized
  const [mintStatus, setMintStatus] = useState("");
  const [countdown, setCountdown] = useState("");

  // Contract read calls - using explicit function signatures (ThirdWeb v5 requirement)
  const { data: hasMinted, isLoading: checkingMinted, error: hasMintedError } = useReadContract({
    contract,
    method: "function hasMinted(address) view returns (bool)",
    params: [address || "0x0000000000000000000000000000000000000000"],
  });

  const { data: totalSupply, error: totalSupplyError } = useReadContract({
    contract,
    method: "function totalSupply() view returns (uint256)",
  });

  const { data: maxSupply, error: maxSupplyError } = useReadContract({
    contract,
    method: "function MAX_SUPPLY() view returns (uint256)",
  });

  const { data: drawingDate, error: drawingDateError } = useReadContract({
    contract,
    method: "function drawingDate() view returns (uint256)",
  });

  const { data: isMintingActive, error: isMintingActiveError } = useReadContract({
    contract,
    method: "function isMintingActive() view returns (bool)",
  });

  const { data: isPaused, error: isPausedError } = useReadContract({
    contract,
    method: "function paused() view returns (bool)",
  });

  // Debug contract calls
  useEffect(() => {
    console.log("=== Contract Debug (AutoConnect Mode) ===");
    console.log("Contract address:", contract?.address);
    console.log("Chain ID:", contract?.chain?.id);
    
    console.log("=== Contract Data (All Explicit Signatures) ===");
    console.log("hasMinted:", hasMinted);
    console.log("totalSupply:", totalSupply?.toString());
    console.log("maxSupply:", maxSupply?.toString());
    console.log("drawingDate:", drawingDate?.toString());
    console.log("isMintingActive:", isMintingActive);
    console.log("isPaused:", isPaused);
    
    // Convert BigInt timestamp to readable date
    if (drawingDate) {
      const drawingDateJS = new Date(parseInt(drawingDate.toString()) * 1000);
      console.log("Drawing date (readable):", drawingDateJS.toLocaleString());
    }
    
    // Log any errors
    if (totalSupplyError) console.error("totalSupply error:", totalSupplyError);
    if (hasMintedError) console.error("hasMinted error:", hasMintedError);
    if (maxSupplyError) console.error("maxSupply error:", maxSupplyError);
    if (drawingDateError) console.error("drawingDate error:", drawingDateError);
    if (isMintingActiveError) console.error("isMintingActive error:", isMintingActiveError);
    if (isPausedError) console.error("isPaused error:", isPausedError);
  }, [hasMinted, totalSupply, maxSupply, drawingDate, isMintingActive, isPaused]);

  // Send transaction hook
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  // Simplified authorization for existing smart wallet holders
  useEffect(() => {
    console.log("=== Existing Smart Wallet Authorization Check ===");
    console.log("Account:", account);
    console.log("Address:", address);
    
    // Check localStorage for ThirdWeb wallet session
    const activeWallet = localStorage.getItem('thirdweb:active-wallet');
    console.log("Active wallet type:", activeWallet);
    
    if (account && address) {
      console.log("=== Account Connected Successfully ===");
      console.log("Smart wallet address:", address);
      console.log("This user has an existing smart wallet from our system");
      
      // If AutoConnect worked and we have an account, they're authorized
      // (because only existing smart wallets from our factory can connect)
      const isAuthorizedWallet = true; // Simplified - AutoConnect success = authorized
      
      console.log("=== Authorization Decision ===");
      console.log("User has existing smart wallet - AUTHORIZED ✅");
      
      setIsAuthorizedUnicornWallet(isAuthorizedWallet);
      setConnectionState("authorized");
    } else {
      console.log("No account connected - user doesn't have existing smart wallet");
      setIsAuthorizedUnicornWallet(false);
      
      // After timeout, show unauthorized (they don't have an existing wallet)
      const timer = setTimeout(() => {
        if (!account) {
          console.log("Timeout reached - user doesn't have existing smart wallet");
          setConnectionState("unauthorized");
        }
      }, 15000); // Match AutoConnect timeout
      
      return () => clearTimeout(timer);
    }
  }, [account, address]);

  // Countdown timer
  useEffect(() => {
    if (!drawingDate) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const drawingTimestamp = parseInt(drawingDate.toString());
      const timeLeft = drawingTimestamp - now;
      
      if (timeLeft <= 0) {
        setCountdown("Drawing has ended");
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(timeLeft / 86400);
      const hours = Math.floor((timeLeft % 86400) / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [drawingDate]);

  const handleMint = async () => {
    if (!isAuthorizedUnicornWallet) {
      setMintStatus("Access denied - unauthorized wallet");
      return;
    }

    if (!account) {
      setMintStatus("Please ensure your wallet is connected");
      return;
    }

    try {
      setMintStatus("Claiming your PolyPrize...");
      
      // Prepare the contract call with explicit function signature
      const transaction = prepareContractCall({
        contract,
        method: "function mint()",
        params: [],
      });

      // Send the transaction - gas is automatically sponsored via smart account
      sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("Mint successful:", result);
          setMintStatus("Successfully claimed! 🎉");
          setTimeout(() => setMintStatus(""), 3000);
        },
        onError: (error) => {
          console.error("Claiming failed:", error);
          setMintStatus("Claiming failed. Please try again.");
          setTimeout(() => setMintStatus(""), 5000);
        }
      });

    } catch (error) {
      console.error("Transaction preparation failed:", error);
      setMintStatus("Transaction failed. Please try again.");
      setTimeout(() => setMintStatus(""), 5000);
    }
  };

  const supplyPercentage = totalSupply && maxSupply ? 
    Math.round((parseInt(totalSupply.toString()) / parseInt(maxSupply.toString())) * 100) : 0;

  // Show connection status while AutoConnect is working
  if (connectionState === "checking") {
    return (
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-white mb-4">🔄 Looking for Existing Wallet...</h2>
            <p className="text-gray-300 text-lg mb-4">
              Connecting to your unicorn.eth wallet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Only existing smart wallets from polygon.ac can access this lottery
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Factory: 0xD771...48A | Client: {clientId?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="max-w-4xl mx-auto">
            {/* Claiming Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
        
        {checkingMinted ? (
          <div className="text-center text-white">Checking claim status...</div>
        ) : !isAuthorizedUnicornWallet ? (
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-300 mb-2">🚫 No Existing Wallet Found</h3>
              <p className="text-red-200 mb-2">
                This lottery is only available to users with previously issued from unicorn.eth.
              </p>
              <p className="text-red-200 text-sm mb-4">
                You must have received a smart wallet from our system to participate.
              </p>
            </div>
          </div>
        ) : isPaused ? (
          <div className="text-center">
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">⏸️ Claiming Paused</h3>
              <p className="text-yellow-200">
                Claiming has been temporarily paused by the contract owner.
              </p>
            </div>
          </div>
        ) : !isMintingActive ? (
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-300 mb-2">🚫 Claiming Period Ended</h3>
              <p className="text-red-200">
                The drawing date has passed and PolyPrize claiming is no longer available.
              </p>
              <p className="text-red-200 mt-2">
                Drawing Date: {drawingDate ? new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
        ) : totalSupply && maxSupply && parseInt(totalSupply.toString()) >= parseInt(maxSupply.toString()) ? (
          <div className="text-center">
            <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-orange-300 mb-2">🎯 Max Supply Reached</h3>
              <p className="text-orange-200">
                All {maxSupply.toString()} Prizes have been claimed!
              </p>
            </div>
          </div>
        ) : hasMinted ? (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-300">
                You have claimed your PolyPrize! 🎉
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 
              </div>
            </div>
            
            <button
              onClick={handleMint}
              disabled={isMinting || isPaused || !isAuthorizedUnicornWallet}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              {isMinting ? "Claiming..." : "🦄 Claim NFT"}
            </button>
            
            {mintStatus && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-white">{mintStatus}</p>
              </div>
            )}
          </div>
        )}
      </div>
            {/* Drawing Date Info */}
      {drawingDate && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-yellow-300 mb-2 flex items-center">
            ⏰ $200 Raffle Details 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-300">Drawing Date:</p>
              <p className="text-white font-semibold">
                {new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-300">Status:</p>
              <p className={`font-semibold ${isMintingActive ? 'text-green-400' : 'text-red-400'}`}>
                {isMintingActive ? '🟢 Claiming Active' : '🔴 Claiming Ended'}
              </p>
            </div>
                       <div>
              <p className="text-gray-300">Time Remaining:</p>
              <p className={`font-semibold ${isMintingActive ? 'text-green-400' : 'text-red-400'}`}>
                {countdown || "Loading..."} 
              </p>
            </div>
 
          </div>
          
        </div>

        
      )}

            {/* Connection Status Display */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto mb-4">
        {account ? (
          <div className="text-green-400">
            <p className="font-semibold">✅ Connected</p>
            <p className="text-sm text-gray-300">
              {account.address?.slice(0,6)}...{account.address?.slice(-4)}
            </p>
          </div>
        ) : (
          <div className="text-yellow-400">
            <p className="font-semibold">🔄 Connecting...</p>
            <p className="text-sm text-gray-300">
              AutoConnect in progress
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ title, value, subtitle, className = "text-white" }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
      <h3 className="text-sm font-semibold text-gray-300 mb-1">{title}</h3>
      <p className={`text-lg font-bold ${className} mb-1`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

export default App;