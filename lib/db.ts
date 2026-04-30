import fs from "fs";
import path from "path";
import { User, UserStatus } from "@/types/user";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize empty users file if it doesn't exist
function initializeUsersFile() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Load all users from JSON file
export function loadUsers(): User[] {
  try {
    initializeUsersFile();
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

// Save users to JSON file
function saveUsers(users: User[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users:", error);
    throw error;
  }
}

// Helper function to generate unique ID
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const users = loadUsers();
  return users.find((u) => u.email === email) || null;
}

// Get user by ID
export function getUserById(id: string): User | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

// Create new user
export function createUser(user: Omit<User, "createdAt">): User {
  const users = loadUsers();

  // Check if user already exists
  const existing = users.find((u) => u.email === user.email);
  if (existing) {
    return existing;
  }

  const id = user.id || generateId();
  const newUser: User = {
    id,
    email: user.email,
    name: user.name,
    status: "pending",
    createdAt: new Date(),
    approvedAt: undefined,
    approvedBy: undefined,
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Update user status
export function updateUserStatus(
  email: string,
  status: UserStatus,
  approvedBy?: string
): User | null {
  const users = loadUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return null;
  }

  user.status = status;
  if (status === "approved" || status === "rejected") {
    user.approvedAt = new Date();
    user.approvedBy = approvedBy || undefined;
  }

  saveUsers(users);
  return user;
}

// Get all pending users
export function getAllPendingUsers(): User[] {
  const users = loadUsers();
  return users.filter((u) => u.status === "pending").sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateA - dateB;
  });
}

// Get all approved users
export function getAllApprovedUsers(): User[] {
  const users = loadUsers();
  return users.filter((u) => u.status === "approved").sort((a, b) => {
    const dateA = new Date(a.approvedAt || 0).getTime();
    const dateB = new Date(b.approvedAt || 0).getTime();
    return dateB - dateA;
  });
}

// Get all rejected users
export function getAllRejectedUsers(): User[] {
  const users = loadUsers();
  return users.filter((u) => u.status === "rejected").sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

// Delete user
export function deleteUser(email: string): boolean {
  const users = loadUsers();
  const initialLength = users.length;
  const filtered = users.filter((u) => u.email !== email);

  if (filtered.length < initialLength) {
    saveUsers(filtered);
    return true;
  }
  return false;
}
