import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition Module for deploying the TokenAuction contract
 *
 * This module defines how to deploy the TokenAuction contract with configurable parameters.
 * All parameters can be overridden when running the deployment.
 *
 * Example usage:
 * ```
 * npx hardhat ignition deploy ignition/modules/TokenAuction.ts --network base --parameters resourceName="Video Prompt URL",defaultResourceValue="https://www.moonxbt.fun/moonxbt/video"
 * ```
 */
export default buildModule("TokenAuctionModule", (m) => {
  const resourceName = m.getParameter(
    "resourceName",
    "Video Prompt URL"
  );

  const defaultResourceValue = m.getParameter(
    "defaultResourceValue",
    "https://www.moonxbt.fun/moonxbt/video"
  );

  const tokenAuction = m.contract("TokenAuction", [
    resourceName,
    defaultResourceValue,
  ]);

  return { tokenAuction };
});
