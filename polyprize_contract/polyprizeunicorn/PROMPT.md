🦄 POLYPRIZE UNICORN NFT CONTRACT - CONTINUATION PROMPT
I'm working on a soulbound NFT smart contract called "PolyPrizeUnicorn" for a drawing/lottery system. Here's where we are:
📋 PROJECT CONTEXT:

Contract Type: Soulbound ERC721 NFT (transfers disabled, burns allowed)
Purpose: Lottery entry tokens - one mint per wallet, drawing closes Sept 28th midnight MDT
Dual Media: Supports both static image + MP4 video via image and animation_url
Supply Cap: 10,000 maximum tokens
Platform: Deploying with ThirdWeb CLI, needs ThirdWeb React SDK compatibility

🎯 KEY SPECIFICATIONS:

Drawing Date: 1759039200 (Sept 28th, 2025 midnight Mountain Daylight Time)
Soulbound Rules: Block ALL transfers except burns to address(0), disable all approvals
On-chain Metadata: JSON with wallet address, drawing date, image + animation_url
Admin Functions: Pause/unpause, extend drawing date only, update media URIs, withdraw ETH
Single Mint: One token per wallet address maximum

🔧 TECHNICAL REQUIREMENTS:

OpenZeppelin Dependencies: ERC721, ERC721Enumerable, Ownable, Strings
Manual Pausable: Custom implementation to avoid OpenZeppelin Pausable.sol dependency issues
OpenZeppelin v5 Compatible: Using _update() instead of _beforeTokenTransfer()
ThirdWeb Deployment: Must compile with npx thirdweb deploy

🛡️ SECURITY STATUS:
We've completed multiple security audits. Latest version uses:

Battle-tested OpenZeppelin contracts for core functionality
Manual pausable implementation (identical to OpenZeppelin's)
Proper CEI pattern in mint function for reentrancy protection
Monotonic token ID counter to prevent collisions
Comprehensive input validation and access controls

📊 CURRENT VERSION:
Using OpenZeppelin + Manual Pause approach for maximum security while avoiding dependency conflicts. Contract inherits from ERC721, ERC721Enumerable, Ownable with custom pausable implementation.
🚨 RECENT CHALLENGES:

OpenZeppelin dependency installation issues in ThirdWeb environment
OpenZeppelin v5 compatibility requiring specific override patterns
Need to specify overridden contracts for approve() and setApprovalForAll()
Using _update() hook instead of deprecated _beforeTokenTransfer()

🎨 DEPLOYMENT PARAMETERS:
javascript_baseImageURI: "ipfs://QmYourStaticImageHash..."      // Static image (PNG/JPG)
_baseAnimationURI: "ipfs://QmYourVideoHash..."        // MP4 video  
_drawingDate: 1759039200                              // Sept 28th midnight MDT
🔄 WHAT I NEED:
Please help me with [specific issue/question]. The contract should maintain maximum security using OpenZeppelin contracts while being deployable via ThirdWeb CLI and compatible with ThirdWeb's React SDK for frontend integration.