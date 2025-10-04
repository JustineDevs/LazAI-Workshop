// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title DataStreamNFTUpgradeable
 * @dev Upgradable NFT contract for data monetization with query-based micropayments
 * @author DataStreamNFT Team
 */
contract DataStreamNFTUpgradeable is 
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // Events
    event DataNFTMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 queryPrice, uint256 timestamp);
    event QueryPaid(uint256 indexed tokenId, address indexed payer, uint256 amount, string query, uint256 timestamp);
    event QueryPriceUpdated(uint256 indexed tokenId, uint256 newPrice, uint256 timestamp);
    event PlatformFeeUpdated(uint256 newFeeBps, uint256 timestamp);
    event TreasuryUpdated(address newTreasury, uint256 timestamp);
    event DataNFTDeactivated(uint256 indexed tokenId, uint256 timestamp);
    event DataNFTReactivated(uint256 indexed tokenId, uint256 timestamp);

    struct DataNFT {
        address creator;
        uint256 queryPrice; // price in wei for one AI query on this data
        uint256 totalQueries;
        uint256 totalEarned;
        uint256 createdAt;
        bool isActive;
        string dataClass; // model, reference, asset, etc.
        string dataValue; // low, medium, high
        mapping(string => uint256) queryHistory; // query type to count
    }

    // State variables
    uint256 private _tokenIdCounter;
    uint256 public platformFeeBps;
    address public platformTreasury;
    uint256 public totalPlatformFees;
    uint256 public totalCreatorEarnings;
    
    // Mappings
    mapping(uint256 => DataNFT) public dataNFTs;
    mapping(address => uint256[]) public creatorTokens;
    mapping(string => uint256) public queryTypeStats;
    mapping(address => uint256) public creatorEarnings;
    
    // Query analytics
    struct QueryAnalytics {
        uint256 totalQueries;
        uint256 totalVolume;
        uint256 averageQueryPrice;
        uint256 lastQueryTime;
    }
    
    mapping(uint256 => QueryAnalytics) public tokenAnalytics;
    mapping(address => QueryAnalytics) public creatorAnalytics;

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _platformTreasury, uint256 _platformFeeBps) public initializer {
        __ERC721_init("DataStreamNFT", "DAT");
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        require(_platformTreasury != address(0), "Invalid treasury");
        require(_platformFeeBps <= 1000, "Fee cannot exceed 10%");
        
        platformTreasury = _platformTreasury;
        platformFeeBps = _platformFeeBps;
    }

    // Mint a new Data NFT with enhanced metadata
    function mintDataNFT(
        string memory tokenURI,
        uint256 queryPriceInWei,
        string memory dataClass,
        string memory dataValue
    ) external nonReentrant validDataClass(dataClass) validDataValue(dataValue) returns (uint256) {
        require(queryPriceInWei > 0, "Query price must be positive");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        DataNFT storage nft = dataNFTs[newTokenId];
        nft.creator = msg.sender;
        nft.queryPrice = queryPriceInWei;
        nft.totalQueries = 0;
        nft.totalEarned = 0;
        nft.createdAt = block.timestamp;
        nft.isActive = true;
        nft.dataClass = dataClass;
        nft.dataValue = dataValue;

        creatorTokens[msg.sender].push(newTokenId);

        emit DataNFTMinted(newTokenId, msg.sender, tokenURI, queryPriceInWei, block.timestamp);
        return newTokenId;
    }

    // Enhanced query payment with analytics
    function payForQuery(uint256 tokenId, string memory query) external payable nonReentrant {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        DataNFT storage nft = dataNFTs[tokenId];
        require(nft.isActive, "NFT is not active");
        require(msg.value >= nft.queryPrice, "Insufficient payment");
        require(bytes(query).length > 0, "Query cannot be empty");

        uint256 platformAmount = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformAmount;

        // Transfer platform fee
        (bool sentPlatform, ) = platformTreasury.call{value: platformAmount}("");
        require(sentPlatform, "Platform fee transfer failed");

        // Transfer remainder to creator
        (bool sentCreator, ) = nft.creator.call{value: creatorAmount}("");
        require(sentCreator, "Creator payment failed");

        // Update statistics
        nft.totalQueries++;
        nft.totalQueries++;
        nft.totalEarned += creatorAmount;
        nft.queryHistory[query]++;
        
        creatorEarnings[nft.creator] += creatorAmount;
        totalPlatformFees += platformAmount;
        totalCreatorEarnings += creatorAmount;
        
        // Update analytics
        _updateQueryAnalytics(tokenId, nft.creator, msg.value, query);

        emit QueryPaid(tokenId, msg.sender, msg.value, query, block.timestamp);
    }

    // Update query price with validation
    function updateQueryPrice(uint256 tokenId, uint256 newPriceInWei) external onlyTokenOwner(tokenId) {
        require(newPriceInWei > 0, "Price must be positive");
        
        DataNFT storage nft = dataNFTs[tokenId];
        nft.queryPrice = newPriceInWei;
        
        emit QueryPriceUpdated(tokenId, newPriceInWei, block.timestamp);
    }

    // Toggle NFT active status
    function toggleActiveStatus(uint256 tokenId) external onlyTokenOwner(tokenId) {
        DataNFT storage nft = dataNFTs[tokenId];
        nft.isActive = !nft.isActive;
        
        if (nft.isActive) {
            emit DataNFTReactivated(tokenId, block.timestamp);
        } else {
            emit DataNFTDeactivated(tokenId, block.timestamp);
        }
    }

    // Update data class
    function updateDataClass(uint256 tokenId, string memory newDataClass) 
        external 
        onlyTokenOwner(tokenId) 
        validDataClass(newDataClass) 
    {
        dataNFTs[tokenId].dataClass = newDataClass;
    }

    // Update data value
    function updateDataValue(uint256 tokenId, string memory newDataValue) 
        external 
        onlyTokenOwner(tokenId) 
        validDataValue(newDataValue) 
    {
        dataNFTs[tokenId].dataValue = newDataValue;
    }

    // Get comprehensive NFT data
    function getDataNFT(uint256 tokenId) external view returns (
        address creator,
        uint256 queryPrice,
        uint256 totalQueries,
        uint256 totalEarned,
        uint256 createdAt,
        bool isActive,
        string memory dataClass,
        string memory dataValue,
        string memory tokenURI
    ) {
        DataNFT storage nft = dataNFTs[tokenId];
        return (
            nft.creator,
            nft.queryPrice,
            nft.totalQueries,
            nft.totalEarned,
            nft.createdAt,
            nft.isActive,
            nft.dataClass,
            nft.dataValue,
            tokenURI(tokenId)
        );
    }

    // Get creator's tokens
    function getCreatorTokens(address creator) external view returns (uint256[] memory) {
        return creatorTokens[creator];
    }

    // Get creator earnings
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }

    // Get platform statistics
    function getPlatformStats() external view returns (
        uint256 totalTokens,
        uint256 totalQueries,
        uint256 totalPlatformFeesCollected,
        uint256 totalCreatorEarningsPaid
    ) {
        return (
            _tokenIdCounter,
            _getTotalQueries(),
            totalPlatformFees,
            totalCreatorEarnings
        );
    }

    // Get token analytics
    function getTokenAnalytics(uint256 tokenId) external view returns (
        uint256 totalQueries,
        uint256 totalVolume,
        uint256 averageQueryPrice,
        uint256 lastQueryTime
    ) {
        QueryAnalytics memory analytics = tokenAnalytics[tokenId];
        return (
            analytics.totalQueries,
            analytics.totalVolume,
            analytics.averageQueryPrice,
            analytics.lastQueryTime
        );
    }

    // Get creator analytics
    function getCreatorAnalytics(address creator) external view returns (
        uint256 totalQueries,
        uint256 totalVolume,
        uint256 averageQueryPrice,
        uint256 lastQueryTime
    ) {
        QueryAnalytics memory analytics = creatorAnalytics[creator];
        return (
            analytics.totalQueries,
            analytics.totalVolume,
            analytics.averageQueryPrice,
            analytics.lastQueryTime
        );
    }

    // Admin functions
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps, block.timestamp);
    }

    function updatePlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        platformTreasury = newTreasury;
        emit TreasuryUpdated(newTreasury, block.timestamp);
    }

    // Internal functions
    function _updateQueryAnalytics(uint256 tokenId, address creator, uint256 amount, string memory query) internal {
        // Update token analytics
        QueryAnalytics storage tokenAnalytics_ = tokenAnalytics[tokenId];
        tokenAnalytics_.totalQueries++;
        tokenAnalytics_.totalVolume += amount;
        tokenAnalytics_.averageQueryPrice = tokenAnalytics_.totalVolume / tokenAnalytics_.totalQueries;
        tokenAnalytics_.lastQueryTime = block.timestamp;

        // Update creator analytics
        QueryAnalytics storage creatorAnalytics_ = creatorAnalytics[creator];
        creatorAnalytics_.totalQueries++;
        creatorAnalytics_.totalVolume += amount;
        creatorAnalytics_.averageQueryPrice = creatorAnalytics_.totalVolume / creatorAnalytics_.totalQueries;
        creatorAnalytics_.lastQueryTime = block.timestamp;

        // Update query type stats
        queryTypeStats[query]++;
    }

    function _getTotalQueries() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            total += dataNFTs[i].totalQueries;
        }
        return total;
    }

    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Override _baseURI if needed
    function _baseURI() internal view override returns (string memory) {
        return "ipfs://";
    }

    // Security: prevent accidental ETH transfers
    receive() external payable {
        revert("Direct ETH deposits not allowed");
    }

    fallback() external payable {
        revert("Fallback called");
    }
}
