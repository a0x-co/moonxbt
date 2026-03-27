import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

const DEFAULT_TOKEN_PRICE_USD_8 = 100000000n;

describe("TokenAuction", function () {
  async function deployTokenAuctionFixture() {
    const oneDayInSecs = 24 * 60 * 60;
    const resourceName = "Video Prompt URL";
    const defaultValue = "https://www.moonxbt.fun/moonxbt/video";

    const [owner, bidder1, bidder2, treasury] = await hre.viem.getWalletClients();

    const mockToken = await hre.viem.deployContract("MockERC20", [
      "Mock Token",
      "MTK",
      parseEther("1000000"),
    ]);

    await mockToken.write.mint([bidder1.account.address, parseEther("1000")], {
      account: owner.account,
    });
    await mockToken.write.mint([bidder2.account.address, parseEther("1000")], {
      account: owner.account,
    });

    const tokenAuction = await hre.viem.deployContract("TokenAuction", [
      resourceName,
      defaultValue,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    await tokenAuction.write.addAllowedToken([mockToken.address], {
      account: owner.account,
    });
    await tokenAuction.write.setTokenPrice(
      [mockToken.address, DEFAULT_TOKEN_PRICE_USD_8],
      { account: owner.account }
    );

    await mockToken.write.approve([tokenAuction.address, parseEther("1000")], {
      account: bidder1.account,
    });
    await mockToken.write.approve([tokenAuction.address, parseEther("1000")], {
      account: bidder2.account,
    });

    return {
      tokenAuction,
      mockToken,
      owner,
      bidder1,
      bidder2,
      treasury,
      publicClient,
      oneDayInSecs,
      resourceName,
      defaultValue,
    };
  }

  describe("Deployment", function () {
    it("sets the right owner and defaults", async function () {
      const { tokenAuction, owner, resourceName, defaultValue, oneDayInSecs } =
        await loadFixture(deployTokenAuctionFixture);

      expect(await tokenAuction.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
      expect(await tokenAuction.read.resourceName()).to.equal(resourceName);
      expect(await tokenAuction.read.defaultResourceValue()).to.equal(defaultValue);
      expect(await tokenAuction.read.currentAuctionId()).to.equal(1n);
      expect(await tokenAuction.read.auctionDuration()).to.equal(
        BigInt(oneDayInSecs)
      );
    });
  });

  describe("Bidding", function () {
    it("allows placing and replacing bids", async function () {
      const { tokenAuction, mockToken, bidder1, bidder2, publicClient } =
        await loadFixture(deployTokenAuctionFixture);

      let hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/1"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("11"), "https://example.com/2"],
        { account: bidder2.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const [bidder, token, amount, resourceValue] = await tokenAuction.read.getBid([
        1n,
      ]);

      expect(bidder).to.equal(getAddress(bidder2.account.address));
      expect(token).to.equal(getAddress(mockToken.address));
      expect(amount).to.equal(parseEther("11"));
      expect(resourceValue).to.equal("https://example.com/2");
    });

    it("refunds the previous bidder on outbid", async function () {
      const { tokenAuction, mockToken, bidder1, bidder2, publicClient } =
        await loadFixture(deployTokenAuctionFixture);

      const initialBalance1 = (await mockToken.read.balanceOf([
        bidder1.account.address,
      ])) as bigint;
      const initialBalance2 = (await mockToken.read.balanceOf([
        bidder2.account.address,
      ])) as bigint;

      let hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/1"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("11"), "https://example.com/2"],
        { account: bidder2.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const finalBalance1 = (await mockToken.read.balanceOf([
        bidder1.account.address,
      ])) as bigint;
      const finalBalance2 = (await mockToken.read.balanceOf([
        bidder2.account.address,
      ])) as bigint;

      expect(finalBalance1).to.equal(initialBalance1);
      expect(finalBalance2).to.equal(initialBalance2 - parseEther("11"));
    });
  });

  describe("Finalization", function () {
    it("finalizes an ended auction and starts a new one", async function () {
      const { tokenAuction, mockToken, bidder1, publicClient, oneDayInSecs } =
        await loadFixture(deployTokenAuctionFixture);

      let hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/winner"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await time.increase(BigInt(oneDayInSecs + 1));

      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);

      const [winner, token, amount, resourceValue] =
        await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress(bidder1.account.address));
      expect(token).to.equal(getAddress(mockToken.address));
      expect(amount).to.equal(parseEther("10"));
      expect(resourceValue).to.equal("https://example.com/winner");
    });
  });

  describe("Owner Restrictions", function () {
    it("blocks removing the active bid token", async function () {
      const { tokenAuction, mockToken, bidder1, publicClient, owner } =
        await loadFixture(deployTokenAuctionFixture);

      const hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/active"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await expect(
        tokenAuction.write.removeAllowedToken([mockToken.address], {
          account: owner.account,
        })
      ).to.be.rejectedWith("Cannot remove token used by active bid");
    });

    it("blocks changing the price of the active bid token", async function () {
      const { tokenAuction, mockToken, bidder1, publicClient, owner } =
        await loadFixture(deployTokenAuctionFixture);

      const hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/active"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await expect(
        tokenAuction.write.setTokenPrice(
          [mockToken.address, DEFAULT_TOKEN_PRICE_USD_8 + 1n],
          { account: owner.account }
        )
      ).to.be.rejectedWith("Cannot change price for active bid token");
    });

    it("blocks withdrawing funds reserved by the active auction", async function () {
      const {
        tokenAuction,
        mockToken,
        bidder1,
        treasury,
        publicClient,
        owner,
      } = await loadFixture(deployTokenAuctionFixture);

      const hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/active"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await expect(
        tokenAuction.write.withdrawToken(
          [mockToken.address, treasury.account.address, parseEther("1")],
          { account: owner.account }
        )
      ).to.be.rejectedWith("Amount exceeds withdrawable balance");
    });

    it("allows withdrawing settled funds after finalization", async function () {
      const {
        tokenAuction,
        mockToken,
        bidder1,
        treasury,
        publicClient,
        owner,
        oneDayInSecs,
      } = await loadFixture(deployTokenAuctionFixture);

      let hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/settled"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await time.increase(BigInt(oneDayInSecs + 1));
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });

      const treasuryBalanceBefore = (await mockToken.read.balanceOf([
        treasury.account.address,
      ])) as bigint;

      hash = await tokenAuction.write.withdrawToken(
        [mockToken.address, treasury.account.address, parseEther("10")],
        { account: owner.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const treasuryBalanceAfter = (await mockToken.read.balanceOf([
        treasury.account.address,
      ])) as bigint;

      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(
        parseEther("10")
      );
    });
  });

  describe("Pause and Resume", function () {
    it("lets the active auction finish but prevents automatic rollover while paused", async function () {
      const {
        tokenAuction,
        mockToken,
        bidder1,
        owner,
        publicClient,
        oneDayInSecs,
      } = await loadFixture(deployTokenAuctionFixture);

      let hash = await tokenAuction.write.pauseAuctions({
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/pause"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await time.increase(BigInt(oneDayInSecs + 1));

      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tokenAuction.read.auctionsPaused()).to.equal(true);
      expect(await tokenAuction.read.currentAuctionId()).to.equal(1n);
      expect(await tokenAuction.read.auctionFinalized([1n])).to.equal(true);
    });

    it("starts the next auction on resume after a paused finalized auction", async function () {
      const {
        tokenAuction,
        mockToken,
        bidder1,
        owner,
        publicClient,
        oneDayInSecs,
      } = await loadFixture(deployTokenAuctionFixture);

      let hash = await tokenAuction.write.pauseAuctions({
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/resume"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await time.increase(BigInt(oneDayInSecs + 1));

      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.resumeAuctions({
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tokenAuction.read.auctionsPaused()).to.equal(false);
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      expect(await tokenAuction.read.auctionFinalized([1n])).to.equal(true);
      expect(await tokenAuction.read.auctionFinalized([2n])).to.equal(false);
    });

    it("does not open a new auction on resume if the current one is still live", async function () {
      const { tokenAuction, owner, publicClient } = await loadFixture(
        deployTokenAuctionFixture
      );

      let hash = await tokenAuction.write.pauseAuctions({
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      hash = await tokenAuction.write.resumeAuctions({
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tokenAuction.read.auctionsPaused()).to.equal(false);
      expect(await tokenAuction.read.currentAuctionId()).to.equal(1n);
      expect(await tokenAuction.read.auctionFinalized([1n])).to.equal(false);
    });
  });
});
