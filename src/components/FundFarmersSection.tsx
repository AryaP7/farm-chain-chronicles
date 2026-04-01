import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import fundImg from "@/assets/fund-farmers.jpg";

const FundFarmersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 md:py-32 paper-texture bg-card overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="rounded-sm overflow-hidden border border-border shadow-lg"
          >
            <img
              src={fundImg}
              alt="Community funding farmers illustration"
              className="w-full h-auto"
              loading="lazy"
              width={1280}
              height={720}
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-earth font-bold mb-6">
              Fund Farmers
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              Invest directly in local farms through Solana-based crowdfunding. 
              Fund a crop cycle and receive a share of the harvest — transparent, 
              traceable, and trust-minimized.
            </p>
            <ul className="space-y-4 font-body text-foreground">
              {[
                "Browse verified farmer profiles and crop plans",
                "Fund with SOL on Solana devnet — instant settlement",
                "Track crop growth via on-chain status updates",
                "Receive harvest share or return at maturity",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-olive mt-1 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C8 4 12 4 12 8C12 12 8 16 8 16C8 16 4 12 4 8C4 4 8 4 8 0Z" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FundFarmersSection;
