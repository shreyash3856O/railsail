"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  getSettings,
  updateSettings,
  type UserSettings,
} from "@/lib/settings";
import { updateUser, updatePassword } from "@/lib/auth";
import { Car, Footprints, Bike } from "lucide-react";

const transportOptions = [
  { id: "Drive" as const, label: "Drive", icon: Car },
  { id: "Walk" as const, label: "Walk", icon: Footprints },
  { id: "Cycle" as const, label: "Cycle", icon: Bike },
];

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setName(user.username);
      setEmail(user.email);
      setSettings(getSettings());
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ username: name, email });
  };

  const handleSettingsChange = (updates: Partial<UserSettings>) => {
    const next = { ...settings!, ...updates };
    setSettings(next);
    updateSettings(updates);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    const result = updatePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordMessage({ type: "success", text: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Failed" });
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111]">
          Profile & Account Settings
        </h1>
        <p className="mt-1 text-[#6B6B6B] text-sm">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User profile */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="rounded-xl border border-[#E8E8E8] bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-[#111111] mb-4">User profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-2">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#333333] transition-colors"
            >
              Save profile
            </button>
          </div>
        </motion.form>

        {/* Preferences */}
        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#E8E8E8] bg-white p-6 shadow-sm"
          >
            <h2 className="font-semibold text-[#111111] mb-4">Preferences</h2>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-3">
                Preferred transport mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {transportOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleSettingsChange({ preferredTransport: opt.id })
                    }
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                        settings.preferredTransport === opt.id
                          ? "border-[#111111] bg-[#FAFAFA] text-[#111111]"
                          : "border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
                      }`}
                  >
                    <opt.icon className="h-4 w-4 shrink-0" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications */}
        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-[#E8E8E8] bg-white p-6 shadow-sm"
          >
            <h2 className="font-semibold text-[#111111] mb-4">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[#111111]">Traffic alerts</span>
                <input
                  type="checkbox"
                  checked={settings.trafficAlerts}
                  onChange={(e) =>
                    handleSettingsChange({ trafficAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#111111]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[#111111]">Route updates</span>
                <input
                  type="checkbox"
                  checked={settings.routeUpdates}
                  onChange={(e) =>
                    handleSettingsChange({ routeUpdates: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#111111]"
                />
              </label>
            </div>
          </motion.div>
        )}

        {/* Security */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleChangePassword}
          className="rounded-xl border border-[#E8E8E8] bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-[#111111] mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-2">
                Current password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-2">
                New password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="h-11 rounded-lg border-[#E8E8E8] bg-[#FAFAFA]"
              />
            </div>
            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordMessage.type === "success"
                    ? "text-[#111111]"
                    : "text-red-600"
                }`}
              >
                {passwordMessage.text}
              </p>
            )}
            <button
              type="submit"
              className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#333333] transition-colors"
            >
              Change password
            </button>
          </div>
        </motion.form>
      </div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
