// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenAuction is Ownable {
    mapping(address => bool) public allowedTokens;
    // Precio de referencia en USD (con 8 decimales)
    mapping(address => uint256) public tokenPrices;
    string public resourceName;
    string public defaultResourceValue;
    
    struct Bid {
        address bidder;
        address token;
        uint256 amount;
        string resourceValue;
    }
    
    mapping(uint256 => Bid) private _bids;
    
    // Public view functions to access bids with normalized addresses
    function getBid(uint256 auctionId) public view returns (address, address, uint256, string memory) {
        Bid memory bid = _bids[auctionId];
        return (bid.bidder, bid.token, bid.amount, bid.resourceValue);
    }
    
    function getBidder(uint256 auctionId) public view returns (address) {
        return _bids[auctionId].bidder;
    }
    uint256 public currentAuctionId;
    uint256 public auctionDuration = 1 days;
    
    // Track the start time of each auction
    mapping(uint256 => uint256) public auctionStartTimes;

    // Last auction winner information
    address public lastAuctionWinner;
    address public lastAuctionToken;
    uint256 public lastAuctionWinningAmount;
    string public lastAuctionResourceValue;
    
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, address indexed token, uint256 amount, string resourceValue);
    event BidRefunded(uint256 indexed auctionId, address indexed bidder, address indexed token, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, address token, uint256 amount, string resourceValue);
    event TokenPriceUpdated(address indexed token, uint256 newPrice);
    
    constructor(string memory _resourceName, string memory _defaultValue) Ownable(msg.sender) {
        require(bytes(_resourceName).length > 0, "Resource name cannot be empty");
        resourceName = _resourceName;
        defaultResourceValue = _defaultValue;
        _startNewAuction();
    }

    // Función para calcular el valor en USD de una puja
    function calculateBidValueInUSD(address token, uint256 amount) public view returns (uint256) {
        require(allowedTokens[token], "Token not allowed");
        require(tokenPrices[token] > 0, "Token price not set");
        return (amount * tokenPrices[token]) / 1e8; // Normalizar a 8 decimales
    }
    
    function placeBid(address token, uint256 amount, string calldata resourceValue) external {
        require(allowedTokens[token], "Token not allowed");
        require(tokenPrices[token] > 0, "Token price not set");
        require(bytes(resourceValue).length > 0, "Resource value required");
        require(getTimeRemaining() > 0, "Auction has ended");
        
        uint256 currentBidValue = calculateBidValueInUSD(token, amount);
        uint256 previousBidValue = 0;
        
        if (_bids[currentAuctionId].bidder != address(0)) {
            previousBidValue = calculateBidValueInUSD(
                _bids[currentAuctionId].token,
                _bids[currentAuctionId].amount
            );
        }
        
        require(currentBidValue > previousBidValue, "Bid value too low");
        
        address previousBidder = _bids[currentAuctionId].bidder;
        address previousToken = _bids[currentAuctionId].token;
        uint256 previousAmount = _bids[currentAuctionId].amount;
        
        if (previousBidder != address(0)) {
            require(IERC20(previousToken).transfer(previousBidder, previousAmount), "Refund failed");
            emit BidRefunded(currentAuctionId, previousBidder, previousToken, previousAmount);
        }
        
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        _bids[currentAuctionId] = Bid({
            bidder: msg.sender,
            token: token,
            amount: amount,
            resourceValue: resourceValue
        });
        
        emit BidPlaced(currentAuctionId, msg.sender, token, amount, resourceValue);
    }
    
    function finalizeAuction() external {
        Bid storage currentBid = _bids[currentAuctionId];
        uint256 auctionStartTime = auctionStartTimes[currentAuctionId];
        require(block.timestamp > auctionStartTime + auctionDuration, "Auction not ended");
        
        if (currentBid.bidder != address(0)) {
            // Update last auction winner information
            lastAuctionWinner = currentBid.bidder;
            lastAuctionToken = currentBid.token;
            lastAuctionWinningAmount = currentBid.amount;
            lastAuctionResourceValue = currentBid.resourceValue;
            emit AuctionEnded(currentAuctionId, currentBid.bidder, currentBid.token, currentBid.amount, currentBid.resourceValue);
        } else {
            // Reset last auction winner information if no bids
            lastAuctionWinner = address(0);
            lastAuctionToken = address(0);
            lastAuctionWinningAmount = 0;
            lastAuctionResourceValue = defaultResourceValue;
            emit AuctionEnded(currentAuctionId, address(0), address(0), 0, defaultResourceValue);
        }
        
        _startNewAuction();
    }
    
    function _startNewAuction() private {
        currentAuctionId++;
        _bids[currentAuctionId] = Bid({
            bidder: address(0),
            token: address(0),
            amount: 0,
            resourceValue: ""
        });
        // Record the start time of the new auction
        auctionStartTimes[currentAuctionId] = block.timestamp;
    }

    // Get remaining time in current auction (in seconds)
    function getTimeRemaining() public view returns (uint256) {
        uint256 startTime = auctionStartTimes[currentAuctionId];
        uint256 endTime = startTime + auctionDuration;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }

    // Get last auction winner information
    function getLastAuctionWinner() public view returns (
        address winner,
        address token,
        uint256 amount,
        string memory resourceValue
    ) {
        return (lastAuctionWinner, lastAuctionToken, lastAuctionWinningAmount, lastAuctionResourceValue);
    }
    
    // Funciones de configuración para el owner
    function addAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        allowedTokens[token] = true;
    }

    function removeAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        allowedTokens[token] = false;
    }

    function setTokenPrice(address token, uint256 priceInUSD) external onlyOwner {
        require(allowedTokens[token], "Token not allowed");
        require(priceInUSD > 0, "Price must be greater than 0");
        tokenPrices[token] = priceInUSD;
        emit TokenPriceUpdated(token, priceInUSD);
    }
    
    function setAuctionDuration(uint256 newDuration) external onlyOwner {
        auctionDuration = newDuration;
    }
    
    function setDefaultResourceValue(string calldata newValue) external onlyOwner {
        defaultResourceValue = newValue;
    }
}