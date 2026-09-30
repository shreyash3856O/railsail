const SETTINGS_KEY = "railsail_settings";

export interface UserSettings {
  preferredTransport: "Drive" | "Walk" | "Cycle";
  trafficAlerts: boolean;
  routeUpdates: boolean;
}

const defaults: UserSettings = {
  preferredTransport: "Drive",
  trafficAlerts: true,
  routeUpdates: true,
};

export function getSettings(): UserSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    const parsed = data ? { ...defaults, ...JSON.parse(data) } : defaults;
    if (!["Drive", "Walk", "Cycle"].includes(parsed.preferredTransport)) {
      parsed.preferredTransport = defaults.preferredTransport;
    }
    return parsed;
  } catch {
    return defaults;
  }
}

export function updateSettings(updates: Partial<UserSettings>): void {
  const current = getSettings();
  const next = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}
