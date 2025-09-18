// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Use OpenZeppelin for core security features, manual pause implementation
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Coded lovingly by @cryptowampum and Claude AI
contract PolyPrizeUnicorn is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;
    
    uint256 public constant MAX_SUPPLY = 10000;

    // Manual Pausable Implementation (avoiding problematic import)
    bool private _paused = false;

    uint256 public drawingDate;
    uint256 private _nextTokenId = 1;
    string private baseImageURI;      // Static image (PNG/JPG)
    string private baseAnimationURI;  // MP4 video
    mapping(address => bool) public hasMinted;
    mapping(uint256 => address) public minters;

    // Events
    event DrawingDateUpdated(uint256 oldDate, uint256 newDate);
    event BaseImageURIUpdated(string oldURI, string newURI);
    event BaseAnimationURIUpdated(string oldURI, string newURI);
    event Minted(address indexed to, uint256 indexed tokenId);
    
    // Manual Pausable Events
    event Paused(address account);
    event Unpaused(address account);

    constructor(
        string memory _baseImageURI,      // The IPFS static image URI
        string memory _baseAnimationURI,  // The IPFS MP4 video URI
        uint256 _drawingDate              // Unix timestamp
    )
        ERC721("Unicorn.eth PolyPrize Collection", "UUPC")
        Ownable(msg.sender)  // Pass initial owner to Ownable constructor
    {
        require(bytes(_baseImageURI).length > 0, "Base image URI cannot be empty");
        require(bytes(_baseAnimationURI).length > 0, "Base animation URI cannot be empty");
        require(_drawingDate > block.timestamp, "Drawing date must be in future");

        baseImageURI = _baseImageURI;
        baseAnimationURI = _baseAnimationURI;
        drawingDate = _drawingDate;
    }

    // Manual Pausable Implementation
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() public onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    // Helper function to check if token exists (compatible across OpenZeppelin versions)
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < _nextTokenId;
    }

    // Main contract modifiers and functions
    modifier beforeDrawing() {
        require(block.timestamp < drawingDate, "Minting period is over");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        _;
    }

    function mint() external beforeDrawing whenNotPaused {
        require(!hasMinted[msg.sender], "Already minted");
        hasMinted[msg.sender] = true;
        uint256 tokenId = _nextTokenId++;
        minters[tokenId] = msg.sender;
        emit Minted(msg.sender, tokenId);
        _safeMint(msg.sender, tokenId);
    }

    // Required overrides for OpenZeppelin v5 compatibility
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        // SOULBOUND: Block transfers except mints and burns
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers disabled");
        }
        
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._increaseBalance(account, value);
    }

    // SOULBOUND: Block all approvals (specify both overridden contracts)
    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals disabled");
    }
    
    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals disabled");
    }

    // On-chain metadata: includes BOTH image and animation_url
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_tokenExists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) != address(0), "Token was burned or never minted");
        
        address minter = minters[tokenId];
        string memory walletStr = Strings.toHexString(uint160(minter), 20);
        return string(abi.encodePacked(
            "data:application/json;utf8,",
            "{",
                '"name":"Unicorn.eth PolyPrize #', tokenId.toString(), '",',
                '"description":"Soulbound NFT, minted to wallet ', walletStr, ' for the PolyPrize drawing.",',
                '"image":"', baseImageURI, '",',                    // Static image
                '"animation_url":"', baseAnimationURI, '",',         // MP4 video
                '"attributes":[',
                    '{ "trait_type": "Wallet", "value": "', walletStr, '" },',
                    '{ "trait_type": "Drawing Date", "display_type": "date", "value": ', drawingDate.toString(), ' }',
                ']',
            "}"
        ));
    }

    // Drawing Date management (can only extend the window)
    function setDrawingDate(uint256 newDate) external onlyOwner {
        require(newDate > drawingDate, "Can only extend drawing date");
        require(newDate > block.timestamp, "Drawing date must be in future");
        
        uint256 oldDate = drawingDate;
        drawingDate = newDate;
        emit DrawingDateUpdated(oldDate, newDate);
    }

    // Utility functions
    function isMintingActive() external view returns (bool) {
        return block.timestamp < drawingDate && !_paused;
    }
    function timeUntilDrawing() external view returns (uint256) {
        return block.timestamp < drawingDate ? drawingDate - block.timestamp : 0;
    }

    function withdrawETH() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    // Update static image URI
    function updateBaseImageURI(string memory newBaseImageURI) external onlyOwner {
        require(bytes(newBaseImageURI).length > 0, "Base image URI cannot be empty");
        string memory oldURI = baseImageURI;
        baseImageURI = newBaseImageURI;
        emit BaseImageURIUpdated(oldURI, newBaseImageURI);
    }
    
    // Update animation/video URI
    function updateBaseAnimationURI(string memory newBaseAnimationURI) external onlyOwner {
        require(bytes(newBaseAnimationURI).length > 0, "Base animation URI cannot be empty");
        string memory oldURI = baseAnimationURI;
        baseAnimationURI = newBaseAnimationURI;
        emit BaseAnimationURIUpdated(oldURI, newBaseAnimationURI);
    }

    // View functions to check current URIs
    function getBaseImageURI() external view returns (string memory) {
        return baseImageURI;
    }
    
    function getBaseAnimationURI() external view returns (string memory) {
        return baseAnimationURI;
    }

    // Required override for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}