"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, ArrowRight, Route } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#live-routes", label: "Live routes" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#problem", label: "Why RailSail" },
];

const SCROLL_THRESHOLD = 10;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
    if (latest <= SCROLL_THRESHOLD) {
      setVisible(true);
      setLastScrollY(latest);
      return;
    }
    const diff = latest - lastScrollY;
    if (Math.abs(diff) < SCROLL_THRESHOLD) return;
    setVisible(diff < 0);
    setLastScrollY(latest);
  });

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
          : "border-b border-white/5 bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-18 items-center justify-between">
          {/* Logo with monochrome emblem */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              <Route className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-white font-sans">
              RailSail
            </span>
            <span className="hidden xs:inline-block rounded-full bg-white/[0.08] border border-white/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              v2.4
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors hidden md:block px-2.5 py-1.5"
            >
              Dashboard
            </Link>
            {!isLoading &&
              (user ? (
                <Link
                  href="/dashboard/profile"
                  className="text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors hidden md:block px-2.5 py-1.5"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors hidden md:block px-2.5 py-1.5"
                >
                  Login
                </Link>
              ))}

            <Link
              href="/dashboard/planner"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <span>Planner</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 sm:p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-white/[0.05]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 space-y-1 bg-black/95 rounded-2xl my-2 border border-white/10 px-3 backdrop-blur-2xl">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/10 mt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/planner"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 mt-2 w-full rounded-full bg-white py-2.5 text-xs font-semibold text-black"
                  >
                    <span>Launch Route Planner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
