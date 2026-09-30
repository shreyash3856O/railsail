"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, Route, Scale, Bookmark } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search places",
    description: "Place search runs on open map data, biased to your city",
  },
  {
    icon: Route,
    title: "Get real geometry",
    description: "OSRM returns the road path, distance, and duration",
  },
  {
    icon: Scale,
    title: "Compare profiles",
    description: "Drive, train, bus, auto, walk, and cycle compared side by side",
  },
  {
    icon: Bookmark,
    title: "Save and replay",
    description: "Keep any route in history and reopen it later",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="py-24 px-6 bg-white border-t border-[#E8E8E8]"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B6B6B] mb-4"
        >
          Process
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#111111] text-center mb-16 tracking-tight"
        >
          How it works
        </motion.h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex flex-col items-start"
            >
              <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] w-12 h-12 flex items-center justify-center mb-4 shrink-0">
                <step.icon className="h-5 w-5 text-[#111111]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] mb-1">
                Step {i + 1}
              </p>
              <h3 className="font-semibold text-[#111111] mb-1">{step.title}</h3>
              <p className="text-sm text-[#6B6B6B]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
