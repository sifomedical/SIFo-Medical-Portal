export type UserStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  name?: string;
  status: UserStatus;
  createdAt?: Date;
  approvedAt?: Date | null;
  approvedBy?: string | null;
}

export interface UserSession {
  user: {
    id?: string;
    email: string;
    name?: string;
    image?: string;
  };
  approvalStatus: UserStatus;
  isAdmin: boolean;
  expires: string;
}
