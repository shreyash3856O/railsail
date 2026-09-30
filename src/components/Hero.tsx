"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/background.jpeg"
          alt="City traffic at rush hour"
          fill
          priority
          className="object-cover object-center grayscale"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-white/70" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6B6B6B]">
            RailSail
          </p>
          <h1 className="font-[family-name:var(--font-dm-serif)] text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.15] text-[#111111] tracking-tight mt-4">
            Know the route before the road.
            <br />
            Travel smarter every day.
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-2xl mx-auto text-[#333333] text-lg leading-relaxed mt-8 mb-12"
          >
            Search any place, get real road geometry with distance and time
            for driving, trains, buses, autos, walking, and cycling.
            Driving via OSRM, walking and cycling via Valhalla, trains on
            Western line rail data, buses on real GTFS timetables. No signup
            needed to explore.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/dashboard/planner"
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
            >
              Find a route
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/traffic"
              className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-white px-8 py-3.5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
            >
              <Map className="h-4 w-4" />
              View traffic
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
