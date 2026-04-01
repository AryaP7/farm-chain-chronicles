import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export { connection };

/** Build a memo transaction with a JSON payload */
function buildMemoTx(
  payer: PublicKey,
  type: string,
  data: Record<string, unknown>
): Transaction {
  const payload = JSON.stringify({ type, ...data, ts: Date.now() });
  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(payload),
    })
  );
  return tx;
}

export async function registerFarmer(
  payer: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>,
  farmerName: string
) {
  const tx = buildMemoTx(payer, "REGISTER_FARMER", { name: farmerName });
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export async function registerRetailer(
  payer: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>,
  retailerName: string
) {
  const tx = buildMemoTx(payer, "REGISTER_RETAILER", { name: retailerName });
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export async function trackProduce(
  payer: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>,
  produceData: { crop: string; weight: number; location: string }
) {
  const tx = buildMemoTx(payer, "TRACK_PRODUCE", produceData);
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export function getExplorerUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
