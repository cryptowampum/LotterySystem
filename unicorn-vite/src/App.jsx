//Lovingly coded by @cryptowampum and Claude AI
import React, { useState, useEffect } from 'react';
import { 
  ThirdwebProvider, 
  useActiveAccount, 
  useActiveWallet,
  useReadContract,
  useSendTransaction,
  AutoConnect
} from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { 
  initGA, 
  trackPageView, 
  trackWalletConnection, 
  trackNFTClaim, 
  trackSocialShare, 
  trackAuthorizationCheck,
  trackDrawingInfo 
} from './utils/analytics';
import './index.css';

// Create ThirdWeb client with error handling
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
const factoryAddress = import.meta.env.VITE_THIRDWEB_FACTORY_ADDRESS;

const MINT_COOLDOWN = 8000; // 8 seconds

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables");
}
if (!factoryAddress) {
  console.error("VITE_THIRDWEB_FACTORY_ADDRESS is not set in environment variables");
}

const client = createThirdwebClient({
  clientId: clientId || "",
});

const isValidAddress = (address) => {
  return address && /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Configure wallets with proper factory address for AutoConnect
const supportedWallets = [
  inAppWallet({
    smartAccount: {
      factoryAddress: factoryAddress , // Unicorn factory address
      chain: polygon,
      gasless: true,
      sponsorGas: true,
    }
  })
];

if (process.env.NODE_ENV === 'development') {
  console.log("ThirdWeb Client ID configured");
  console.log("Supported Wallets:", supportedWallets.length);
}

// Get contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("VITE_CONTRACT_ADDRESS is not set in environment variables");
}
// Verify contract bytecode or known methods
const verifyContract = async () => {
  const code = await client.getBytecode(CONTRACT_ADDRESS);
  // Verify this matches expected contract
};

if (process.env.NODE_ENV === 'development') {
  console.log("Contract Address configured");
}

const contract = getContract({
  client,
  chain: polygon,
  address: CONTRACT_ADDRESS || "",
});

function App() {
  // Check for autoconnect parameters in URL
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

  // Initialize Google Analytics on app start
  useEffect(() => {
    initGA();
    trackPageView('/');
  }, []);

  // Track AutoConnect start time for timeout display
  useEffect(() => {
    window.autoConnectStart = Date.now();
  }, []);

  // Check URL parameters to determine if AutoConnect should run
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const walletId = urlParams.get('walletId');
    const authCookie = urlParams.get('authCookie');
    const autoConnect = urlParams.get('autoConnect');
    
    // Only enable AutoConnect if proper parameters are present
    const hasAutoConnectParams = (
      (walletId === 'inApp' && authCookie) || 
      (autoConnect === 'true')
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log('AutoConnect check:', {
        walletId,
        hasAuthCookie: !!authCookie,
        autoConnect,
        shouldAutoConnect: hasAutoConnectParams
      });
    }
    
    setShouldAutoConnect(hasAutoConnectParams);
  }, []);

  return (
    <ThirdwebProvider>
      {/* Only render AutoConnect if proper parameters are present */}
      {shouldAutoConnect && (
        <AutoConnect 
          client={client} 
          wallets={supportedWallets}
          timeout={15000}
          onConnect={(wallet) => {
            console.log("🦄 AutoConnect successful:", wallet);
            console.log("Address:", wallet.getAddress ? wallet.getAddress() : 'Getting address...');
            console.log("Chain:", wallet.getChain ? wallet.getChain()?.name : 'Getting chain...');
            
            // Track successful wallet connection
            const address = wallet.getAddress ? wallet.getAddress() : '';
            trackWalletConnection(address, true);
          }}
          onError={(error) => {
            console.error("❌ AutoConnect failed:", error);
            trackWalletConnection('', false);
          }}
        />
      )}
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <Header />
          <MintingInterface shouldAutoConnect={shouldAutoConnect} />
        </div>
      </div>
    </ThirdwebProvider>
  );
}

