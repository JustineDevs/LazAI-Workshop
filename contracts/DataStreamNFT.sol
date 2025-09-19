// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DataStreamNFT
 * @dev NFT contract for data monetization with query-based micropayments
 * @author DataStreamNFT Team
 */
contract DataStreamNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // DAT token contract for payments
    IERC20 public datToken;

    // DataStream structure
    struct DataStream {
        string ipfsHash;
        string metadataHash;
        uint256 queryPrice;
        address creator;
        uint256 totalQueries;
        uint256 totalEarnings;
        bool isActive;
        uint256 createdAt;
    }

    // Mapping from token ID to DataStream
    mapping(uint256 => DataStream) public dataStreams;

    // Mapping from creator to their token IDs
    mapping(address => uint256[]) public creatorTokens;

    // Query events
    event DataStreamCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        uint256 queryPrice
    );

    event QueryExecuted(
        uint256 indexed tokenId,
        address indexed querier,
        uint256 paymentAmount,
        uint256 totalQueries
    );

    event QueryPriceUpdated(
        uint256 indexed tokenId,
        uint256 newPrice
    );

    event DataStreamDeactivated(
        uint256 indexed tokenId
    );

    // Modifiers
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    modifier activeDataStream(uint256 tokenId) {
        require(dataStreams[tokenId].isActive, "DataStream inactive");
        _;
    }

    /**
     * @dev Constructor
     * @param _datToken Address of the DAT token contract
     */
    constructor(address _datToken) ERC721("DataStreamNFT", "DSNFT") {
        require(_datToken != address(0), "Invalid DAT token address");
        datToken = IERC20(_datToken);
    }

    /**
     * @dev Mint a new DataStream NFT
     * @param ipfsHash IPFS hash of the data
     * @param metadataHash IPFS hash of the metadata
     * @param queryPrice Price per query in DAT tokens
     * @param to Address to mint the NFT to
     */
    function mintDataStream(
        string memory ipfsHash,
        string memory metadataHash,
        uint256 queryPrice,
        address to
    ) external onlyOwner returns (uint256) {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        require(queryPrice > 0, "Query price must be positive");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        dataStreams[tokenId] = DataStream({
            ipfsHash: ipfsHash,
            metadataHash: metadataHash,
            queryPrice: queryPrice,
            creator: to,
            totalQueries: 0,
            totalEarnings: 0,
            isActive: true,
            createdAt: block.timestamp
        });

        creatorTokens[to].push(tokenId);
        _mint(to, tokenId);

        emit DataStreamCreated(tokenId, to, ipfsHash, queryPrice);
        return tokenId;
    }

    /**
     * @dev Execute a query on a DataStream
     * @param tokenId Token ID of the DataStream
     */
    function executeQuery(uint256 tokenId) 
        external 
        nonReentrant 
        validTokenId(tokenId) 
        activeDataStream(tokenId) 
    {
        DataStream storage dataStream = dataStreams[tokenId];
        uint256 paymentAmount = dataStream.queryPrice;

        // Transfer payment from querier to contract
        require(
            datToken.transferFrom(msg.sender, address(this), paymentAmount),
            "Payment transfer failed"
        );

        // Update DataStream statistics
        dataStream.totalQueries += 1;
        dataStream.totalEarnings += paymentAmount;

        // Transfer payment to creator
        require(
            datToken.transfer(dataStream.creator, paymentAmount),
            "Creator payment failed"
        );

        emit QueryExecuted(tokenId, msg.sender, paymentAmount, dataStream.totalQueries);
    }

    /**
     * @dev Update query price for a DataStream
     * @param tokenId Token ID of the DataStream
     * @param newPrice New query price in DAT tokens
     */
    function updateQueryPrice(uint256 tokenId, uint256 newPrice)
        external
        onlyTokenOwner(tokenId)
        validTokenId(tokenId)
    {
        require(newPrice > 0, "Query price must be positive");
        
        dataStreams[tokenId].queryPrice = newPrice;
        emit QueryPriceUpdated(tokenId, newPrice);
    }

    /**
     * @dev Deactivate a DataStream
     * @param tokenId Token ID of the DataStream
     */
    function deactivateDataStream(uint256 tokenId)
        external
        onlyTokenOwner(tokenId)
        validTokenId(tokenId)
    {
        dataStreams[tokenId].isActive = false;
        emit DataStreamDeactivated(tokenId);
    }

    /**
     * @dev Get DataStream information
     * @param tokenId Token ID of the DataStream
     * @return DataStream struct
     */
    function getDataStream(uint256 tokenId)
        external
        view
        validTokenId(tokenId)
        returns (DataStream memory)
    {
        return dataStreams[tokenId];
    }

    /**
     * @dev Get creator's token IDs
     * @param creator Address of the creator
     * @return Array of token IDs
     */
    function getCreatorTokens(address creator)
        external
        view
        returns (uint256[] memory)
    {
        return creatorTokens[creator];
    }

    /**
     * @dev Get total number of tokens minted
     * @return Total token count
     */
    function getTotalTokens() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Override tokenURI to return metadata
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        validTokenId(tokenId)
        returns (string memory)
    {
        return string(abi.encodePacked("ipfs://", dataStreams[tokenId].metadataHash));
    }
}
