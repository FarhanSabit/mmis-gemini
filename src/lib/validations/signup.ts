// NIRA Verification Schema (src/lib/validations/signup.ts)



import { z } from "zod";



export const SignupSchema = z.object({

  fullName: z.string().min(3, "Full name is required"),

  email: z.string().email("Invalid email"),

  phoneNumber: z.string().regex(/^\+256\d{9}$/, "Must be a valid Ugandan number (+256...)"),

  nin: z.string().length(14, "NIN must be exactly 14 characters"), // Standard Ugandan NIN length

  fingerprintData: z.string().optional(), // Base64 encoded template from POS hardware

  password: z.string().min(8, "Password must be at least 8 characters"),

  consentToVerify: z.literal(true, {

    errorMap: () => ({ message: "You must consent to NIRA verification" }),

  }),

});



export type SignupInput = z.infer<typeof SignupSchema>;