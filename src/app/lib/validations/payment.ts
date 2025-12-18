// Payment Schema & Constants (src/lib/validations/payment.ts)



import { z } from "zod";



export const PaymentSchema = z.object({

  stallId: z.string().uuid(),

  amount: z.number().positive(),

  phoneNumber: z.string().regex(/^\+256\d{9}$/, "Invalid Ugandan Number"),

  paymentMethod: z.enum(["MTN_MOMO", "AIRTEL_MONEY", "CASH_COUNTER"]),

  providerReference: z.string().optional(),

});



export type PaymentInput = z.infer<typeof PaymentSchema>;