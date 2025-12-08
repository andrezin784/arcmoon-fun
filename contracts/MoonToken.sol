// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "hardhat/console.sol";

/**
 * @title MoonToken
 * @dev ERC20 token with bonding curve pricing mechanism for Moon.fun
 * Native currency is USDC (6 decimals)
 */
contract MoonToken is ERC20, Ownable, ReentrancyGuard {
    using Math for uint256;

    // Bonding curve parameters
    // Price is in native currency units (USDC 6 decimals) per 1 whole Token (18 decimals)
    // 0.001 USDC = 1000 units
    uint256 public constant INITIAL_PRICE = 1000; 
    uint256 public constant PRICE_INCREMENT = 1; // +0.000001 USDC per token sold
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 1e18; // 1 billion tokens
    uint256 public constant CREATOR_ALLOCATION = 100_000_000 * 1e18; // 100 million for creator
    
    uint256 public totalSold;
    uint256 public reserveBalance;
    
    string public tokenImageURI;
    string public tokenDescription;
    address public creator;
    uint256 public createdAt;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 refund);
    event MoonSent(address indexed sender, address[] recipients, uint256 amountEach);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _imageURI,
        address _creator
    ) ERC20(_name, _symbol) Ownable(_creator) {
        tokenDescription = _description;
        tokenImageURI = _imageURI;
        creator = _creator;
        createdAt = block.timestamp;
        
        // Mint initial supply to contract for bonding curve
        _mint(address(this), INITIAL_SUPPLY - CREATOR_ALLOCATION);
        
        // Mint creator allocation
        _mint(_creator, CREATOR_ALLOCATION);
        
        totalSold = CREATOR_ALLOCATION;
    }
    
    /**
     * @dev Calculate current price based on bonding curve
     */
    function getCurrentPrice() public view returns (uint256) {
        // Price increases linearly with totalSold
        // Protected against underflow if creator sells their allocation
        if (totalSold <= CREATOR_ALLOCATION) {
            return INITIAL_PRICE;
        }
        return INITIAL_PRICE + ((totalSold - CREATOR_ALLOCATION) / 1e18) * PRICE_INCREMENT;
    }
    
    /**
     * @dev Calculate cost to buy a specific amount of tokens
     */
    function calculateBuyCost(uint256 amount) public view returns (uint256) {
        uint256 startPrice = getCurrentPrice();
        uint256 endPrice = startPrice + (amount / 1e18) * PRICE_INCREMENT;
        
        // Average price * amount
        // Price is for 1e18 tokens.
        uint256 avgPrice = (startPrice + endPrice) / 2;
        return (avgPrice * amount) / 1e18;
    }
    
    /**
     * @dev Calculate refund for selling tokens
     */
    function calculateSellRefund(uint256 amount) public view returns (uint256) {
        if (totalSold <= CREATOR_ALLOCATION) return 0;
        
        uint256 amountToConsider = amount;
        if (totalSold - amount < CREATOR_ALLOCATION) {
            amountToConsider = totalSold - CREATOR_ALLOCATION;
        }
        
        uint256 startPrice = getCurrentPrice();
        
        // Safety check for endPrice calculation
        uint256 priceDrop = (amountToConsider / 1e18) * PRICE_INCREMENT;
        uint256 endPrice;
        if (priceDrop >= startPrice) {
            endPrice = INITIAL_PRICE; // Floor at initial
        } else {
            endPrice = startPrice - priceDrop;
        }
        
        uint256 avgPrice = (startPrice + endPrice) / 2;
        return (avgPrice * amountToConsider) / 1e18;
    }
    
    /**
     * @dev Buy tokens with native currency (USDC on Arc - 6 decimals)
     * @param minTokens Minimum tokens to receive (slippage protection)
     */
    function buy(uint256 minTokens) external payable nonReentrant {
        require(msg.value > 0, "Must send payment");
        require(msg.value >= 1000, "Minimum 0.001 USDC required"); // 1000 units = 0.001 USDC (6 decimals)
        
        uint256 tokensToMint = calculateTokensForPayment(msg.value);
        require(tokensToMint > 0, "Amount too small");
        require(tokensToMint >= minTokens, "Slippage too high");
        require(balanceOf(address(this)) >= tokensToMint, "Not enough tokens available");
        
        totalSold += tokensToMint;
        reserveBalance += msg.value;
        
        _transfer(address(this), msg.sender, tokensToMint);
        
        // Enhanced event for debugging
        emit TokensPurchased(msg.sender, tokensToMint, msg.value);
        
        console.log("Buy successful - USDC paid:", msg.value);
        console.log("Tokens received:", tokensToMint);
    }
    
    /**
     * @dev Calculate tokens received for a payment amount
     * Uses exact bonding curve math to prevent reserve underflow
     */
    function calculateTokensForPayment(uint256 payment) public view returns (uint256) {
        // P = currentPrice
        // k = PRICE_INCREMENT
        // C = payment
        // x = (-P + sqrt(P^2 + 2*k*C)) / k
        
        uint256 P = getCurrentPrice();
        uint256 C = payment;
        uint256 k = PRICE_INCREMENT;
        
        uint256 term = P * P + 2 * k * C;
        uint256 root = Math.sqrt(term);
        
        if (root < P) return 0;
        
        uint256 x = (root - P) / k;
        
        return x * 1e18;
    }
    
    /**
     * @dev Sell tokens back to the curve
     */
    function sell(uint256 amount, uint256 minRefund) external nonReentrant {
        console.log("Sell called. Amount:", amount);
        require(amount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        uint256 refund = calculateSellRefund(amount);
        console.log("Calculated refund:", refund);
        require(refund >= minRefund, "Slippage too high");
        
        // Cap refund to reserve (safety)
        if (refund > reserveBalance) {
            console.log("Capping refund. Reserve:", reserveBalance);
            refund = reserveBalance;
        }
        
        console.log("TotalSold before:", totalSold);
        totalSold -= amount;
        console.log("TotalSold after:", totalSold);
        
        reserveBalance -= refund;
        console.log("Reserve after:", reserveBalance);
        
        _transfer(msg.sender, address(this), amount);
        
        (bool success, ) = payable(msg.sender).call{value: refund}("");
        require(success, "Refund failed");
        
        emit TokensSold(msg.sender, amount, refund);
    }
    
    /**
     * @dev Send Moon tokens to multiple random addresses (for generating transactions)
     */
    function sendMoon(address[] calldata recipients, uint256 amountEach) external nonReentrant {
        require(recipients.length > 0, "No recipients");
        require(recipients.length <= 100, "Too many recipients");
        
        uint256 totalAmount = amountEach * recipients.length;
        require(balanceOf(msg.sender) >= totalAmount, "Insufficient balance");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                _transfer(msg.sender, recipients[i], amountEach);
            }
        }
        
        emit MoonSent(msg.sender, recipients, amountEach);
    }
    
    /**
     * @dev Get token info
     */
    function getTokenInfo() external view returns (
        string memory name_,
        string memory symbol_,
        string memory description_,
        string memory imageURI_,
        address creator_,
        uint256 totalSupply_,
        uint256 totalSold_,
        uint256 currentPrice_,
        uint256 reserveBalance_,
        uint256 createdAt_
    ) {
        return (
            name(),
            symbol(),
            tokenDescription,
            tokenImageURI,
            creator,
            totalSupply(),
            totalSold,
            getCurrentPrice(),
            reserveBalance,
            createdAt
        );
    }
    
    receive() external payable {}
}
