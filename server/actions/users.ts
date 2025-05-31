"use server";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import bcrypt from "bcryptjs";
import { actionClient } from "@/lib/safe-actions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getUserFromDb(email: string, pwd: string) {
  // Find user by email
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return null; // Return null if user is not found
  }

  const isMatch = await bcrypt.compare(pwd, existingUser.password!);
  console.log(isMatch);
  if (!isMatch) {
    return null; // Password mismatch
  }
  // Return user object excluding password for security
  const { password, ...userWithoutPassword } = existingUser;
  console.log(password);
  return userWithoutPassword;
}

export async function getUsers() {
  const usersList = await db.query.users.findMany();
  return usersList;
}

const deleteUserSchema = z.object({
  id: z.string().min(1),
});

export const deleteUser = actionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      // 1. Verify user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!existingUser) {
        return { error: "User not found" };
      }

      // 2. Prevent self-deletion (optional)
      // const session = await auth();
      // if (session.user?.id === id) {
      //   return { error: "Cannot delete your own account" };
      // }

      // 3. Perform deletion
      await db.delete(users).where(eq(users.id, id));

      // 4. Revalidate relevant paths
      revalidatePath("/users");

      return { success: "User deleted successfully" };
    } catch (error) {
      console.error("Delete user error:", error);
      return { error: "Failed to delete user" };
    }
  });
