export interface User {
  username: string;
  email: string;
}

const STORAGE_KEY = "railsail_user";
const USERS_KEY = "railsail_users";

export interface StoredUser {
  username: string;
  email: string;
  password: string;
}

export function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function signUp(username: string, email: string, password: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email already registered" };
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: "Username already taken" };
  }
  users.push({ username, email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const user: User = { username, email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return { success: true };
}

export function signIn(email: string, password: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return { success: false, error: "Invalid email or password" };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user.username, email: user.email }));
  return { success: true };
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function updateUser(updates: Partial<User>): void {
  const user = getCurrentUser();
  if (!user) return;
  const updated = { ...user, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function updatePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "Not logged in" };
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx < 0 || users[idx].password !== currentPassword) {
    return { success: false, error: "Current password is incorrect" };
  }
  users[idx].password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}
