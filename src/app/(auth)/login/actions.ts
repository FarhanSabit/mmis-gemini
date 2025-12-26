// Server Action (src/app/(auth)/login/actions.ts)

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginSchema } from "@/lib/validations/auth";

export async function loginAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = LoginSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Invalid form data", fields: validated.error.flatten().fieldErrors };
  }

  try {
    // Proxying to our Express Backend via the BFF layer
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.message || "Authentication failed" };
    }

    // Set secure, HttpOnly session cookies
    const cookieStore = await cookies();
    cookieStore.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    cookieStore.set("user_role", result.user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch (err) {
    return { error: "An unexpected error occurred. Please try again." };
  }

  // Role-based redirection
  redirect("/dashboard"); 
}