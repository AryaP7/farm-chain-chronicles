import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-landscape.jpg";

const FogLayer = ({ delay = 0, top = "60%" }: { delay?: number; top?: string }) => (
  <div
    className="fog-layer absolute left-0 right-0 h-32 pointer-events-none opacity-40"
    style={{
      top,
      animationDelay: `${delay}s`,
      background: "linear-gradient(90deg, transparent, hsl(38 45% 90% / 0.6), transparent)",
    }}
  />
);

const Bird = ({ delay = 0, top = "15%" }: { delay?: number; top?: string }) => (
  <div
    className="bird absolute pointer-events-none text-earth/40"
    style={{ top, left: "-5%", animationDelay: `${delay}s`, animationDuration: `${18 + delay * 3}s` }}
  >
    <svg width="20" height="10" viewBox="0 0 20 10" fill="currentColor">
      <path d="M0 5 Q5 0 10 5 Q15 0 20 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  </div>
);

const Leaf = ({ delay = 0, left = "30%" }: { delay?: number; left?: string }) => (
  <div
    className="leaf absolute pointer-events-none text-olive/50"
    style={{ left, top: "-5%", animationDelay: `${delay}s`, animationDuration: `${10 + delay * 2}s` }}
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 0 C9 3 14 5 14 9 C14 12 11 14 7 14 C3 14 0 12 0 9 C0 5 5 3 7 0Z" />
    </svg>
  </div>
);

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;
  const scale = 1 + scrollY * 0.0003;
  const opacity = Math.max(0, 1 - scrollY / 800);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden paper-texture">
      {/* Sun glow */}
      <div
        className="sun-glow absolute top-10 right-20 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(42 80% 75% / 0.5), transparent 70%)",
        }}
      />

      {/* Hero landscape with parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxOffset}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={heroImg}
          alt="FarmChain illustrated countryside landscape"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Sepia overlay */}
        <div className="absolute inset-0 bg-background/30 mix-blend-multiply" />
      </div>

      {/* Ambient elements */}
      <FogLayer delay={0} top="65%" />
      <FogLayer delay={5} top="75%" />
      <Bird delay={0} top="12%" />
      <Bird delay={7} top="20%" />
      <Bird delay={12} top="8%" />
      <Leaf delay={0} left="20%" />
      <Leaf delay={4} left="50%" />
      <Leaf delay={8} left="75%" />
      <Leaf delay={2} left="40%" />

      {/* Content overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center px-6"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-earth tracking-tight mb-6"
            style={{ textShadow: "0 2px 20px hsl(38 45% 90% / 0.8)" }}
          >
            FarmChain
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="font-body text-xl md:text-2xl text-earth-light max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ textShadow: "0 1px 10px hsl(38 45% 90% / 0.9)" }}
          >
            Tracking food from soil to store with trust, transparency and accountability.
          </motion.p>
          <motion.a
            href="#journey"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-display text-lg rounded-sm
              border border-sepia/30 hover:bg-sepia-light transition-colors duration-500 cursor-pointer"
          >
            Explore the Supply Chain
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 flex flex-col items-center text-earth-light/60"
        >
          <span className="font-body text-sm mb-2">Scroll to begin</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 8 L10 13 L15 8" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
