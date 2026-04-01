import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const grades = [
  { grade: "A+", range: "95–100%", color: "bg-olive text-accent-foreground", desc: "Pristine freshness" },
  { grade: "A", range: "85–94%", color: "bg-olive-light text-accent-foreground", desc: "Excellent quality" },
  { grade: "B", range: "70–84%", color: "bg-gold text-earth", desc: "Good condition" },
  { grade: "C", range: "50–69%", color: "bg-gold-light text-earth", desc: "Acceptable" },
  { grade: "D", range: "< 50%", color: "bg-destructive text-destructive-foreground", desc: "Poor — flagged" },
];

const FreshnessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 md:py-32 paper-texture overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-earth font-bold mb-4">
            Freshness Score
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto">
            A transparent, weight-based quality metric recorded immutably on Solana.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Formula visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Animated scale */}
            <div className="relative mb-8">
              <svg viewBox="0 0 200 160" className="w-56 h-44 text-sepia">
                {/* Base */}
                <line x1="60" y1="140" x2="140" y2="140" stroke="currentColor" strokeWidth="3" />
                <line x1="100" y1="140" x2="100" y2="40" stroke="currentColor" strokeWidth="2" />
                {/* Beam */}
                <motion.g
                  animate={isInView ? { rotate: [-5, 3, -2, 0] } : {}}
                  transition={{ duration: 3, delay: 0.5 }}
                  style={{ transformOrigin: "100px 40px" }}
                >
                  <line x1="30" y1="40" x2="170" y2="40" stroke="currentColor" strokeWidth="2.5" />
                  {/* Left pan */}
                  <path d="M20 45 Q30 70 50 45" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <line x1="30" y1="40" x2="20" y2="45" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="40" x2="50" y2="45" stroke="currentColor" strokeWidth="1" />
                  <text x="35" y="60" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="serif">W₀</text>
                  {/* Right pan */}
                  <path d="M150 45 Q160 70 180 45" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <line x1="170" y1="40" x2="150" y2="45" stroke="currentColor" strokeWidth="1" />
                  <line x1="170" y1="40" x2="180" y2="45" stroke="currentColor" strokeWidth="1" />
                  <text x="165" y="60" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="serif">Wᵈ</text>
                </motion.g>
                {/* Triangle pivot */}
                <polygon points="94,38 106,38 100,30" fill="currentColor" />
              </svg>
            </div>

            {/* Formula */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1, duration: 0.8 }}
              className="bg-card border border-border rounded-sm p-6 text-center shadow-sm"
            >
              <p className="font-body text-sm text-muted-foreground mb-3">Freshness Rating Score</p>
              <div className="font-display text-2xl md:text-3xl text-earth">
                FRS = <span className="inline-block mx-1">
                  <span className="block text-lg border-b border-earth">W<sub>dest</sub></span>
                  <span className="block text-lg">W<sub>origin</sub></span>
                </span> × 100
              </div>
            </motion.div>
          </motion.div>

          {/* Grade levels */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            {grades.map((g, i) => (
              <motion.div
                key={g.grade}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
                className="flex items-center gap-4 p-3 bg-card/60 border border-border/50 rounded-sm"
              >
                <div className={`grade-badge ${g.color} text-sm`}>{g.grade}</div>
                <div>
                  <p className="font-display text-sm font-bold text-earth">{g.desc}</p>
                  <p className="font-body text-xs text-muted-foreground">{g.range}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FreshnessSection;
