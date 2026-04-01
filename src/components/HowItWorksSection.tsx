import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="12" width="32" height="28" rx="2" />
        <rect x="14" y="18" width="8" height="8" rx="1" />
        <rect x="26" y="18" width="8" height="8" rx="1" />
        <rect x="14" y="28" width="8" height="8" rx="1" />
        <rect x="26" y="28" width="8" height="8" rx="1" />
        <path d="M18 8v4M30 8v4" />
      </svg>
    ),
    title: "Register",
    desc: "Farmer registers produce with a QR-coded crate on Solana devnet.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 34 L24 6 L42 34Z" />
        <path d="M16 34 L24 18 L32 34" />
        <circle cx="24" cy="30" r="2" fill="currentColor" />
        <path d="M10 40 h28" />
      </svg>
    ),
    title: "Weigh",
    desc: "Origin weight is recorded to calculate freshness score later.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 36 h8v-12h-8z M20 36 h8v-20h-8z M32 36 h8v-16h-8z" />
        <path d="M4 36h40" />
        <circle cx="12" cy="10" r="3" />
        <path d="M12 13v5" />
      </svg>
    ),
    title: "Track",
    desc: "Produce location and conditions are tracked throughout transit.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="12" width="18" height="12" rx="2" />
        <path d="M22 16 L36 12 L36 28 L22 24Z" />
        <circle cx="10" cy="30" r="4" />
        <circle cx="28" cy="30" r="4" />
        <path d="M14 30h10" />
      </svg>
    ),
    title: "Transport",
    desc: "Trucks carry crates with live weight and GPS monitoring.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="16" width="32" height="24" rx="2" />
        <path d="M8 16 L24 4 L40 16" />
        <rect x="18" y="28" width="12" height="12" />
        <path d="M24 28v12" />
      </svg>
    ),
    title: "Store",
    desc: "Retailers verify weight, quality, and blockchain records.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="14" y="4" width="20" height="40" rx="4" />
        <rect x="18" y="14" width="12" height="12" rx="1" />
        <path d="M20 18 L22 20 L28 16" strokeWidth="2" />
        <circle cx="24" cy="38" r="2" fill="currentColor" />
      </svg>
    ),
    title: "Scan",
    desc: "Consumers scan QR to see the full journey on Solana explorer.",
  },
];

const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 paper-texture bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl text-earth font-bold mb-4">
            How It Works
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto">
            Six simple steps, fully transparent, forever on the blockchain.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="text-sepia group-hover:text-olive transition-colors duration-500 mb-4 gentle-sway"
                style={{ animationDelay: `${i * 0.5}s` }}>
                {step.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-earth mb-2">{step.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

              {/* Connector arrow (not on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/3 text-border">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Connecting line for desktop */}
        <div className="hidden lg:block max-w-6xl mx-auto mt-8">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
