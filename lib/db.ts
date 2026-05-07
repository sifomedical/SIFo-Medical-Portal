import { createClient } from "@supabase/supabase-js";
import { User, UserStatus } from "@/types/user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get user by email from Supabase
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      status: data.status as UserStatus,
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      approvedBy: data.approved_by,
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      status: data.status as UserStatus,
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      approvedBy: data.approved_by,
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Create new user
export async function createUser(
  user: Omit<User, "createdAt" | "id">
): Promise<User> {
  try {
    // Check if user already exists
    const existing = await getUserByEmail(user.email);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const adminEmail = process.env.ADMIN_EMAIL;

    // Admin is automatically approved when created
    const isAdmin = user.email === adminEmail;
    const status = isAdmin ? 'approved' : (user.status || 'pending');
    const approved_at = isAdmin ? now : undefined;

    // Don't include id in insert - let Supabase generate UUID
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: user.email,
          name: user.name,
          status: status,
          created_at: now,
          ...(approved_at ? { approved_at } : {}),
          // Don't set approved_by - it's a UUID and we don't have it yet
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error saving user to database:", error);
      // Return the user object even if database save fails
      // This allows login to proceed (important for admins)
      return {
        id: `temp_${Date.now()}`,
        email: user.email,
        name: user.name,
        status: user.status || 'pending',
        createdAt: new Date(now),
        approvedAt: undefined,
        approvedBy: undefined,
      };
    }

    if (!data) {
      return {
        id: `temp_${Date.now()}`,
        email: user.email,
        name: user.name,
        status: user.status || 'pending',
        createdAt: new Date(now),
        approvedAt: undefined,
        approvedBy: undefined,
      };
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      status: data.status as UserStatus,
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      approvedBy: data.approved_by,
    };
  } catch (error) {
    console.error("❌ Exception creating user:", error);
    // Don't throw - allow login to proceed (especially for admin)
    return {
      id: `temp_${Date.now()}`,
      email: user.email,
      name: user.name,
      status: user.status || 'pending',
      createdAt: new Date(),
      approvedAt: undefined,
      approvedBy: undefined,
    };
  }
}

// Update user status
export async function updateUserStatus(
  email: string,
  status: UserStatus,
  approvedBy?: string
): Promise<User | null> {
  try {
    console.log("🔍 UPDATING USER STATUS - Email:", email, "Status:", status);

    const now = new Date().toISOString();
    const updates: any = {
      status: status,
    };

    if (status === "approved" || status === "rejected") {
      updates.approved_at = now;
    }

    console.log("📝 UPDATE PAYLOAD:", updates);

    // Update user directly without checking if exists first
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email)
      .select()
      .single();

    console.log("📊 UPDATE RESPONSE:", {
      hasError: !!error,
      error: error?.message,
      hasData: !!data,
      dataEmail: data?.email,
      dataStatus: data?.status,
    });

    if (error) {
      console.error(`❌ Error updating user status for ${email}:`, error);
      return null;
    }

    if (!data) {
      console.log("⚠️ UPDATE RETURNED NO DATA");
      return null;
    }

    console.log("✅ USER STATUS UPDATED SUCCESSFULLY");

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      status: data.status as UserStatus,
      createdAt: new Date(data.created_at),
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      approvedBy: data.approved_by,
    };
  } catch (error) {
    console.error("❌ Exception updating user status:", error);
    return null;
  }
}

// Get all pending users
export async function getAllPendingUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status as UserStatus,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      approvedBy: row.approved_by,
    }));
  } catch (error) {
    console.error("Error getting pending users:", error);
    return [];
  }
}

// Get all approved users
export async function getAllApprovedUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status as UserStatus,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      approvedBy: row.approved_by,
    }));
  } catch (error) {
    console.error("Error getting approved users:", error);
    return [];
  }
}

// Get all rejected users
export async function getAllRejectedUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status as UserStatus,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      approvedBy: row.approved_by,
    }));
  } catch (error) {
    console.error("Error getting rejected users:", error);
    return [];
  }
}

// Delete user
export async function deleteUser(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', email);

    if (error) {
      console.error("Error deleting user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
