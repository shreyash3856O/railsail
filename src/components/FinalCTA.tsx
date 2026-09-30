"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-[#111111]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl lg:text-5xl text-white mb-6 tracking-tight">
          Plan your first real route
        </h2>
        <p className="text-[#C9C9C9] mb-10 max-w-xl mx-auto">
          Search two places and see the road, the distance, and the time.
          Free, no account required.
        </p>
        <Link
          href="/dashboard/planner"
          className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-medium text-[#111111] transition-colors hover:bg-[#E8E8E8]"
        >
          Open the route planner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
