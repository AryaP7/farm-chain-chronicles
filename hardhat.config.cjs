require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31340
    },
    localhost: {
      url: "http://127.0.0.1:8546",
      chainId: 31340
    }
  }
};