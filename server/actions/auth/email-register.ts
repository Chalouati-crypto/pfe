"use server";
import { RegisterSchema } from "@/types/register-schema";
import { actionClient } from "@/lib/safe-actions";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import { saltAndHashPassword } from "@/lib/utils";
export const emailRegister = actionClient
  .schema(RegisterSchema)
  .action(async ({ parsedInput: { email, password, name } }) => {
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
      });
      return { success: "Account Created " };
    } catch (error) {
      console.log(error);
    }
  });
