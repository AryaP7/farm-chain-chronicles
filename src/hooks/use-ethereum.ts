import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contracts from "../config/contracts.json";

export function useEthereum() {
  const [account, setAccount] = useState<string | null>(null);
  const [registryContract, setRegistryContract] = useState<ethers.Contract | null>(null);
  const [batchContract, setBatchContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    // Only works if window.ethereum (MetaMask or similar) is available
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        });

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("EVM Wallet not found! Make sure Rabby or MetaMask is enabled.");
    
    // Switch to local hardhat network first
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A6C" }], // 31340
      });
    } catch (e: any) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x7A6C",
              chainName: "FarmChain Localnet 2",
              rpcUrls: [`http://${window.location.hostname}:8546`, "http://127.0.0.1:8546"],
              nativeCurrency: { name: "FCETH", symbol: "FCETH", decimals: 18 }
            }]
          });
        } catch (addError: any) {
          console.error("Add network failed:", addError);
          return alert("Could not automatically add the Hardhat network. Please add it manually in MetaMask (Chain ID: 31340, RPC: http://127.0.0.1:8546).\n\n" + addError.message);
        }
      } else {
        console.error("Switch network failed:", e);
        // If they rejected the switch, alert and return early.
        if (e.code === 4001) return;
      }
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err: any) {
      console.error("Account request error:", err);
      return alert("Failed to connect account: " + (err.message || JSON.stringify(err)));
    }
  };

  useEffect(() => {
    if (account && window.ethereum) {
      const initContracts = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const registry = new ethers.Contract(contracts.RegistryAddress, contracts.RegistryABI, signer);
        const batch = new ethers.Contract(contracts.BatchAddress, contracts.BatchABI, signer);

        setRegistryContract(registry);
        setBatchContract(batch);
      };
      initContracts();
    } else {
      setRegistryContract(null);
      setBatchContract(null);
    }
  }, [account]);

  const connectDevWallet = async () => {
    try {
      const rpcUrl = `http://${window.location.hostname}:8546`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // Hardhat Account #0 default private key
      const devSigner = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
      
      setAccount(devSigner.address);
      
      const registry = new ethers.Contract(contracts.RegistryAddress, contracts.RegistryABI, devSigner);
      const batch = new ethers.Contract(contracts.BatchAddress, contracts.BatchABI, devSigner);

      setRegistryContract(registry);
      setBatchContract(batch);
    } catch (err: any) {
      console.error(err);
      alert("Dev wallet failed: " + err.message);
    }
  };

  return { account, connectWallet, connectDevWallet, registryContract, batchContract };
}