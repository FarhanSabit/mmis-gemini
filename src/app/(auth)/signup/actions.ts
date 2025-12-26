// Signup Server Action (src/app/(auth)/signup/actions.ts)



"use server";



import { redirect } from "next/navigation";

import { SignupSchema } from "@/lib/validations/signup";



export async function signupAction(prevState: any, formData: FormData) {

  const rawData = Object.fromEntries(formData.entries());

  // Handle the checkbox boolean conversion

  const dataToValidate = { ...rawData, consentToVerify: rawData.consentToVerify === "on" };

  

  const validated = SignupSchema.safeParse(dataToValidate);

  if (!validated.success) {

    return { error: "Validation failed", fields: validated.error.flatten().fieldErrors };

  }



  try {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register-vendor`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(validated.data),

    });



    const result = await response.json();



    if (!response.ok) {

      // Specifically handle NIRA verification failures

      return { error: result.message || "Identity verification failed with NIRA." };

    }



    // Success: Vendor record is digitally signed to ensure non-repudiation

  } catch (err) {

    return { error: "Connection to identity services timed out. Please try again." };

  }



  redirect("/login?signup=success");

}