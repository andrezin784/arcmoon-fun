// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MoonToken.sol";

/**
 * @title MoonFactory
 * @dev Factory contract to deploy new MoonTokens for Moon.fun
 */
contract MoonFactory {
    // Array of all deployed tokens
    address[] public allTokens;
    
    // Mapping from creator to their tokens
    mapping(address => address[]) public tokensByCreator;
    
    // Mapping to check if address is a MoonToken
    mapping(address => bool) public isMoonToken;
    
    // Events
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );
    
    /**
     * @dev Create a new MoonToken
     */
    function createToken(
        string calldata _name,
        string calldata _symbol,
        string calldata _description,
        string calldata _imageURI
    ) external returns (address) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_symbol).length > 0, "Symbol required");
        require(bytes(_symbol).length <= 10, "Symbol too long");
        
        MoonToken newToken = new MoonToken(
            _name,
            _symbol,
            _description,
            _imageURI,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        allTokens.push(tokenAddress);
        tokensByCreator[msg.sender].push(tokenAddress);
        isMoonToken[tokenAddress] = true;
        
        emit TokenCreated(
            tokenAddress,
            msg.sender,
            _name,
            _symbol,
            block.timestamp
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Get all tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    /**
     * @dev Get tokens by creator
     */
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }
    
    /**
     * @dev Get total number of tokens
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Get recent tokens (last n)
     */
    function getRecentTokens(uint256 count) external view returns (address[] memory) {
        uint256 total = allTokens.length;
        if (count > total) {
            count = total;
        }
        
        address[] memory recent = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = allTokens[total - 1 - i];
        }
        
        return recent;
    }
}

