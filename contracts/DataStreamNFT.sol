// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DataStreamNFT
 * @dev NFT contract for data monetization with query-based micropayments using ETH
 * @author DataStreamNFT Team
 */
contract DataStreamNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Events
    event DataNFTMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 queryPrice);
    event QueryPaid(uint256 indexed tokenId, address indexed payer, uint256 amount);
    event QueryPriceUpdated(uint256 indexed tokenId, uint256 newPrice);

    struct DataNFT {
        address creator;
        uint256 queryPrice; // price in wei for one AI query on this data
        uint256 totalQueries;
        uint256 totalEarned;
    }

    // Mapping from tokenId to DataNFT details
    mapping(uint256 => DataNFT) public dataNFTs;

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Platform fee in basis points (bps). E.g. 250 = 2.5%
    uint256 public platformFeeBps = 250;
    address public platformTreasury;

    constructor(address _platformTreasury) ERC721("DataStreamNFT", "DAT") Ownable(msg.sender) {
        require(_platformTreasury != address(0), "Invalid treasury");
        platformTreasury = _platformTreasury;
    }

    // Mint a new Data NFT with given metadata URI and query price
    function mintDataNFT(string memory tokenURI, uint256 queryPriceInWei) external nonReentrant returns (uint256) {
        require(queryPriceInWei > 0, "Query price must be positive");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        dataNFTs[newTokenId] = DataNFT({
            creator: msg.sender,
            queryPrice: queryPriceInWei,
            totalQueries: 0,
            totalEarned: 0
        });

        emit DataNFTMinted(newTokenId, msg.sender, tokenURI, queryPriceInWei);
        return newTokenId;
    }

    // Pay to query data NFT; triggers payment distribution
    function payForQuery(uint256 tokenId) external payable nonReentrant {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        DataNFT storage nft = dataNFTs[tokenId];

        require(msg.value >= nft.queryPrice, "Insufficient payment");

        uint256 platformAmount = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformAmount;

        // Transfer platform fee
        (bool sentPlatform, ) = platformTreasury.call{value: platformAmount}("");
        require(sentPlatform, "Platform fee transfer failed");

        // Transfer remainder to creator
        (bool sentCreator, ) = nft.creator.call{value: creatorAmount}("");
        require(sentCreator, "Creator payment failed");

        nft.totalQueries++;
        nft.totalEarned += creatorAmount;

        emit QueryPaid(tokenId, msg.sender, msg.value);
    }

    // Creator can update the query price of their NFT
    function updateQueryPrice(uint256 tokenId, uint256 newPriceInWei) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        DataNFT storage nft = dataNFTs[tokenId];
        require(msg.sender == nft.creator, "Only creator can update price");
        require(newPriceInWei > 0, "Price must be positive");

        nft.queryPrice = newPriceInWei;
        emit QueryPriceUpdated(tokenId, newPriceInWei);
    }

    // Override _baseURI if needed to provide base metadata URI
    function _baseURI() internal view override returns (string memory) {
        return "ipfs://"; // Typically pointing to IPFS gateway or similar
    }

    // Withdraw any stuck ETH by owner (platform)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "Withdraw failed");
    }

    // Security: prevent accidental ETH transfers
    receive() external payable {
        revert("Direct ETH deposits not allowed");
    }

    fallback() external payable {
        revert("Fallback called");
    }
}
