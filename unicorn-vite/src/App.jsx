import React, { useState, useEffect } from 'react';
import { 
  ThirdwebProvider, 
  ConnectButton, 
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
const factoryAccountAddress = import.meta.env.VITE_FACTORY_ACCOUNT_ADDRESS;

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables");
}
if (!factoryAccountAddress) {
  console.error("VITE_FACTORY_ACCOUNT_ADDRESS is not set in environment variables");
}
const client = createThirdwebClient({
  clientId: clientId || "",
});

const wallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: factoryAccountAddress || "0xD771615c873ba5a2149D5312448cE01D677Ee48A",
      chain: polygon,
      gasless: true,
    }
  })
];

console.log("ThirdWeb Client ID:", clientId ? `${clientId.slice(0, 8)}...` : "NOT SET");

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
  return (
    <ThirdwebProvider>
      <AutoConnect client={client} wallets={wallets} />
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
        🦄 Unicorn.eth PolyPrize Collection
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Claim your exclusive soul-bound NFT
      </p>
      <p className="text-sm text-yellow-300 mb-8">
        🔐 Unicorn.eth authorized wallets only • Gasless claiming
      </p>
      <div className="flex justify-center">

        <p className="text-xl text-gray-300 mb-2">
         account ? `Connected: ${account.address?.slice(0,6)}...${account.address?.slice(-4)}` : "Unicorn.eth Wallet"
        </p>
 
      </div>
    </div>
  );
}

