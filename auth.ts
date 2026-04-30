import { getServerSession } from "next-auth/next";

export const getAuth = () => getServerSession();
