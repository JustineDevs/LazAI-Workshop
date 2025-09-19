// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DataStreamDAT
 * @dev Enhanced DataStreamNFT contract with LazAI DAT (Data Anchoring Token) integration
 * This contract combines the DataStreamNFT functionality with LazAI's data anchoring capabilities
 */
contract DataStreamDAT is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // Events
    event DataDATMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 queryPrice, string fileId, string dataClass, string dataValue);
    event QueryPaid(uint256 indexed tokenId, address indexed querier, uint256 amount, string query);
    event DataClassUpdated(uint256 indexed tokenId, string newClass);
    event DataValueUpdated(uint256 indexed tokenId, string newValue);
    event FileIdUpdated(uint256 indexed tokenId, string newFileId);
    
    // Struct for Data Anchoring Token information
    struct DataAnchoringToken {
        address creator;           // Creator of the data
        uint256 queryPrice;        // Price per query in wei
        uint256 totalQueries;      // Total number of queries made
        uint256 totalEarned;       // Total amount earned by creator
        string fileId;             // LazAI file ID for encrypted data
        string dataClass;          // Data classification (model, reference, asset, etc.)
        string dataValue;          // Data value assessment (low, medium, high)
        uint256 createdAt;         // Timestamp when DAT was created
        bool isActive;             // Whether the DAT is active for queries
    }
    
    // State variables
    uint256 private _tokenIdCounter;
    uint256 public platformFeeBps = 250; // 2.5% platform fee
    address public platformTreasury;
    
    // Mappings
    mapping(uint256 => DataAnchoringToken) public dataDATs;
    mapping(string => uint256) public fileIdToTokenId; // Track file ID to token ID mapping
    mapping(address => uint256[]) public creatorTokens; // Track tokens by creator
    
    // Modifiers
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }
    
    modifier validDataClass(string memory dataClass) {
        require(bytes(dataClass).length > 0, "Data class cannot be empty");
        _;
    }
    
    modifier validDataValue(string memory dataValue) {
        require(bytes(dataValue).length > 0, "Data value cannot be empty");
        _;
    }
    
    constructor(address _platformTreasury) ERC721("DataStreamDAT", "DAT") Ownable(msg.sender) {
        require(_platformTreasury != address(0), "Invalid treasury");
        platformTreasury = _platformTreasury;
    }
    
    /**
     * @dev Mint a new Data Anchoring Token with LazAI integration
     * @param tokenURI IPFS URI containing metadata
     * @param queryPriceInWei Price per query in wei
     * @param fileId LazAI file ID for encrypted data
     * @param dataClass Classification of the data (model, reference, asset, etc.)
     * @param dataValue Value assessment of the data (low, medium, high)
     */
    function mintDataDAT(
        string memory tokenURI,
        uint256 queryPriceInWei,
        string memory fileId,
        string memory dataClass,
        string memory dataValue
    ) external nonReentrant validDataClass(dataClass) validDataValue(dataValue) returns (uint256) {
        require(queryPriceInWei > 0, "Query price must be positive");
        require(bytes(fileId).length > 0, "File ID cannot be empty");
        require(fileIdToTokenId[fileId] == 0, "File ID already exists");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        dataDATs[newTokenId] = DataAnchoringToken({
            creator: msg.sender,
            queryPrice: queryPriceInWei,
            totalQueries: 0,
            totalEarned: 0,
            fileId: fileId,
            dataClass: dataClass,
            dataValue: dataValue,
            createdAt: block.timestamp,
            isActive: true
        });
        
        fileIdToTokenId[fileId] = newTokenId;
        creatorTokens[msg.sender].push(newTokenId);
        
        emit DataDATMinted(newTokenId, msg.sender, tokenURI, queryPriceInWei, fileId, dataClass, dataValue);
        return newTokenId;
    }
    
    /**
     * @dev Pay for a query on a specific DAT
     * @param tokenId ID of the DAT to query
     * @param query The query string for tracking purposes
     */
    function payForQuery(uint256 tokenId, string memory query) external payable nonReentrant {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        DataAnchoringToken storage dat = dataDATs[tokenId];
        require(dat.isActive, "DAT is not active");
        require(msg.value >= dat.queryPrice, "Insufficient payment");
        require(bytes(query).length > 0, "Query cannot be empty");
        
        // Calculate platform fee and creator payment
        uint256 platformAmount = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformAmount;
        
        // Transfer platform fee
        (bool sentPlatform, ) = platformTreasury.call{value: platformAmount}("");
        require(sentPlatform, "Platform fee transfer failed");
        
        // Transfer creator payment
        (bool sentCreator, ) = dat.creator.call{value: creatorAmount}("");
        require(sentCreator, "Creator payment failed");
        
        // Update DAT statistics
        dat.totalQueries++;
        dat.totalEarned += creatorAmount;
        
        emit QueryPaid(tokenId, msg.sender, msg.value, query);
    }
    
    /**
     * @dev Update the data class for a DAT (only by owner)
     * @param tokenId ID of the DAT
     * @param newDataClass New data class
     */
    function updateDataClass(uint256 tokenId, string memory newDataClass) 
        external 
        onlyTokenOwner(tokenId) 
        validDataClass(newDataClass) 
    {
        dataDATs[tokenId].dataClass = newDataClass;
        emit DataClassUpdated(tokenId, newDataClass);
    }
    
    /**
     * @dev Update the data value for a DAT (only by owner)
     * @param tokenId ID of the DAT
     * @param newDataValue New data value
     */
    function updateDataValue(uint256 tokenId, string memory newDataValue) 
        external 
        onlyTokenOwner(tokenId) 
        validDataValue(newDataValue) 
    {
        dataDATs[tokenId].dataValue = newDataValue;
        emit DataValueUpdated(tokenId, newDataValue);
    }
    
    /**
     * @dev Update the file ID for a DAT (only by owner)
     * @param tokenId ID of the DAT
     * @param newFileId New file ID
     */
    function updateFileId(uint256 tokenId, string memory newFileId) 
        external 
        onlyTokenOwner(tokenId) 
    {
        require(bytes(newFileId).length > 0, "File ID cannot be empty");
        require(fileIdToTokenId[newFileId] == 0 || fileIdToTokenId[newFileId] == tokenId, "File ID already exists");
        
        // Update file ID mapping
        string memory oldFileId = dataDATs[tokenId].fileId;
        fileIdToTokenId[oldFileId] = 0;
        fileIdToTokenId[newFileId] = tokenId;
        
        dataDATs[tokenId].fileId = newFileId;
        emit FileIdUpdated(tokenId, newFileId);
    }
    
    /**
     * @dev Toggle the active status of a DAT (only by owner)
     * @param tokenId ID of the DAT
     */
    function toggleActiveStatus(uint256 tokenId) external onlyTokenOwner(tokenId) {
        dataDATs[tokenId].isActive = !dataDATs[tokenId].isActive;
    }
    
    /**
     * @dev Get DAT information by file ID
     * @param fileId LazAI file ID
     * @return tokenId Associated token ID
     * @return dat Data Anchoring Token information
     */
    function getDATByFileId(string memory fileId) external view returns (uint256 tokenId, DataAnchoringToken memory dat) {
        tokenId = fileIdToTokenId[fileId];
        require(tokenId != 0, "File ID not found");
        dat = dataDATs[tokenId];
    }
    
    /**
     * @dev Get all tokens created by an address
     * @param creator Creator address
     * @return Array of token IDs
     */
    function getCreatorTokens(address creator) external view returns (uint256[] memory) {
        return creatorTokens[creator];
    }
    
    /**
     * @dev Get DAT statistics
     * @param tokenId ID of the DAT
     * @return totalQueries Total number of queries
     * @return totalEarned Total amount earned
     * @return isActive Whether the DAT is active
     */
    function getDATStats(uint256 tokenId) external view returns (uint256 totalQueries, uint256 totalEarned, bool isActive) {
        DataAnchoringToken memory dat = dataDATs[tokenId];
        return (dat.totalQueries, dat.totalEarned, dat.isActive);
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = newFeeBps;
    }
    
    /**
     * @dev Update platform treasury (only owner)
     * @param newTreasury New treasury address
     */
    function updatePlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        platformTreasury = newTreasury;
    }
    
    /**
     * @dev Get total number of DATs minted
     * @return Total count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Check if a file ID exists
     * @param fileId File ID to check
     * @return True if exists
     */
    function fileIdExists(string memory fileId) external view returns (bool) {
        return fileIdToTokenId[fileId] != 0;
    }
}