function MintingInterface() {
  const account = useActiveAccount();
  const address = account?.address;
  
  // Track if user connected via autoconnect
  const [isAutoConnected, setIsAutoConnected] = useState(false);
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

  // Debug contract calls - simplified since we know explicit signatures work
  useEffect(() => {
    console.log("=== Contract Debug (Working) ===");
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

  // Check connection type (unicorn.eth autoconnect detection)
  useEffect(() => {
    console.log("=== Unicorn.eth Autoconnect Debug ===");
    console.log("Account:", account);
    console.log("Address:", address);
    
    // Check URL parameters for unicorn.eth autoconnect
    const urlParams = new URLSearchParams(window.location.search);
    const walletId = urlParams.get('walletId');
    const authCookie = urlParams.get('authCookie');
    console.log("Current URL:", window.location.href);
    console.log("URL walletId:", walletId);
    console.log("Has authCookie:", !!authCookie);
    console.log("AuthCookie length:", authCookie?.length || 0);
    
    // Check referrer to see if they came from unicorn.eth
    console.log("Document referrer:", document.referrer);
    const cameFromUnicorn = document.referrer.includes('uunicorn-account.com') || 
                           window.location.hostname.includes('unicorn-account.com') ||
                           window.location.href.includes('unicorn-account.com');
    console.log("Came from unicorn.eth:", cameFromUnicorn);
    
    // Check localStorage for ThirdWeb embedded wallet session
    console.log("=== localStorage Debug ===");
    const allKeys = Object.keys(localStorage);
    const relevantKeys = allKeys.filter(key => 
      key.toLowerCase().includes('thirdweb') || 
      key.toLowerCase().includes('tw') ||
      key.toLowerCase().includes('embedded') ||
      key.toLowerCase().includes('inapp')
    );
    console.log("ThirdWeb localStorage keys:", relevantKeys);
    relevantKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : null);
    });
    
    if (account && address) {
      // Authorization logic: Only allow unicorn.eth embedded wallets with proper autoconnect
      const isAuthorizedUnicornWallet = 
        // Primary check: URL has inApp wallet with authCookie (from unicorn.eth)
        (walletId === 'inApp' && authCookie && authCookie.length > 100) ||
        
        // Secondary check: ThirdWeb embedded wallet session exists
        (localStorage.getItem('thirdweb:active-wallet') === 'inApp') ||
        
        // Tertiary check: Any embedded wallet indicator in localStorage
        relevantKeys.some(key => 
          key.includes('inApp') || 
          key.includes('embedded') ||
          (localStorage.getItem(key) && localStorage.getItem(key).includes('inApp'))
        );
      
      console.log("=== Authorization Decision ===");
      console.log("Is authorized unicorn.eth wallet:", isAuthorizedUnicornWallet);
      console.log("Wallet ID check:", walletId === 'inApp');
      console.log("Auth cookie check:", !!authCookie && authCookie.length > 100);
      console.log("Active wallet check:", localStorage.getItem('thirdweb:active-wallet'));
      
      setIsAutoConnected(isAuthorizedUnicornWallet);
    } else {
      console.log("No account or address detected - setting unauthorized");
      setIsAutoConnected(false);
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
    if (!isAutoConnected) {
      setMintStatus("Access denied - unauthorized wallet");
      return;
    }

    if (!account) {
      setMintStatus("Please connect your wallet");
      return;
    }

    try {
      setMintStatus("Claiming your gasless soul-bound NFT...");
      
      // Prepare the contract call with explicit function signature
      const transaction = prepareContractCall({
        contract,
        method: "function mint()",
        params: [],
      });

      // Send the transaction - gas is automatically sponsored via account abstraction
      sendTransaction(transaction, {
        onSuccess: (result) => {
          setMintStatus("Successfully claimed! 🎉");
          setTimeout(() => setMintStatus(""), 3000);
        },
        onError: (error) => {
          console.error("Claiming failed:", error);
          setMintStatus("Claiming failed. Please try again.");
        }
      });

    } catch (error) {
      console.error("Transaction preparation failed:", error);
      setMintStatus("Transaction failed. Please try again.");
    }
  };

  const supplyPercentage = totalSupply && maxSupply ? 
    Math.round((parseInt(totalSupply.toString()) / parseInt(maxSupply.toString())) * 100) : 0;

  if (!address) {
    return (
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">🔐 Authorized Access Only</h2>
          <p className="text-gray-300 text-lg mb-4">
            This NFT claiming is restricted to pre-authorized wallets only.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Please use the Connect Wallet button above to connect your authorized wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <StatCard 
          title="Minted" 
          value={`${totalSupply?.toString() || "0"} / ${maxSupply?.toString() || "10000"}`}
          subtitle={`${supplyPercentage}% complete`}
        />
        <StatCard 
          title="Your Status" 
          value={hasMinted ? "Claimed ✅" : "Not Claimed"} 
          className={hasMinted ? "text-green-400" : "text-gray-400"}
        />
        <StatCard 
          title="Access Level" 
          value={isAutoConnected ? "Authorized ✅" : "Unauthorized ❌"} 
          className={isAutoConnected ? "text-green-400" : "text-red-400"}
        />
        <StatCard 
          title="Drawing Status" 
          value={isMintingActive ? "Active" : "Ended"} 
          className={isMintingActive ? "text-green-400" : "text-red-400"}
        />
        <StatCard 
          title="Contract Status" 
          value={isPaused ? "Paused" : "Active"} 
          className={isPaused ? "text-yellow-400" : "text-green-400"}
        />
        <StatCard 
          title="Time Remaining" 
          value={countdown || "Loading..."} 
          className="text-yellow-400"
        />
      </div>

      {/* Drawing Date Info */}
      {drawingDate && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-yellow-300 mb-2 flex items-center">
            ⏰ Drawing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      )}

      {/* Claiming Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Claim Your Soul-Bound NFT
        </h2>
        
        {checkingMinted ? (
          <div className="text-center text-white">Checking claim status...</div>
        ) : !isAutoConnected ? (
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-300 mb-2">🚫 Access Denied</h3>
              <p className="text-red-200 mb-2">
                NFT claiming is restricted to pre-authorized wallets only.
              </p>
              <p className="text-red-200 text-sm">
                If you believe you should have access, please contact the project administrators.
              </p>
            </div>
          </div>
        ) : isPaused ? (
          <div className="text-center">
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">⏸️ Claiming Paused</h3>
              <p className="text-yellow-200">
                NFT claiming has been temporarily paused by the contract owner.
              </p>
            </div>
          </div>
        ) : !isMintingActive ? (
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-300 mb-2">🚫 Claiming Period Ended</h3>
              <p className="text-red-200">
                The drawing date has passed and NFT claiming is no longer available.
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
                All {maxSupply.toString()} NFTs have been claimed!
              </p>
            </div>
          </div>
        ) : hasMinted ? (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-300">
                You have already claimed your soul-bound NFT! 🎉
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-300 mb-3">✅ Authorized to Claim</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold text-white">Soul-Bound Features:</p>
                  <ul className="text-green-200 space-y-1 mt-2">
                    <li>• Unique to your wallet</li>
                    <li>• Cannot be transferred</li>
                    <li>• One claim per wallet</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <p className="font-semibold text-white">Your Access:</p>
                  <ul className="text-green-200 space-y-1 mt-2">
                    <li>• Pre-authorized wallet ✅</li>
                    <li>• Auto-connected ✅</li>
                    <li>• Ready to claim ✅</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleMint}
              disabled={isMinting || isPaused || !isAutoConnected}
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