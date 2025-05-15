use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

// TODO: Replace with your actual program ID after first build/deploy
declare_id!("816xF6MFwtfBvqAJhsgbB67tgJ515jS7Ts8tbKfZ9QYw");

pub const MAX_RESOURCE_NAME_LENGTH: usize = 200;
pub const MAX_RESOURCE_VALUE_LENGTH: usize = 200;

#[program]
pub mod token_auction_program {
    use super::*;

    // Instructions will be defined here later based on PLAN_MIGRACION.md
    // For example: initialize_auction, place_bid, finalize_auction, etc.

    pub fn initialize_auction(
        ctx: Context<InitializeAuction>,
        resource_name: String,
        default_resource_value: String,
        auction_duration: u64,
    ) -> Result<()> {
        // Validate string lengths
        require!(resource_name.len() <= MAX_RESOURCE_NAME_LENGTH, AuctionError::ResourceNameTooLong);
        require!(default_resource_value.len() <= MAX_RESOURCE_VALUE_LENGTH, AuctionError::ResourceValueTooLong);
        require!(auction_duration > 0, AuctionError::AuctionDurationTooShort);

        let auction_config = &mut ctx.accounts.auction_config;
        let auction_state = &mut ctx.accounts.auction_state;
        let clock = Clock::get()?;

        auction_config.authority = ctx.accounts.authority.key();
        auction_config.bidding_token_mint = ctx.accounts.bidding_token_mint.key();
        auction_config.resource_name = resource_name;
        auction_config.default_resource_value = default_resource_value;
        auction_config.auction_duration = auction_duration;
        auction_config.current_auction_id = 1; // First auction
        auction_config.total_auctions_held = 0;
        auction_config.program_token_account_bump = ctx.bumps.program_token_account;


        auction_state.id = 1; // Corresponds to current_auction_id
        auction_state.start_timestamp = clock.unix_timestamp;
        auction_state.highest_bidder = Pubkey::default(); // No bidder yet
        auction_state.highest_bid_amount = 0;
        auction_state.highest_bid_resource_value = "".to_string(); // Empty initially

        msg!("Auction initialized for resource: {}", auction_config.resource_name);
        msg!("Auction duration: {} seconds", auction_config.auction_duration);
        msg!("Current Auction ID set to: {}", auction_config.current_auction_id);
        msg!("AuctionState for ID {} initialized at timestamp: {}", auction_state.id, auction_state.start_timestamp);
        Ok(())
    }

