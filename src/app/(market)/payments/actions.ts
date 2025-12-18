// MoMo Integration Action (src/app/(market)/payments/actions.ts)



"use server";



import { revalidateTag } from "next-cache";

import { PaymentSchema } from "@/lib/validations/payment";



export async function initiateMoMoPayment(prevState: any, formData: FormData) {

  const rawData = Object.fromEntries(formData.entries());

  const validated = PaymentSchema.safeParse({

    ...rawData,

    amount: Number(rawData.amount),

  });



  if (!validated.success) return { error: "Invalid payment details" };



  try {

    const response = await fetch(`${process.env.BACKEND_API_URL}/api/payments/momo/push`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(validated.data),

    });



    const result = await response.json();



    if (!response.ok) throw new Error(result.message);



    // Revalidate the specific market's revenue data

    revalidateTag(`market-revenue-${validated.data.stallId}`);



    return { success: true, transactionId: result.transactionId };

  } catch (err) {

    return { error: "Failed to initiate MoMo push. Check phone connectivity." };

  }

}