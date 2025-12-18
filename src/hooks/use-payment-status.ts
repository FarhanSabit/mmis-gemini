// src/hooks/use-payment-status.ts
"use client";

import { useState, useEffect } from "react";

export function usePaymentStatus(transactionId: string | null) {
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED">("PENDING");

  useEffect(() => {
    if (!transactionId) return;

    // Use WSS for production security
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    const ws = new WebSocket(`${wsUrl}/payments`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.transactionId === transactionId) {
          setStatus(data.status);
        }
      } catch (error) {
        console.error("WebSocket Message Error:", error);
      }
    };

    return () => ws.close();
  }, [transactionId]);

  return status;
}