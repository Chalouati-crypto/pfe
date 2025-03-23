//server/action/email-singin.ts
"use server";
import { LoginSchema } from "@/types/login-schema";
import { actionClient } from "@/lib/safe-actions";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import { signIn } from "@/server/auth";

export const emailSignIn = actionClient
  .schema(LoginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser?.email !== email) {
      return { error: "Email not found" };
    }

    await signIn("credentials", { email, password, redirectTo: "/" });

    return { success: "User Signed in!" };
  });
