// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MoonTokenV2
 * @dev V2 of MoonToken - same logic but prepared for future upgrades
 */
contract MoonTokenV2 is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant INITIAL_PRICE = 1000; 
    uint256 public constant PRICE_INCREMENT = 1;
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 1e18;
    uint256 public constant CREATOR_ALLOCATION = 100_000_000 * 1e18;
    
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
        
        _mint(address(this), INITIAL_SUPPLY - CREATOR_ALLOCATION);
        _mint(_creator, CREATOR_ALLOCATION);
        totalSold = CREATOR_ALLOCATION;
    }
    
    function version() public pure returns (string memory) {
        return "v2.0";
    }
    
    function getCurrentPrice() public view returns (uint256) {
        return INITIAL_PRICE + ((totalSold - CREATOR_ALLOCATION) / 1e18) * PRICE_INCREMENT;
    }
    
    function calculateBuyCost(uint256 amount) public view returns (uint256) {
        uint256 startPrice = getCurrentPrice();
        uint256 endPrice = startPrice + (amount / 1e18) * PRICE_INCREMENT;
        uint256 avgPrice = (startPrice + endPrice) / 2;
        return (avgPrice * amount) / 1e18;
    }
    
    function calculateSellRefund(uint256 amount) public view returns (uint256) {
        if (totalSold <= CREATOR_ALLOCATION) return 0;
        uint256 amountToConsider = amount;
        if (totalSold - amount < CREATOR_ALLOCATION) {
            amountToConsider = totalSold - CREATOR_ALLOCATION;
        }
        uint256 startPrice = getCurrentPrice();
        uint256 endPrice = startPrice - (amountToConsider / 1e18) * PRICE_INCREMENT;
        uint256 avgPrice = (startPrice + endPrice) / 2;
        return (avgPrice * amountToConsider) / 1e18;
    }
    
    function buy(uint256 minTokens) external payable nonReentrant {
        require(msg.value > 0, "Must send payment");
        uint256 tokensToMint = calculateTokensForPayment(msg.value);
        require(tokensToMint >= minTokens, "Slippage too high");
        require(balanceOf(address(this)) >= tokensToMint, "Not enough tokens");
        
        totalSold += tokensToMint;
        reserveBalance += msg.value;
        _transfer(address(this), msg.sender, tokensToMint);
        emit TokensPurchased(msg.sender, tokensToMint, msg.value);
    }
    
    function calculateTokensForPayment(uint256 payment) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        if (currentPrice == 0) return 0;
        return (payment * 1e18) / currentPrice;
    }
    
    function sell(uint256 amount, uint256 minRefund) external nonReentrant {
        require(amount > 0, "Amount > 0");
        require(balanceOf(msg.sender) >= amount, "Balance low");
        uint256 refund = calculateSellRefund(amount);
        require(refund >= minRefund, "Slippage too high");
        if (refund > reserveBalance) refund = reserveBalance;
        
        totalSold -= amount;
        reserveBalance -= refund;
        _transfer(msg.sender, address(this), amount);
        (bool success, ) = payable(msg.sender).call{value: refund}("");
        require(success, "Refund failed");
        emit TokensSold(msg.sender, amount, refund);
    }
    
    function sendMoon(address[] calldata recipients, uint256 amountEach) external nonReentrant {
        require(recipients.length > 0 && recipients.length <= 100, "Invalid recipients");
        uint256 totalAmount = amountEach * recipients.length;
        require(balanceOf(msg.sender) >= totalAmount, "Balance low");
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) _transfer(msg.sender, recipients[i], amountEach);
        }
        emit MoonSent(msg.sender, recipients, amountEach);
    }
    
    function getTokenInfo() external view returns (
        string memory, string memory, string memory, string memory, address, uint256, uint256, uint256, uint256, uint256
    ) {
        return (name(), symbol(), tokenDescription, tokenImageURI, creator, totalSupply(), totalSold, getCurrentPrice(), reserveBalance, createdAt);
    }
    
    receive() external payable {}
}