    pub fn place_bid(
        ctx: Context<PlaceBid>,
        amount: u64,
        resource_value: String,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let auction_config = &ctx.accounts.auction_config;
        let auction_state = &mut ctx.accounts.auction_state;

        // Validations
        require!(resource_value.len() > 0 && resource_value.len() <= MAX_RESOURCE_VALUE_LENGTH, AuctionError::BidResourceValueEmptyOrTooLong);
        require!(amount > auction_state.highest_bid_amount, AuctionError::BidTooLow);
        
        let auction_end_timestamp = auction_state.start_timestamp.checked_add(auction_config.auction_duration as i64).ok_or(AuctionError::TimestampError)?;
        require!(clock.unix_timestamp < auction_end_timestamp, AuctionError::AuctionNotActiveOrNotEnded); // Use AuctionNotActive to match constraint

        // Refund previous bidder if there was one
        if auction_state.highest_bidder != Pubkey::default() && auction_state.highest_bid_amount > 0 {
            // Explicitly check previous_bidder_token_account as it's UncheckedAccount
            require!(
                !ctx.accounts.previous_bidder_token_account.data_is_empty() &&
                ctx.accounts.previous_bidder_token_account.owner == &token::ID,
                AuctionError::MissingOrInvalidPreviousBidderTokenAccount
            );
            // Deserialize and validate the previous bidder's token account
            let previous_bidder_account_info = ctx.accounts.previous_bidder_token_account.to_account_info();
            let mut data = &previous_bidder_account_info.try_borrow_data()?[..];
            let prev_bidder_token_acc = TokenAccount::try_deserialize_unchecked(&mut data)?;

            require!(prev_bidder_token_acc.mint == auction_config.bidding_token_mint, AuctionError::InvalidBiddingMint);
            require!(prev_bidder_token_acc.owner == auction_state.highest_bidder, AuctionError::InvalidPreviousBidderTokenAccountOwner);
            
            let cpi_accounts_refund = Transfer {
                from: ctx.accounts.program_token_account.to_account_info(),
                to: previous_bidder_account_info.clone(), // Use the validated account info
                authority: ctx.accounts.program_token_account.to_account_info(), // The PDA itself is the authority
            };
            
            let program_token_account_seeds = &[
                b"program_token_account".as_ref(),
                &[auction_config.program_token_account_bump] // Use the stored bump
            ];
            let signer_seeds_refund = &[&program_token_account_seeds[..]];
            
            let cpi_program_refund = ctx.accounts.token_program.to_account_info();
            let cpi_ctx_refund = CpiContext::new_with_signer(cpi_program_refund, cpi_accounts_refund, signer_seeds_refund);
            token::transfer(cpi_ctx_refund, auction_state.highest_bid_amount)?;

            emit!(BidRefunded {
                auction_id: auction_state.id,
                bidder: auction_state.highest_bidder,
                amount: auction_state.highest_bid_amount,
            });
        }

        // Transfer new bid amount from bidder to program's token account
        let cpi_accounts_bid = Transfer {
            from: ctx.accounts.bidder_token_account.to_account_info(),
            to: ctx.accounts.program_token_account.to_account_info(),
            authority: ctx.accounts.bidder_authority.to_account_info(),
        };
        let cpi_program_bid = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_bid = CpiContext::new(cpi_program_bid, cpi_accounts_bid);
        token::transfer(cpi_ctx_bid, amount)?;

        // Update auction state
        auction_state.highest_bidder = ctx.accounts.bidder_authority.key();
        auction_state.highest_bid_amount = amount;
        auction_state.highest_bid_resource_value = resource_value.clone();

        emit!(BidPlaced {
            auction_id: auction_state.id,
            bidder: auction_state.highest_bidder,
            amount: auction_state.highest_bid_amount,
            resource_value: resource_value,
        });

        msg!("Bid placed for auction ID {}: Amount {}, Bidder {}", auction_state.id, amount, ctx.accounts.bidder_authority.key());
        Ok(())
    }

