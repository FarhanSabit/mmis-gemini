// Notification Schema (src/lib/validations/notification.ts)

import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["PAYMENT", "KYC_UPDATE", "SYSTEM_ALERT", "ADMIN_MESSAGE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type Notification = z.infer<typeof NotificationSchema>;