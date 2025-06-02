"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function getCurrentUser(userId: string) {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch current user");
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to fetch user by email");
  }
}

export type UserRole =
  | "agent"
  | "percepteur"
  | "admin"
  | "membre du conseil"
  | "citizen";

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy = {
    admin: 4,
    "membre du conseil": 3,
    percepteur: 2,
    agent: 1,
    citizen: 0,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