    pub fn finalize_auction(ctx: Context<FinalizeAuction>) -> Result<()> {
        let clock = Clock::get()?;
        let auction_config = &mut ctx.accounts.auction_config;
        let current_auction_state = &ctx.accounts.current_auction_state; // Not mutable here, will be closed

        // Validate auction has ended
        let auction_end_timestamp = current_auction_state.start_timestamp
            .checked_add(auction_config.auction_duration as i64)
            .ok_or(AuctionError::TimestampError)?;
        require!(clock.unix_timestamp >= auction_end_timestamp, AuctionError::AuctionNotYetEnded);

        let winner: Pubkey;
        let winning_amount: u64;
        let winning_resource_value: String;

        if current_auction_state.highest_bidder != Pubkey::default() && current_auction_state.highest_bid_amount > 0 {
            // Transfer winning bid amount to the authority's token account
            let cpi_accounts_transfer_winnings = Transfer {
                from: ctx.accounts.program_token_account.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.program_token_account.to_account_info(), // PDA is authority
            };
            let program_token_account_seeds = &[
                b"program_token_account".as_ref(),
                &[auction_config.program_token_account_bump]
            ];
            let signer_seeds_transfer_winnings = &[&program_token_account_seeds[..]];
            let cpi_program_transfer_winnings = ctx.accounts.token_program.to_account_info();
            let cpi_ctx_transfer_winnings = CpiContext::new_with_signer(
                cpi_program_transfer_winnings,
                cpi_accounts_transfer_winnings,
                signer_seeds_transfer_winnings
            );
            token::transfer(cpi_ctx_transfer_winnings, current_auction_state.highest_bid_amount)?;
            
            winner = current_auction_state.highest_bidder;
            winning_amount = current_auction_state.highest_bid_amount;
            winning_resource_value = current_auction_state.highest_bid_resource_value.clone();
            msg!("Auction {} ended. Winner: {}, Amount: {}", current_auction_state.id, winner, winning_amount);
        } else {
            // No bids, or highest bid was zero (should not happen if BidTooLow is effective)
            winner = Pubkey::default(); // No winner
            winning_amount = 0;
            winning_resource_value = auction_config.default_resource_value.clone();
            msg!("Auction {} ended. No bids received.", current_auction_state.id);
        }

        // Create HistoricalAuctionData
        let historical_data = &mut ctx.accounts.historical_auction_data;
        historical_data.auction_id = current_auction_state.id;
        historical_data.winner = winner;
        historical_data.winning_amount = winning_amount;
        historical_data.winning_resource_value = winning_resource_value.clone();
        historical_data.end_timestamp = clock.unix_timestamp;

        // Update AuctionConfig
        auction_config.total_auctions_held = auction_config.total_auctions_held.checked_add(1).ok_or(ProgramError::ArithmeticOverflow)?;
        auction_config.current_auction_id = auction_config.current_auction_id.checked_add(1).ok_or(ProgramError::ArithmeticOverflow)?;

        // Initialize New AuctionState for the next auction
        let new_auction_state = &mut ctx.accounts.new_auction_state;
        new_auction_state.id = auction_config.current_auction_id;
        new_auction_state.start_timestamp = clock.unix_timestamp;
        new_auction_state.highest_bidder = Pubkey::default();
        new_auction_state.highest_bid_amount = 0;
        new_auction_state.highest_bid_resource_value = "".to_string();

        emit!(AuctionEndedEvent { // Renamed to avoid conflict with error
            auction_id: current_auction_state.id,
            winner,
            amount: winning_amount,
            resource_value: winning_resource_value,
            end_timestamp: clock.unix_timestamp,
        });
        
        msg!("New auction {} started. Total auctions held: {}", new_auction_state.id, auction_config.total_auctions_held);

        // current_auction_state account will be closed automatically by Anchor if 'close' constraint is added
        // or can be closed manually if preferred. For now, relying on 'close' in Accounts struct.
        Ok(())
    }

    // --- Configuration Instructions (Authority Only) ---

    pub fn set_bidding_token(ctx: Context<SetBiddingToken>, new_token_mint: Pubkey) -> Result<()> {
        require!(new_token_mint != Pubkey::default(), AuctionError::InvalidBiddingMint);
        ctx.accounts.auction_config.bidding_token_mint = new_token_mint;
        msg!("Bidding token mint updated to: {}", new_token_mint);
        Ok(())
    }

    pub fn set_auction_duration(ctx: Context<SetAuctionDuration>, new_duration: u64) -> Result<()> {
        require!(new_duration > 0, AuctionError::AuctionDurationTooShort);
        ctx.accounts.auction_config.auction_duration = new_duration;
        msg!("Auction duration updated to: {} seconds", new_duration);
        Ok(())
    }

    pub fn set_default_resource_value(ctx: Context<SetDefaultResourceValue>, new_value: String) -> Result<()> {
        require!(!new_value.is_empty() && new_value.len() <= MAX_RESOURCE_VALUE_LENGTH, AuctionError::ResourceValueTooLong);
        ctx.accounts.auction_config.default_resource_value = new_value.clone();
        msg!("Default resource value updated to: {}", new_value);
        Ok(())
    }

    pub fn set_resource_name(ctx: Context<SetResourceName>, new_name: String) -> Result<()> {
        require!(!new_name.is_empty() && new_name.len() <= MAX_RESOURCE_NAME_LENGTH, AuctionError::ResourceNameTooLong);
        ctx.accounts.auction_config.resource_name = new_name.clone();
        msg!("Resource name updated to: {}", new_name);
        Ok(())
    }
}

