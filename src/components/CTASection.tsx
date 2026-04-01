import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { registerFarmer, registerRetailer, trackProduce, getExplorerUrl } from "@/lib/solana";
import { useToast } from "@/hooks/use-toast";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    setLoading(action);
    try {
      let sig: string;
      switch (action) {
        case "farmer":
          sig = await registerFarmer(publicKey, sendTransaction, "Demo Farmer");
          break;
        case "retailer":
          sig = await registerRetailer(publicKey, sendTransaction, "Demo Retailer");
          break;
        case "track":
          sig = await trackProduce(publicKey, sendTransaction, {
            crop: "Organic Tomatoes",
            weight: 50,
            location: "Farm Alpha",
          });
          break;
        default:
          return;
      }

      toast({
        title: "✅ Transaction Confirmed!",
        description: (
          <a
            href={getExplorerUrl(sig)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-sepia-light hover:text-sepia"
          >
            View on Solana Explorer →
          </a>
        ),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      toast({
        title: "Transaction Failed",
        description: message.includes("rejected")
          ? "You rejected the transaction."
          : message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const buttons = [
    { label: "Register Farmer", icon: "🌱", action: "farmer" },
    { label: "Become Retailer", icon: "🏪", action: "retailer" },
    { label: "Track Produce", icon: "📍", action: "track" },
  ];

  return (
    <section id="cta" className="relative py-24 md:py-32 paper-texture overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-6xl text-earth font-bold mb-6">
            Join FarmChain
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-4 leading-relaxed">
            Be part of the transparent food revolution. Built on Solana devnet
            for speed, trust, and minimal cost.
          </p>

          {!connected && (
            <p className="font-body text-sm text-sepia-light mb-8 italic">
              Connect your wallet to interact with Solana devnet →
            </p>
          )}
          {connected && publicKey && (
            <p className="font-body text-sm text-olive mb-8">
              🟢 Connected: {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((btn, i) => (
              <motion.button
                key={btn.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                onClick={() => handleAction(btn.action)}
                disabled={loading !== null}
                className="group px-6 py-3 bg-primary text-primary-foreground font-display text-base
                  rounded-sm border border-sepia/30 hover:bg-sepia-light disabled:opacity-50
                  transition-all duration-500 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading === btn.action ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>{btn.icon}</span>
                )}
                <span>{btn.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="h-px w-24 bg-border mx-auto mb-6" />
          <p className="font-body text-sm text-muted-foreground/60 italic">
            "From the earth, through trusted hands, to your table."
          </p>
          <p className="font-body text-xs text-muted-foreground/40 mt-4">
            FarmChain © 2026 • Solana Devnet
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
