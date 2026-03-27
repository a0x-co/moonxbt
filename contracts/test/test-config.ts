/**
 * Test configuration and utilities
 * This file contains shared configuration and utilities for tests
 */

import hre from "hardhat";
import { parseEther, parseGwei } from "viem";

// Common test values
export const TEST_VALUES = {
  // Token amounts
  INITIAL_SUPPLY: parseEther("1000000"),
  BIDDER_BALANCE: parseEther("1000"),
  BID_AMOUNT_1: parseEther("10"),
  BID_AMOUNT_2: parseEther("20"),
  BID_AMOUNT_3: parseEther("30"),
  
  // Time values
  ONE_DAY: BigInt(24 * 60 * 60),
  TWO_DAYS: BigInt(2 * 24 * 60 * 60),
  
  // Resource values
  RESOURCE_NAME: "QR Destination URL",
  DEFAULT_VALUE: "https://qrcoin.fun",
  RESOURCE_VALUE_1: "https://example1.com",
  RESOURCE_VALUE_2: "https://example2.com",
  RESOURCE_VALUE_3: "https://example3.com",
  
  // Token details
  TOKEN_NAME: "Mock Token",
  TOKEN_SYMBOL: "MTK",
  
  // Gas values
  MAX_FEE_PER_GAS: parseGwei("1.5"),
  MAX_PRIORITY_FEE_PER_GAS: parseGwei("0.1"),
  
  // Zero address
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000"
};

/**
 * Utility function to get wallet clients for testing
 * @returns Array of wallet clients [owner, bidder1, bidder2, bidder3]
 */
export async function getTestWallets() {
  const [owner, bidder1, bidder2, bidder3] = await hre.viem.getWalletClients();
  return { owner, bidder1, bidder2, bidder3 };
}

/**
 * Utility function to deploy the mock token
 * @returns Deployed mock token contract
 */
export async function deployMockToken() {
  const { owner } = await getTestWallets();
  
  return await hre.viem.deployContract("MockERC20", [
    TEST_VALUES.TOKEN_NAME,
    TEST_VALUES.TOKEN_SYMBOL,
    TEST_VALUES.INITIAL_SUPPLY
  ]);
}

/**
 * Utility function to deploy the TokenAuction contract
 * @param mockTokenAddress Address of the mock token to use for bidding
 * @returns Deployed TokenAuction contract
 */
export async function deployTokenAuction(mockTokenAddress: string) {
  void mockTokenAddress;
  // Use type assertion to bypass the type checking
  return await (hre.viem.deployContract as any)("TokenAuction", [
    TEST_VALUES.RESOURCE_NAME,
    TEST_VALUES.DEFAULT_VALUE
  ]);
}

/**
 * Utility function to set up a complete test environment
 * @returns Object containing all deployed contracts and test wallets
 */
export async function setupTestEnvironment() {
  const { owner, bidder1, bidder2, bidder3 } = await getTestWallets();
  
  // Deploy mock token
  const mockToken = await deployMockToken();
  
  // Mint tokens to bidders
  await mockToken.write.mint([bidder1.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
  await mockToken.write.mint([bidder2.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
  await mockToken.write.mint([bidder3.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
  
  // Deploy TokenAuction
  const tokenAuction = await deployTokenAuction(mockToken.address);
  
  // Approve token spending for bidders
  await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder1.account });
  await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder2.account });
  await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder3.account });
  
  // Get public client
  const publicClient = await hre.viem.getPublicClient();
  
  return {
    mockToken,
    tokenAuction,
    owner,
    bidder1,
    bidder2,
    bidder3,
    publicClient
  };
}
