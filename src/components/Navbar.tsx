"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#live-routes", label: "Live routes" },
  { href: "#how-it-works", label: "How it works" },
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
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
        scrolled
          ? "border-[#E8E8E8] bg-white"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold text-[#111111] hover:opacity-80 transition-opacity"
          >
            RailSail
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#111111] hover:text-[#6B6B6B] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-[#111111] hover:text-[#6B6B6B] transition-colors hidden md:block"
            >
              Dashboard
            </Link>
            {!isLoading &&
              (user ? (
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-[#111111] hover:text-[#6B6B6B] transition-colors hidden md:block"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-[#111111] hover:text-[#6B6B6B] transition-colors hidden md:block"
                >
                  Login
                </Link>
              ))}
            <Link
              href="/dashboard/planner"
              className="hidden sm:inline-flex rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
            >
              Find a route
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#111111]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 bg-white rounded-xl mt-2 border border-[#E8E8E8] px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-[#111111] hover:bg-[#FAFAFA] rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard/planner"
                  onClick={() => setMobileOpen(false)}
                  className="block mx-4 mt-2 text-center rounded-full bg-[#111111] py-3 text-sm font-medium text-white"
                >
                  Find a route
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