// Account structures will be defined here later based on PLAN_MIGRACION.md
// For example: AuctionConfig, AuctionState, HistoricalAuctionData

#[account]
#[derive(Default)] // Added Default for easier initialization in tests if needed
pub struct AuctionConfig {
    pub authority: Pubkey,
    pub bidding_token_mint: Pubkey,
    pub resource_name: String, // Max 200 chars, space calculation needed
    pub default_resource_value: String, // Max 200 chars, space calculation needed
    pub auction_duration: u64, // Duration in seconds
    pub current_auction_id: u64,
    pub program_token_account_bump: u8, // Bump for the program's token account PDA
    pub total_auctions_held: u64,
}

impl AuctionConfig {
    // Calculate space:
    // 8 (discriminator)
    // 32 (authority)
    // 32 (bidding_token_mint)
    // 4 + MAX_RESOURCE_NAME_LENGTH (resource_name)
    // 4 + MAX_RESOURCE_VALUE_LENGTH (default_resource_value)
    // 8 (auction_duration)
    // 8 (current_auction_id)
    // 1 (program_token_account_bump)
    // 8 (total_auctions_held)
    // = 8 + 32 + 32 + (4 + 200) + (4 + 200) + 8 + 8 + 1 + 8 = 505 bytes. Add some buffer.
    pub const SPACE: usize = 8 + 32 + 32 + (4 + MAX_RESOURCE_NAME_LENGTH) + (4 + MAX_RESOURCE_VALUE_LENGTH) + 8 + 8 + 1 + 8 + 32 /* buffer */;
}


#[account]
#[derive(Default)]
pub struct AuctionState {
    pub id: u64, // ID of this auction
    pub start_timestamp: i64,
    pub highest_bidder: Pubkey,
    pub highest_bid_amount: u64,
    pub highest_bid_resource_value: String, // Max 200 chars
    // pub is_active: bool, // Can be derived or managed explicitly. Let's derive for now.
}

impl AuctionState {
    // Calculate space:
    // 8 (discriminator)
    // 8 (id)
    // 8 (start_timestamp)
    // 32 (highest_bidder)
    // 8 (highest_bid_amount)
    // 4 + MAX_RESOURCE_VALUE_LENGTH (highest_bid_resource_value)
    // = 8 + 8 + 8 + 32 + 8 + (4 + 200) = 268 bytes. Add some buffer.
    pub const SPACE: usize = 8 + 8 + 8 + 32 + 8 + (4 + MAX_RESOURCE_VALUE_LENGTH) + 32 /* buffer */;
}

#[account]
#[derive(Default)]
pub struct HistoricalAuctionData {
    pub auction_id: u64,
    pub winner: Pubkey, // Pubkey::default() if no winner
    pub winning_amount: u64,
    pub winning_resource_value: String, // Max 200 chars
    pub end_timestamp: i64,
}

impl HistoricalAuctionData {
    // Calculate space:
    // 8 (discriminator)
    // 8 (auction_id)
    // 32 (winner)
    // 8 (winning_amount)
    // 4 + MAX_RESOURCE_VALUE_LENGTH (winning_resource_value)
    // 8 (end_timestamp)
    // = 8 + 8 + 32 + 8 + (4 + 200) = 268 bytes. Add some buffer.
    pub const SPACE: usize = 8 + 8 + 32 + 8 + (4 + MAX_RESOURCE_VALUE_LENGTH) + 32 /* buffer */;
}

