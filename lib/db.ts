import { kv } from "@vercel/kv";
import { User, UserStatus } from "@/types/user";

// Helper function to generate unique ID
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await kv.get<User>(`user:email:${email}`);
    return user || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await kv.get<User>(`user:id:${id}`);
    return user || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Create new user
export async function createUser(
  user: Omit<User, "createdAt">
): Promise<User> {
  try {
    // Check if user already exists
    const existing = await getUserByEmail(user.email);
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

    // Store user by email and by ID
    await kv.set(`user:email:${user.email}`, newUser);
    await kv.set(`user:id:${id}`, newUser);

    // Add email to users list for quick lookup
    await kv.sadd("users:all", user.email);
    await kv.sadd("users:pending", user.email);

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Update user status
export async function updateUserStatus(
  email: string,
  status: UserStatus,
  approvedBy?: string
): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return null;
    }

    user.status = status;
    if (status === "approved" || status === "rejected") {
      user.approvedAt = new Date();
      user.approvedBy = approvedBy || undefined;
    }

    // Update user data
    await kv.set(`user:email:${email}`, user);
    await kv.set(`user:id:${user.id}`, user);

    // Update status sets
    await kv.srem("users:pending", email);
    await kv.srem("users:approved", email);
    await kv.srem("users:rejected", email);

    if (status === "pending") {
      await kv.sadd("users:pending", email);
    } else if (status === "approved") {
      await kv.sadd("users:approved", email);
    } else if (status === "rejected") {
      await kv.sadd("users:rejected", email);
    }

    return user;
  } catch (error) {
    console.error("Error updating user status:", error);
    return null;
  }
}

// Get all pending users
export async function getAllPendingUsers(): Promise<User[]> {
  try {
    const emails = await kv.smembers("users:pending");
    const users: User[] = [];

    for (const email of emails) {
      const user = await getUserByEmail(email);
      if (user) {
        users.push(user);
      }
    }

    // Sort by creation date
    return users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
  } catch (error) {
    console.error("Error getting pending users:", error);
    return [];
  }
}

// Get all approved users
export async function getAllApprovedUsers(): Promise<User[]> {
  try {
    const emails = await kv.smembers("users:approved");
    const users: User[] = [];

    for (const email of emails) {
      const user = await getUserByEmail(email);
      if (user) {
        users.push(user);
      }
    }

    // Sort by approval date (newest first)
    return users.sort((a, b) => {
      const dateA = new Date(a.approvedAt || 0).getTime();
      const dateB = new Date(b.approvedAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting approved users:", error);
    return [];
  }
}

// Get all rejected users
export async function getAllRejectedUsers(): Promise<User[]> {
  try {
    const emails = await kv.smembers("users:rejected");
    const users: User[] = [];

    for (const email of emails) {
      const user = await getUserByEmail(email);
      if (user) {
        users.push(user);
      }
    }

    // Sort by creation date (newest first)
    return users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error getting rejected users:", error);
    return [];
  }
}

// Delete user
export async function deleteUser(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return false;
    }

    // Delete user data
    await kv.del(`user:email:${email}`);
    await kv.del(`user:id:${user.id}`);

    // Remove from status sets
    await kv.srem("users:all", email);
    await kv.srem("users:pending", email);
    await kv.srem("users:approved", email);
    await kv.srem("users:rejected", email);

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
