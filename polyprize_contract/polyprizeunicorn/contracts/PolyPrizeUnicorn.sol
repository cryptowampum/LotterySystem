// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Import thirdweb's ERC721 base contract
import "thirdweb/lib/ERC721Base.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Coded lovingly by @cryptowampum and Claude AI or unicorn.eth

contract PolyPrizeUnicorn is ERC721Base, Ownable, Pausable {
    using Strings for uint256;
    using Strings for address;
    uint256 public constant MAX_SUPPLY = 10000;

    uint256 public drawingDate;
    uint256 private _nextTokenId = 1;
    string private baseImageURI;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => address) public minters;

    event DrawingDateUpdated(uint256 oldDate, uint256 newDate);
    event BaseURIUpdated(string oldURI, string newURI);

    event Minted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory _baseImageURI,   // The IPFS or HTTPS image URI
        uint256 _drawingDate           // Unix timestamp (e.g. block.timestamp + 7 days)
    )
        ERC721Base("Unicorn.eth PolyPrize Collection", "UNICORN")
    {
        require(bytes(_baseImageURI).length > 0, "Base URI cannot be empty");
        require(_drawingDate > block.timestamp, "Drawing date must be in future");

        baseImageURI = _baseImageURI;
        drawingDate = _drawingDate;
    }

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
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
    }

        function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // SOULBOUND: Block all transfers except burning (to 0x0)
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId, 
        uint256 batchSize
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers disabled");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // SOULBOUND: Block all approvals
    function approve(address, uint256) public pure override {
        revert("Soulbound: approvals disabled");
    }
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approvals disabled");
    }

    // On-chain metadata: includes address that minted this NFT
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        address minter = minters[tokenId];
        string memory walletStr = Strings.toHexString(uint160(minter), 20);
        return string(abi.encodePacked(
            "data:application/json;utf8,",
            "{",
                '"name":"Unicorn.eth PolyPrize #', tokenId.toString(), '",',
                '"description":"Soulbound NFT, minted to wallet ', walletStr, ' for the PolyPrize drawing.",',
                '"image":"', baseImageURI, '",',
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
        return block.timestamp < drawingDate;
    }
    function timeUntilDrawing() external view returns (uint256) {
        return block.timestamp < drawingDate ? drawingDate - block.timestamp : 0;
    }

    function withdrawETH() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "ETH withdrawal failed");
    }

    function updateBaseURI(string memory newBaseURI) external onlyOwner {
        require(bytes(newBaseURI).length > 0, "Base URI cannot be empty");
        string memory oldURI = baseImageURI;
        baseImageURI = newBaseURI;
        emit BaseURIUpdated(oldURI, newBaseURI);
    }


}