"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, Route, Scale, Bookmark, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search Places",
    description: "OpenStreetMap geocoding with instant local landmark resolution and autocomplete.",
  },
  {
    icon: Route,
    step: "02",
    title: "Generate Geometry",
    description: "OSRM and Valhalla return high-precision vector road geometry, turn angles, and elevation profiles.",
  },
  {
    icon: Scale,
    step: "03",
    title: "Compare Profiles",
    description: "Multi-modal analysis benchmarks Drive, Fast Rail, City Bus, Walking, and Cycling side by side.",
  },
  {
    icon: Bookmark,
    step: "04",
    title: "Replay & History",
    description: "Preserve route coordinates locally in your browser to replay, compare, or share anytime.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-white/10 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 mb-2 sm:mb-3"
          >
            System Workflow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight"
          >
            How RailSail executes
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-white text-black transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Phase {i + 1}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