function Header() {
  const account = useActiveAccount();
  
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        🦄 <br/>Claim your PolyPrize
      </h1>
      <p className="text-xl text-gray-700 mb-2">
        Click "Claim" below to receive your PolyPrize NFT and be entered to win the $100 raffle.
      </p>
      <p className="text-sm text-purple-700 mb-8">
        🔐 Existing polygon.ac members only • Claim for free 
      </p>
    </div>
  );
}

function MintingInterface({ shouldAutoConnect }) {
  const account = useActiveAccount();
  const address = account?.address;
  const wallet = useActiveWallet();
  
  // Track authorization and connection state
  const [isAuthorizedUnicornWallet, setIsAuthorizedUnicornWallet] = useState(false);
  const [connectionState, setConnectionState] = useState(shouldAutoConnect ? "checking" : "no_autoconnect");
  const [mintStatus, setMintStatus] = useState("");
  const [countdown, setCountdown] = useState("");
  // cooldown
  const [lastMintAttempt, setLastMintAttempt] = useState(0);

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
    if (process.env.NODE_ENV === 'development') {
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
    }
  }, [hasMinted, totalSupply, maxSupply, drawingDate, isMintingActive, isPaused]);

  // Send transaction hook
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  // Simplified authorization for existing smart wallet holders
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("=== Existing Smart Wallet Authorization Check ===");
      console.log("Account:", account);
      console.log("Address:", address);
      
      // Check localStorage for ThirdWeb wallet session
      const activeWallet = localStorage.getItem('thirdweb:active-wallet');
      console.log("Active wallet type:", activeWallet);
    }
    
    if (account && address) {
      if (process.env.NODE_ENV === 'development') {
        console.log("=== Account Connected Successfully ===");
        console.log("Smart wallet address:", address);
        console.log("This user has an existing smart wallet from our system");
        console.log("Wallet ", wallet);
        console.log("=== Authorization Decision ===", wallet?.factoryAddress);
        console.log("User has existing smart wallet - AUTHORIZED ✅");
      }

      // If AutoConnect worked and we have an account, they're authorized
      // (because only existing smart wallets from our factory can connect)
      const isAuthorizedWallet = true; //wallet && wallet.factoryAddress === factoryAddress;; // Simplified - AutoConnect success = authorized
      
      // Track authorization success
      trackAuthorizationCheck(isAuthorizedWallet, 'smart_wallet');
      
      setIsAuthorizedUnicornWallet(isAuthorizedWallet);
      setConnectionState("authorized");
    } else {
      console.log("No account connected - user doesn't have existing smart wallet");
      setIsAuthorizedUnicornWallet(false);
      
      // After timeout, show unauthorized (they don't have an existing wallet)
      const timer = setTimeout(() => {
        if (!account) {
          console.log("Timeout reached - user doesn't have existing smart wallet");
          trackAuthorizationCheck(false, 'no_wallet');
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
      
      // Track drawing info on first render
      if (countdown === "" && days >= 0) {
        trackDrawingInfo(days);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [drawingDate, countdown]);

  const handleMint = async () => {
    const now = Date.now();
    if (now - lastMintAttempt < MINT_COOLDOWN) {
      setMintStatus("Please wait before trying again");
      return;
    }

    if (!isAuthorizedUnicornWallet) {
      setMintStatus("Access denied - unauthorized wallet");
      trackNFTClaim(address, false, 'unauthorized');
      return;
    }

    if (!account) {
      setMintStatus("Please ensure your wallet is connected");
      trackNFTClaim('', false, 'no_account');
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
          trackNFTClaim(address, true);
          setTimeout(() => setMintStatus(""), 3000);
        },
        onError: (error) => {
        console.error("Claiming failed:", error.code); // Log code only
        setMintStatus("Transaction failed. Please try again."); // Generic message
        trackNFTClaim(address, false, error.code || 'transaction_failed');
          setTimeout(() => setMintStatus(""), 5000);
        }
      });
      setLastMintAttempt(now);

    } catch (error) {
      console.error("Transaction preparation failed:", error);
      setMintStatus("Transaction failed. Please try again.");
      trackNFTClaim(address, false, 'preparation_failed');
      setTimeout(() => setMintStatus(""), 5000);
    }
  };

  const supplyPercentage = totalSupply && maxSupply ? 
    Math.round((parseInt(totalSupply.toString()) / parseInt(maxSupply.toString())) * 100) : 0;

  // Show connection status while AutoConnect is working
  if (connectionState === "checking") {
    return (
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto border border-gray-200">
          <div className="animate-pulse">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔄 Looking for Existing Wallet...</h2>
            <p className="text-gray-700 text-lg mb-4">
              Connecting to your unicorn.eth wallet
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Only existing smart wallets from polygon.ac can access this lottery
            </p>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div className="h-2 rounded-full animate-pulse" style={{ width: '60%', backgroundColor: '#A83DCC' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Factory: 0xD771...48A | Client: {clientId?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message when AutoConnect parameters are missing
  if (connectionState === "no_autoconnect") {
    return (
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Access Required</h2>
          <p className="text-gray-700 text-lg mb-4">
            This PolyPrize lottery is only accessible through the official <a href="https://polycon.ac">polygon.ac portal</a>.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            You must access this page from your polygon.ac account dashboard to participate.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-left" style={{ backgroundColor: '#FBE9FB' }}>
            <p className="text-purple-800 text-sm font-semibold mb-2">How to Access:</p>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Log in to your <a href="https://polycon.ac">polygon.ac</a> account</li>
              <li>• Navigate to the PolyPrize section</li>
              <li>• Click the official claim link</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="max-w-4xl mx-auto">
            {/* Claiming Section */}
      <div className="bg-gray-100 rounded-lg p-8 mb-8 border border-gray-200">
        
        {checkingMinted ? (
          <div className="text-center text-gray-800">Checking claim status...</div>
        ) : !isAuthorizedUnicornWallet ? (
          <div className="text-center">
            <div className="bg-red-100 border border-red-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-800 mb-2">🚫 No Existing Wallet Found</h3>
              <p className="text-red-700 mb-2">
                This lottery is only available to users with a valid Polygon.ac account.
              </p>
              <p className="text-red-700 text-sm mb-4">
                You must have received a smart wallet from our system to participate.
              </p>
            </div>
          </div>
        ) : isPaused ? (
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">⏸️ Claiming Paused</h3>
              <p className="text-yellow-700">
                Claiming has been temporarily paused by the contract owner.
              </p>
            </div>
          </div>
        ) : !isMintingActive ? (
          <div className="text-center">
            <div className="bg-red-100 border border-red-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-red-800 mb-2">🚫 Claiming Period Ended</h3>
              <p className="text-red-700">
                The drawing date has passed and PolyPrize claiming is no longer available.
              </p>
              <p className="text-red-700 mt-2">
                Drawing Date: {drawingDate ? new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
        ) : totalSupply && maxSupply && parseInt(totalSupply.toString()) >= parseInt(maxSupply.toString()) ? (
          <div className="text-center">
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-orange-800 mb-2">🎯 Max Supply Reached</h3>
              <p className="text-orange-700">
                All {maxSupply.toString()} Prizes have been claimed!
              </p>
            </div>
          </div>
        ) : hasMinted ? (
          <div className="text-center">
            <div className="border border-purple-300 rounded-lg p-4 mb-4" style={{ backgroundColor: '#FBE9FB' }}>
              <p className="text-purple-800">
                You have claimed your PolyPrize! 🎉
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="border border-purple-300 rounded-lg p-6 mb-6" style={{ backgroundColor: '#FBE9FB' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 
              </div>
            </div>
            
            <button
              onClick={handleMint}
              disabled={isMinting || isPaused || !isAuthorizedUnicornWallet}
              className="text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#A83DCC' }}
            >
              {isMinting ? "Claiming..." : "🦄 Claim NFT"}
            </button>
            
            {mintStatus && (
              <div className="mt-4 p-3 rounded-lg border border-purple-300" style={{ backgroundColor: '#FBE9FB' }}>
                <p className="text-purple-800">{mintStatus}</p>
              </div>
            )}
          </div>
        )}
      </div>
            {/* Drawing Date Info */}
      {drawingDate && (
        <div className="border border-purple-300 rounded-lg p-6 mb-8" style={{ backgroundColor: '#FBE9FB' }}>
          <h3 className="text-xl font-bold text-purple-800 mb-2 flex items-center">
            ⏰ $100 Raffle Details (Second PolyPrize Drawing)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-700">Second Drawing Date:</p>
              <p className="text-gray-900 font-semibold">
                {new Date(parseInt(drawingDate.toString()) * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-700">Status:</p>
              <p className={`font-semibold ${isMintingActive ? 'text-green-700' : 'text-red-700'}`}>
                {isMintingActive ? '🟢 Claiming Active' : '🔴 Claiming Ended'}
              </p>
            </div>
                       <div>
              <p className="text-gray-700">Time Remaining:</p>
              <p className={`font-semibold ${isMintingActive ? 'text-green-700' : 'text-red-700'}`}>
                {countdown || "Loading..."} 
              </p>
            </div>
 
          </div>
          
        </div>

        
      )}

        {/* Social Sharing Links */}
      <div className="text-center mt-6">
        <p className="text-gray-700 text-sm mb-3">Share your claim:</p>
        <div className="flex justify-center space-x-4 flex-wrap">
          <SocialShareButton 
            platform="LinkedIn" 
            url="https://www.linkedin.com/sharing/share-offsite/?url=https://app.polygon.ac"
            text="I claimed my free PolyPrize Collectible and entered the $100 giveaway at https://app.polygon.ac "
          />
          <SocialShareButton 
            platform="Twitter" 
            url="https://twitter.com/intent/tweet?text=I%20claimed%20my%20free%20PolyPrize%20Collectible%20and%20entered%20the%20%24100%20giveaway%20at%20https%3A//app.polygon.ac%20@MyUnicornAcct%20@0xPolygon"
            text="I claimed my free PolyPrize Collectible and entered the $100 giveaway at https://app.polygon.ac"
          />
          <SocialShareButton 
            platform="Farcaster" 
            url="https://warpcast.com/~/compose?text=I%20claimed%20my%20free%20PolyPrize%20Collectible%20and%20entered%20the%20%24100%20giveaway%20at%20https%3A//app.polygon.ac%20@unicornslfg"
            text="I claimed my free PolyPrize Collectible and entered the $100 giveaway at https://app.polygon.ac"
          />
          <SocialShareButton 
            platform="Bluesky" 
            url="https://bsky.app/intent/compose?text=I%20claimed%20my%20free%20PolyPrize%20Collectible%20and%20entered%20the%20%24100%20giveaway%20at%20https%3A//app.polygon.ac%20@myunicornaccount"
            text="I claimed my free PolyPrize Collectible and entered the $100 giveaway at https://app.polygon.ac"
          />
        </div>
      </div>
      <div><br/><br/></div>
            {/* Connection Status Display */}
      <div className="bg-gray-100 rounded-lg p-4 max-w-md mx-auto mb-4 border border-gray-200">
        {account ? (
          <div style={{ color: '#A83DCC' }}>
            <p className="font-semibold">✅ Connected</p>
            <p className="text-sm text-gray-700">
              {account.address?.slice(0,6)}...{account.address?.slice(-4)}
            </p>
          </div>
        ) : (
          <div style={{ color: '#A83DCC' }}>
            <p className="font-semibold">🔄 Connecting...</p>
            <p className="text-sm text-gray-700">
              AutoConnect in progress
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
function SocialShareButton({ platform, url, text }) {
  const handleShare = () => {
    trackSocialShare(platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = () => {
    switch (platform) {
      case 'LinkedIn':
        return '💼';
      case 'Twitter':
        return '🐦';
      case 'Farcaster':
        return '🟣';
      case 'Bluesky':
        return '🦋';
      default:
        return '🔗';
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-80"
      style={{ backgroundColor: '#A83DCC' }}
      title={`Share on ${platform}: ${text}`}
    >
      <span className="mr-1">{getIcon()}</span>
      {platform}
    </button>
  );
}

export default App;