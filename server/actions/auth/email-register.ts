"use server";
import { actionClient } from "@/lib/safe-actions";
import { db } from "@/server";
import { and, eq, ne } from "drizzle-orm";
import { users } from "@/server/schema";
import { saltAndHashPassword } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { createUserSchema, updateUserSchema } from "@/types/users-schema";
export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput: { email, password, name, role } }) => {
    try {
      //check if email already in use
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingUser) {
        return { error: "email already in use" };
      }
      //hash password
      const hashedPassword = await saltAndHashPassword(password, 10);
      console.log(hashedPassword);
      await db.insert(users).values({
        email,
        name,
        password: hashedPassword,
        role,
      });
      revalidatePath("/users");
      return { success: "Account Created " };
    } catch (error) {
      console.log(error);
    }
  });
export const updateUser = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    try {
      // 1. Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, parsedInput.id),
      });

      if (!existingUser) {
        return { error: "User not found" };
      }

      // 2. Check email uniqueness if changing email
      if (parsedInput.email && parsedInput.email !== existingUser.email) {
        const emailUser = await db.query.users.findFirst({
          where: and(
            eq(users.email, parsedInput.email),
            ne(users.id, parsedInput.id)
          ),
        });

        if (emailUser) {
          return { error: "Email already in use" };
        }
      }

      // 3. Only hash password if provided
      let hashedPassword: string | undefined;
      if (parsedInput.password && parsedInput.password.trim().length > 0) {
        hashedPassword = await saltAndHashPassword(parsedInput.password, 10);
      }

      // 4. Prepare update data
      const updateData = {
        email: parsedInput.email,
        name: parsedInput.name,
        role: parsedInput.role,
        ...(hashedPassword && { password: hashedPassword }),
        updatedAt: new Date(), // Always update timestamp
      };

      // 5. Filter out undefined values
      const filteredUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      // 6. Perform update
      await db
        .update(users)
        .set(filteredUpdate)
        .where(eq(users.id, parsedInput.id));

      revalidatePath("/users");
      return { success: "User updated successfully" };
    } catch (error) {
      console.error(error);
      return { error: "Failed to update user" };
    }
  });
