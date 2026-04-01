import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import journeyMap from "@/assets/journey-map.jpg";

const stages = [
  {
    name: "Farm",
    icon: "🌾",
    description: "Crops are harvested and tagged with a unique QR identity on a Solana-powered crate.",
    position: { top: "35%", left: "10%" },
  },
  {
    name: "Transport",
    icon: "🚛",
    description: "Produce is weighed, loaded, and tracked in real-time as it moves to the aggregation point.",
    position: { top: "30%", left: "28%" },
  },
  {
    name: "Aggregator",
    icon: "🏭",
    description: "Batches are consolidated, quality-checked, and freshness scores recorded on-chain.",
    position: { top: "25%", left: "48%" },
  },
  {
    name: "Market",
    icon: "🏪",
    description: "Produce arrives at wholesale markets where weight verification confirms supply integrity.",
    position: { top: "40%", left: "60%" },
  },
  {
    name: "Retail Store",
    icon: "🛒",
    description: "Retailers receive verified, blockchain-stamped produce ready for consumer shelves.",
    position: { top: "55%", left: "75%" },
  },
  {
    name: "Consumer",
    icon: "📱",
    description: "Consumers scan the QR code to see the complete journey — from soil to store.",
    position: { top: "50%", left: "90%" },
  },
];

const JourneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="journey" className="relative py-24 md:py-32 paper-texture overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-earth font-bold mb-4">
            The Journey
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Follow the path of your food as it travels from the earth to your table.
          </p>
        </motion.div>

        {/* Map with stages */}
        <div className="relative max-w-5xl mx-auto rounded-sm overflow-hidden border border-border shadow-lg">
          <img
            src={journeyMap}
            alt="Supply chain journey map"
            className="w-full h-auto"
            loading="lazy"
            width={1920}
            height={1080}
          />

          {/* Stage markers */}
          {stages.map((stage, i) => (
            <motion.div
              key={stage.name}
              className="absolute group"
              style={stage.position}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
            >
              {/* Pulse ring */}
              <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDuration: "3s" }} />

              {/* Marker */}
              <div className="relative w-10 h-10 md:w-12 md:h-12 bg-card border-2 border-primary rounded-full
                flex items-center justify-center text-lg md:text-xl cursor-pointer
                hover:scale-110 transition-transform duration-300 shadow-md z-10">
                {stage.icon}
              </div>

              {/* Info card */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 md:w-56
                bg-card/95 backdrop-blur-sm border border-border rounded-sm p-3 shadow-lg
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <h3 className="font-display text-sm font-bold text-earth mb-1">{stage.name}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{stage.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
