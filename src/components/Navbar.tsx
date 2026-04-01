import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WalletButton from "./WalletButton";

const links = [
  { label: "Journey", href: "#journey" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Freshness", href: "#freshness" },
  { label: "Fund", href: "#fund" },
  { label: "Join", href: "#cta" },
];

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
        >
          <div className="container mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-earth">
              FarmChain
            </span>
            <div className="hidden md:flex items-center gap-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <WalletButton />
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;
