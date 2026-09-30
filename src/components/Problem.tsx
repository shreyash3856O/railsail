"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check } from "lucide-react";

export function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="problem"
      className="py-24 px-6 bg-white border-t border-[#E8E8E8]"
    >
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#111111] text-center mb-6 tracking-tight"
        >
          Commuting should not
          <br />
          waste your time.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-[#6B6B6B] max-w-2xl mx-auto mb-16"
        >
          Guessing routes, stale screenshots of maps, and disconnected tools
          turn every commute into a chore. RailSail keeps search, routing,
          and history in one calm place.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-xl border border-[#E8E8E8] bg-white p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <X className="h-6 w-6 text-[#8A8A8A]" />
              <h3 className="font-semibold text-[#111111]">
                The usual way
              </h3>
            </div>
            <ul className="space-y-3 text-[#6B6B6B]">
              <li>Routes typed fresh every single day</li>
              <li>Times and distances from memory</li>
              <li>No record of what worked last week</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-xl border border-[#111111] bg-[#111111] p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Check className="h-6 w-6 text-white" />
              <h3 className="font-semibold text-white">
                With RailSail
              </h3>
            </div>
            <ul className="space-y-3 text-[#C9C9C9]">
              <li>Real routes from live routing data</li>
              <li>Drive, walk, and cycle compared side by side</li>
              <li>Every search saved to your trip history</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
