// Market Infrastructure Model (src/types/market.d.ts)

export type StallStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'UNDER_REVIEW';

export interface MarketStall {
  id: string;
  code: string; // e.g., "KLA-NAK-A01"
  section: string; // e.g., "Produce", "Textiles"
  status: StallStatus;
  currentVendor?: {
    id: string;
    name: string;
    nin: string;
  };
  monthlyRate: number;
  lastPaymentDate?: string;
}