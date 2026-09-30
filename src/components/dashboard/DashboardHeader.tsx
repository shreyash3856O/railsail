"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex h-16 items-center justify-between px-6 lg:px-8">
      <Link
        href="/"
        className="text-xl font-semibold text-[#111111] hover:opacity-80 transition-opacity"
      >
        RailSail
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-[#111111] bg-white px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        {!isLoading &&
          (user ? (
            <Link
              href="/dashboard/profile"
              className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-[#333333] transition-colors"
              >
                Sign up
              </Link>
            </>
          ))}
      </div>
    </div>
  );
}
