"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Route, Map, History } from "lucide-react";

const features = [
  {
    icon: Route,
    title: "Real route search",
    description:
      "Type any two places and get actual road geometry with distance and travel time, computed live by the OSRM routing engine on OpenStreetMap data.",
  },
  {
    icon: Map,
    title: "Traffic at a glance",
    description:
      "Heatmap, density, and peak views show where congestion builds up, with per corridor delays so you can time your departure better.",
  },
  {
    icon: History,
    title: "History that remembers",
    description:
      "Every route you plan is saved locally. Reopen it, replay it on the map, and track totals without signing up for anything.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="features"
      className="py-24 px-6 bg-[#FAFAFA] border-t border-[#E8E8E8]"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B6B6B] mb-4"
        >
          What it does
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#111111] text-center mb-6 tracking-tight"
        >
          Three tools, one calm commute
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="rounded-xl border border-[#E8E8E8] bg-white p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111111] mb-5">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
