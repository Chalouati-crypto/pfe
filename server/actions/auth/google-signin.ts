"use server";

import { signIn } from "@/server/auth";

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" });
}
