"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export type SignInState = { error: string | null };

export async function signInWithEmail(_prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message || "Failed to sign in. Check your email and password." };
  }

  redirect("/dashboard");
}
