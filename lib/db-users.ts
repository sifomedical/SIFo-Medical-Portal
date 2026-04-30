// Re-export all functions from db.ts for backward compatibility
export {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserStatus,
  getAllPendingUsers,
  getAllApprovedUsers,
  getAllRejectedUsers,
  deleteUser,
} from "./db";
