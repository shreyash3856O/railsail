"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signIn(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-8 shadow-sm">
          <Link href="/" className="text-xl font-semibold text-[#111111]">
            RailSail
          </Link>
          <h1 className="mt-6 font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111]">
            Welcome back
          </h1>
          <p className="mt-1 text-[#6B6B6B] text-sm">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#111111] py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#111111] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
