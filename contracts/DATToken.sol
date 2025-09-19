// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DAT Token
 * @dev ERC20 token for DataStreamNFT platform payments
 * @author DataStreamNFT Team
 */
contract DATToken is ERC20, ERC20Burnable, Ownable, Pausable {
    // Total supply: 1 billion tokens
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Maximum supply for minting
    uint256 public maxSupply = TOTAL_SUPPLY;
    
    // Minting cap per transaction
    uint256 public mintingCap = 10_000_000 * 10**18; // 10M tokens max per mint

    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event MintingCapUpdated(uint256 newCap);
    event MaxSupplyUpdated(uint256 newMaxSupply);

    // Modifiers
    modifier withinMintingCap(uint256 amount) {
        require(amount <= mintingCap, "Amount exceeds minting cap");
        _;
    }

    modifier withinMaxSupply(uint256 amount) {
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() ERC20("Data Access Token", "DAT") {
        // Mint initial supply to owner
        _mint(msg.sender, 100_000_000 * 10**18); // 100M tokens
    }

    /**
     * @dev Mint new tokens
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount)
        external
        onlyOwner
        whenNotPaused
        withinMintingCap(amount)
        withinMaxSupply(amount)
    {
        require(to != address(0), "Cannot mint to zero address");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyOwner
        whenNotPaused
    {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] <= mintingCap, "Amount exceeds minting cap");
            require(totalSupply() + amounts[i] <= maxSupply, "Would exceed max supply");
            
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Update minting cap
     * @param newCap New minting cap
     */
    function updateMintingCap(uint256 newCap) external onlyOwner {
        require(newCap > 0, "Minting cap must be positive");
        mintingCap = newCap;
        emit MintingCapUpdated(newCap);
    }

    /**
     * @dev Update maximum supply
     * @param newMaxSupply New maximum supply
     */
    function updateMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "Max supply below current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override _beforeTokenTransfer to add pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Get remaining mintable supply
     * @return Remaining supply that can be minted
     */
    function getRemainingSupply() external view returns (uint256) {
        return maxSupply - totalSupply();
    }

    /**
     * @dev Check if amount can be minted
     * @param amount Amount to check
     * @return True if amount can be minted
     */
    function canMint(uint256 amount) external view returns (bool) {
        return amount <= mintingCap && 
               totalSupply() + amount <= maxSupply;
    }
}
