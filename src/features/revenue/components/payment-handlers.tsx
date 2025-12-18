// src/features/revenue/components/payment-handler.tsx
"use client";

import { usePaymentStatus } from "@/hooks/use-payment-status";
import { Badge } from "@/components/ui/badge";

export function PaymentTracker({ transactionId }: { transactionId: string }) {
  const status = usePaymentStatus(transactionId);

  return (
    <div className="flex items-center gap-2">
      <span>Transaction Status:</span>
      <Badge variant={status === "SUCCESS" ? "default" : "outline"}>
        {status}
      </Badge>
    </div>
  );
}