#[derive(Accounts)]
#[instruction(
    resource_name: String, // Used for seed derivation if needed, and validation
    default_resource_value: String,
    auction_duration: u64
)]
pub struct InitializeAuction<'info> {
    #[account(
        init,
        payer = payer,
        space = AuctionConfig::SPACE,
        seeds = [b"auction_config".as_ref()], // Single global config
        bump
    )]
    pub auction_config: Account<'info, AuctionConfig>,

    #[account(
        init,
        payer = payer,
        space = AuctionState::SPACE,
        seeds = [
            b"active_auction".as_ref(),
            &1u64.to_le_bytes() // Seed with initial auction ID (1)
        ],
        bump
    )]
    pub auction_state: Account<'info, AuctionState>,

    #[account(
        init,
        payer = payer,
        token::mint = bidding_token_mint,
        token::authority = program_token_account, // The program_token_account PDA is its own authority
        seeds = [b"program_token_account".as_ref()],
        bump
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    pub bidding_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>, // The authority for the auction settings

    #[account(mut)]
    pub payer: Signer<'info>, // Payer for account initializations

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>, // Rent sysvar for account initialization
}

#[derive(Accounts)]
#[instruction(amount: u64, resource_value: String)]
pub struct PlaceBid<'info> {
    #[account(
        seeds = [b"auction_config".as_ref()],
        bump, // auction_config bump is loaded from the account itself if already initialized
    )]
    pub auction_config: Account<'info, AuctionConfig>,

    #[account(
        mut,
        seeds = [
            b"active_auction".as_ref(),
            &auction_config.current_auction_id.to_le_bytes()
        ],
        bump, // auction_state bump is loaded from the account itself
        constraint = auction_state.id == auction_config.current_auction_id @ AuctionError::AuctionNotActiveOrNotEnded
    )]
    pub auction_state: Account<'info, AuctionState>,

    #[account(
        mut,
        seeds = [b"program_token_account".as_ref()],
        bump = auction_config.program_token_account_bump
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bidder_token_account: Account<'info, TokenAccount>, // Bidder's token account (from where tokens are transferred)

    /// CHECK: This account is used for refunding the previous bidder.
    /// It's optional because the first bid won't have a previous bidder.
    /// Constraints are checked in the instruction logic.
    /// The client is responsible for providing this account if a refund is expected.
    /// It must be a valid TokenAccount owned by the previous_bidder.
    #[account(mut)]
    pub previous_bidder_token_account: UncheckedAccount<'info>,


    #[account(mut)]
    pub bidder_authority: Signer<'info>, // The bidder

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeAuction<'info> {
    #[account(mut, seeds = [b"auction_config".as_ref()], bump)]
    pub auction_config: Account<'info, AuctionConfig>,

    #[account(
        mut, // Mutable because it will be closed
        seeds = [
            b"active_auction".as_ref(),
            &auction_config.current_auction_id.to_le_bytes()
        ],
        bump,
        constraint = current_auction_state.id == auction_config.current_auction_id @ AuctionError::AuctionNotActiveOrNotEnded,
        close = payer // Close the account and return rent to payer
    )]
    pub current_auction_state: Account<'info, AuctionState>,

    #[account(
        init,
        payer = payer,
        space = HistoricalAuctionData::SPACE,
        seeds = [
            b"historical_auction".as_ref(),
            &auction_config.current_auction_id.to_le_bytes() // Use current_auction_id BEFORE it's incremented
        ],
        bump
    )]
    pub historical_auction_data: Account<'info, HistoricalAuctionData>,
    
    #[account(
        init,
        payer = payer,
        space = AuctionState::SPACE,
        seeds = [
            b"active_auction".as_ref(),
            &(auction_config.current_auction_id + 1).to_le_bytes() // Simpler expression for seed derivation
        ],
        bump
    )]
    pub new_auction_state: Account<'info, AuctionState>,

    #[account(
        mut,
        seeds = [b"program_token_account".as_ref()],
        bump = auction_config.program_token_account_bump
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    #[account(mut)] // Authority's token account to receive winnings
    pub authority_token_account: Account<'info, TokenAccount>,
    
    // Ensure this is the actual authority of the auction_config
    #[account(address = auction_config.authority @ AuctionError::InvalidAuthority)]
    pub authority: Signer<'info>, 

    #[account(mut)]
    pub payer: Signer<'info>, // Payer for new account initializations

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// --- Accounts for Configuration Instructions ---

