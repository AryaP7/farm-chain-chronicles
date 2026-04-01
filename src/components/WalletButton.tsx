import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";

const WalletButton = () => {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-body text-sm text-sepia-light">
          🟢 {shortAddress}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 text-sm font-display border border-border rounded-sm
            text-muted-foreground hover:text-foreground hover:border-sepia transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setVisible(true)}
      className="px-4 py-2 font-display text-sm bg-primary text-primary-foreground
        rounded-sm border border-sepia/30 hover:bg-sepia-light
        transition-all duration-300 cursor-pointer"
    >
      Connect Wallet
    </motion.button>
  );
};

export default WalletButton;
