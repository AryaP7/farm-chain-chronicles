import { useState } from "react";
import { useEthereum } from "../hooks/use-ethereum";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function TraceabilityDemo() {
  const { account, connectWallet, connectDevWallet, batchContract } = useEthereum();
  const [weight, setWeight] = useState("");
  const [items, setItems] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const handleMint = async () => {
    if (!batchContract) return alert("Contract not connected");
    setStatus("Minting...");
    try {
      const tx = await batchContract.mintBatch(Number(weight), Number(items), type);
      await tx.wait();
      setStatus(`Success! Mined transaction ${tx.hash}`);
    } catch (e: any) {
      console.error(e);
      setStatus("Error: " + e.message);
    }
  };

  return (
    <div className="my-10 p-6 bg-slate-100 rounded-xl shadow-sm text-slate-800">
      <h2 className="text-2xl font-bold mb-4">Module 1: Traceability Core Prototype</h2>
      
      {!account ? (
        <div className="flex gap-4">
          <Button onClick={connectWallet}>Connect EVM Wallet (MetaMask)</Button>
          <Button variant="outline" onClick={connectDevWallet}>Nuke it / Connect Dev Wallet (No MetaMask)</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p>Connected: <span className="font-mono text-sm">{account}</span></p>

          <div className="bg-white p-4 rounded-lg space-y-4 max-w-sm shadow">
            <h3 className="font-semibold text-lg">Mint Produce Batch (FARMER)</h3>
            <Input placeholder="Weight (grams)" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
            <Input placeholder="Number of Items" type="number" value={items} onChange={e => setItems(e.target.value)} />
            <Input placeholder="Produce Type (e.g. Apples)" value={type} onChange={e => setType(e.target.value)} />
            <Button onClick={handleMint}>Mint Batch</Button>
          </div>

          {status && <p className="text-sm mt-4 p-2 bg-slate-200 rounded">{status}</p>}
        </div>
      )}
    </div>
  );
}