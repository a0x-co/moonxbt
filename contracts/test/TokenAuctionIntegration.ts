import { expect } from "chai";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { getAddress, parseEther } from "viem";

describe("TokenAuction Integration Tests", function () {
  const shouldSkipIntegrationTests = process.env.CI === "true";

  before(function () {
    if (shouldSkipIntegrationTests) {
      this.skip();
    }
  });

  describe("Contract and Ignition Module Integration", function () {
    it("keeps Ignition constructor params aligned with the contract", async function () {
      const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
      const moduleContent = fs.readFileSync(modulePath, "utf8");

      const contractPath = path.join(__dirname, "../contracts/TokenAuction.sol");
      const contractContent = fs.readFileSync(contractPath, "utf8");

      expect(contractContent).to.match(
        /constructor\s*\(\s*string memory _resourceName,\s*string memory _defaultValue/s
      );
      expect(moduleContent).to.include('const resourceName = m.getParameter(');
      expect(moduleContent).to.include(
        'const defaultResourceValue = m.getParameter('
      );
      expect(moduleContent).to.not.include("biddingTokenAddress");
      expect(moduleContent).to.include('const tokenAuction = m.contract("TokenAuction", [');
    });

    it("deploys successfully using the current constructor shape", async function () {
      const tokenAuction = await hre.viem.deployContract("TokenAuction", [
        "Video Prompt URL",
        "https://www.moonxbt.fun/moonxbt/video",
      ]);

      expect(await tokenAuction.read.resourceName()).to.equal("Video Prompt URL");
      expect(await tokenAuction.read.defaultResourceValue()).to.equal(
        "https://www.moonxbt.fun/moonxbt/video"
      );
    });
  });

  describe("Deployment Script Integration", function () {
    it("uses current constructor params and setup flow", async function () {
      const scriptPath = path.join(__dirname, "../scripts/deploy-token-auction.ts");
      const scriptContent = fs.readFileSync(scriptPath, "utf8");

      expect(scriptContent).to.include("const DEFAULT_BID_TOKEN");
      expect(scriptContent).to.include("const DEFAULT_RESOURCE_NAME");
      expect(scriptContent).to.include("const DEFAULT_RESOURCE_VALUE");
      expect(scriptContent).to.include('await hre.viem.deployContract("TokenAuction", [');
      expect(scriptContent).to.include("resourceName,");
      expect(scriptContent).to.include("defaultResourceValue,");
      expect(scriptContent).to.include("addAllowedToken");
      expect(scriptContent).to.include("setTokenPrice");
      expect(scriptContent).to.include("transferOwnership");
    });
  });

  describe("End-to-End Flow", function () {
    it("supports deploy, configure, bid and finalize with current params", async function () {
      const [owner, bidder1] = await hre.viem.getWalletClients();
      const publicClient = await hre.viem.getPublicClient();

      const mockToken = await hre.viem.deployContract("MockERC20", [
        "Mock Token",
        "MTK",
        parseEther("1000000"),
      ]);

      await mockToken.write.mint([bidder1.account.address, parseEther("1000")], {
        account: owner.account,
      });

      const tokenAuction = await hre.viem.deployContract("TokenAuction", [
        "Video Prompt URL",
        "https://www.moonxbt.fun/moonxbt/video",
      ]);

      await tokenAuction.write.addAllowedToken([mockToken.address], {
        account: owner.account,
      });
      await tokenAuction.write.setTokenPrice([mockToken.address, 100000000n], {
        account: owner.account,
      });

      await mockToken.write.approve([tokenAuction.address, parseEther("1000")], {
        account: bidder1.account,
      });

      let hash = await tokenAuction.write.placeBid(
        [mockToken.address, parseEther("10"), "https://example.com/live"],
        { account: bidder1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      await hre.network.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine", []);

      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });

      const [winner, token, amount] = await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress(bidder1.account.address));
      expect(token).to.equal(getAddress(mockToken.address));
      expect(amount).to.equal(parseEther("10"));
    });
  });
});
