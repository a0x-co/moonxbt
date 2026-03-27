// Sources flattened with hardhat v2.23.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File contracts/TokenAuction.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.0;
contract TokenAuction is Ownable {
    uint256 public constant CONTRACT_VERSION = 2;
    uint256 public constant BPS_DENOMINATOR = 10000;
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

    function _currentBid() private view returns (Bid storage) {
        return _bids[currentAuctionId];
    }

    function _isActiveBidUsingToken(address token) private view returns (bool) {
        Bid storage currentBid = _currentBid();
        return
            currentBid.bidder != address(0) &&
            currentBid.token == token &&
            getTimeRemaining() > 0;
    }

    function _lockedAmountForToken(address token) private view returns (uint256) {
        Bid storage currentBid = _currentBid();
        if (
            currentBid.bidder != address(0) &&
            currentBid.token == token &&
            getTimeRemaining() > 0
        ) {
            return currentBid.amount;
        }
        return 0;
    }

    // Public view functions to access bids with normalized addresses
    function getBid(
        uint256 auctionId
    ) public view returns (address, address, uint256, string memory) {
        Bid memory bid = _bids[auctionId];
        return (bid.bidder, bid.token, bid.amount, bid.resourceValue);
    }

    function getBidder(uint256 auctionId) public view returns (address) {
        return _bids[auctionId].bidder;
    }
    uint256 public currentAuctionId;
    uint256 public auctionDuration = 1 days;
    uint256 public minBidIncreaseBps = 1000; // 10%
    bool public auctionsPaused;

    // Track the start time of each auction
    mapping(uint256 => uint256) public auctionStartTimes;
    mapping(uint256 => bool) public auctionFinalized;

    // Last auction winner information
    address public lastAuctionWinner;
    address public lastAuctionToken;
    uint256 public lastAuctionWinningAmount;
    string public lastAuctionResourceValue;

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        address indexed token,
        uint256 amount,
        string resourceValue
    );
    event BidRefunded(
        uint256 indexed auctionId,
        address indexed bidder,
        address indexed token,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        address token,
        uint256 amount,
        string resourceValue
    );
    event TokenPriceUpdated(address indexed token, uint256 newPrice);
    event MinBidIncreaseUpdated(uint256 newBps);
    event FundsWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );
    event AuctionsPaused(uint256 indexed auctionId);
    event AuctionsResumed(uint256 indexed auctionId);

    constructor(
        string memory _resourceName,
        string memory _defaultValue
    ) Ownable(msg.sender) {
        require(
            bytes(_resourceName).length > 0,
            "Resource name cannot be empty"
        );
        resourceName = _resourceName;
        defaultResourceValue = _defaultValue;
        _startNewAuction();
    }

    // Función para calcular el valor en USD de una puja
    function calculateBidValueInUSD(
        address token,
        uint256 amount
    ) public view returns (uint256) {
        require(allowedTokens[token], "Token not allowed");
        require(tokenPrices[token] > 0, "Token price not set");
        return (amount * tokenPrices[token]) / 1e8; // Normalizar a 8 decimales
    }

    function placeBid(
        address token,
        uint256 amount,
        string calldata resourceValue
    ) external {
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

        if (previousBidValue > 0) {
            // Require next bid to be at least minBidIncreaseBps above current highest bid.
            uint256 minRequiredBidValue = (previousBidValue *
                (BPS_DENOMINATOR + minBidIncreaseBps) +
                BPS_DENOMINATOR -
                1) / BPS_DENOMINATOR;
            require(
                currentBidValue >= minRequiredBidValue,
                "Bid increase too low"
            );
        }

        address previousBidder = _bids[currentAuctionId].bidder;
        address previousToken = _bids[currentAuctionId].token;
        uint256 previousAmount = _bids[currentAuctionId].amount;

        if (previousBidder != address(0)) {
            require(
                IERC20(previousToken).transfer(previousBidder, previousAmount),
                "Refund failed"
            );
            emit BidRefunded(
                currentAuctionId,
                previousBidder,
                previousToken,
                previousAmount
            );
        }

        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        _bids[currentAuctionId] = Bid({
            bidder: msg.sender,
            token: token,
            amount: amount,
            resourceValue: resourceValue
        });

        emit BidPlaced(
            currentAuctionId,
            msg.sender,
            token,
            amount,
            resourceValue
        );
    }

    function finalizeAuction() external {
        uint256 auctionId = currentAuctionId;
        Bid storage currentBid = _bids[auctionId];
        uint256 auctionStartTime = auctionStartTimes[auctionId];
        require(!auctionFinalized[auctionId], "Auction already finalized");
        require(
            block.timestamp > auctionStartTime + auctionDuration,
            "Auction not ended"
        );

        if (currentBid.bidder != address(0)) {
            // Update last auction winner information
            lastAuctionWinner = currentBid.bidder;
            lastAuctionToken = currentBid.token;
            lastAuctionWinningAmount = currentBid.amount;
            lastAuctionResourceValue = currentBid.resourceValue;
            emit AuctionEnded(
                auctionId,
                currentBid.bidder,
                currentBid.token,
                currentBid.amount,
                currentBid.resourceValue
            );
        } else {
            // Reset last auction winner information if no bids
            lastAuctionWinner = address(0);
            lastAuctionToken = address(0);
            lastAuctionWinningAmount = 0;
            lastAuctionResourceValue = defaultResourceValue;
            emit AuctionEnded(
                auctionId,
                address(0),
                address(0),
                0,
                defaultResourceValue
            );
        }

        auctionFinalized[auctionId] = true;

        if (!auctionsPaused) {
            _startNewAuction();
        }
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
    function getLastAuctionWinner()
        public
        view
        returns (
            address winner,
            address token,
            uint256 amount,
            string memory resourceValue
        )
    {
        return (
            lastAuctionWinner,
            lastAuctionToken,
            lastAuctionWinningAmount,
            lastAuctionResourceValue
        );
    }

    // Funciones de configuración para el owner
    function addAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        allowedTokens[token] = true;
    }

    function removeAllowedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(
            !_isActiveBidUsingToken(token),
            "Cannot remove token used by active bid"
        );
        allowedTokens[token] = false;
    }

    function setTokenPrice(
        address token,
        uint256 priceInUSD
    ) external onlyOwner {
        require(allowedTokens[token], "Token not allowed");
        require(priceInUSD > 0, "Price must be greater than 0");
        require(
            !_isActiveBidUsingToken(token),
            "Cannot change price for active bid token"
        );
        tokenPrices[token] = priceInUSD;
        emit TokenPriceUpdated(token, priceInUSD);
    }

    function setAuctionDuration(uint256 newDuration) external onlyOwner {
        auctionDuration = newDuration;
    }

    function setDefaultResourceValue(
        string calldata newValue
    ) external onlyOwner {
        defaultResourceValue = newValue;
    }

    function setMinBidIncreaseBps(uint256 newBps) external onlyOwner {
        require(newBps <= BPS_DENOMINATOR, "Increase too high");
        minBidIncreaseBps = newBps;
        emit MinBidIncreaseUpdated(newBps);
    }

    function pauseAuctions() external onlyOwner {
        require(!auctionsPaused, "Auctions already paused");
        auctionsPaused = true;
        emit AuctionsPaused(currentAuctionId);
    }

    function resumeAuctions() external onlyOwner {
        require(auctionsPaused, "Auctions are not paused");
        auctionsPaused = false;

        if (auctionFinalized[currentAuctionId]) {
            _startNewAuction();
        }

        emit AuctionsResumed(currentAuctionId);
    }

    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        uint256 lockedAmount = _lockedAmountForToken(token);
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance >= lockedAmount, "Invariant: locked amount exceeds balance");
        require(
            amount <= contractBalance - lockedAmount,
            "Amount exceeds withdrawable balance"
        );
        require(
            IERC20(token).transfer(to, amount),
            "Token withdrawal failed"
        );

        emit FundsWithdrawn(token, to, amount);
    }
}