#[derive(Accounts)]
pub struct SetBiddingToken<'info> {
    #[account(
        mut,
        seeds = [b"auction_config".as_ref()],
        bump, // Anchor infers bump from the initialized auction_config account
        has_one = authority @ AuctionError::InvalidAuthority
    )]
    pub auction_config: Account<'info, AuctionConfig>,
    pub authority: Signer<'info>,
    /// CHECK: This is the Pubkey of the new mint. The instruction does a basic check.
    /// For full safety, the client should ensure this is a valid mint account, or this could be
    /// changed to Account<'info, Mint> if the program needs to read data from the mint account itself.
    pub new_bidding_token_mint_account: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SetAuctionDuration<'info> {
    #[account(
        mut,
        seeds = [b"auction_config".as_ref()],
        bump,
        has_one = authority @ AuctionError::InvalidAuthority
    )]
    pub auction_config: Account<'info, AuctionConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(new_value: String)] // The instruction argument is passed for context/logging
pub struct SetDefaultResourceValue<'info> {
    #[account(
        mut,
        seeds = [b"auction_config".as_ref()],
        bump,
        has_one = authority @ AuctionError::InvalidAuthority
    )]
    pub auction_config: Account<'info, AuctionConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(new_name: String)] // The instruction argument is passed for context/logging
pub struct SetResourceName<'info> {
    #[account(
        mut,
        seeds = [b"auction_config".as_ref()],
        bump,
        has_one = authority @ AuctionError::InvalidAuthority
    )]
    pub auction_config: Account<'info, AuctionConfig>,
    pub authority: Signer<'info>,
}

// Custom error codes will be defined here
#[error_code]
pub enum AuctionError {
    #[msg("Resource name exceeds maximum length.")]
    ResourceNameTooLong,
    #[msg("Resource value exceeds maximum length.")]
    ResourceValueTooLong,
    #[msg("Auction duration must be greater than zero.")]
    AuctionDurationTooShort,
    #[msg("Bid amount is too low.")]
    BidTooLow,
    #[msg("Resource value for bid cannot be empty or exceed max length.")]
    BidResourceValueEmptyOrTooLong,
    #[msg("Auction has already ended.")]
    AuctionEnded,
    #[msg("Auction is not the active one or has not ended yet.")] // Combined for clarity
    AuctionNotActiveOrNotEnded, // Renamed AuctionNotActive
    #[msg("Invalid winner data.")]
    InvalidWinner,
    #[msg("Timestamp error.")]
    TimestampError,
    #[msg("Previous bidder token account not provided or invalid for refund.")]
    MissingOrInvalidPreviousBidderTokenAccount,
    #[msg("Owner of previous bidder token account does not match highest bidder.")]
    InvalidPreviousBidderTokenAccountOwner,
    #[msg("Mint of previous bidder token account does not match bidding token mint.")]
    InvalidBiddingMint,
    #[msg("Auction has not actually ended according to its duration.")] // Specific for finalize_auction time check
    AuctionNotYetEnded, // Replaces the generic AuctionNotEnded for this context
    #[msg("The provided authority does not match the auction config authority.")]
    InvalidAuthority,
    // More specific errors will be added based on PLAN_MIGRACION.md
}

// Events will be defined here
#[event]
pub struct BidPlaced {
    pub auction_id: u64,
    pub bidder: Pubkey,
    pub amount: u64,
    pub resource_value: String,
}

#[event]
pub struct BidRefunded {
    pub auction_id: u64,
    pub bidder: Pubkey, // The bidder being refunded
    pub amount: u64,
}

#[event]
pub struct AuctionEndedEvent { // Renamed to avoid conflict with AuctionError::AuctionEnded
    pub auction_id: u64,
    pub winner: Pubkey,
    pub amount: u64,
    pub resource_value: String,
    pub end_timestamp: i64,
}