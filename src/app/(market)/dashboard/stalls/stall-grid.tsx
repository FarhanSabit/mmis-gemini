// src/app/(market)/dashboard/stalls/stall-grid.tsx
"use client";

import { MarketStall } from "@/types/market";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, User, AlertCircle } from "lucide-react";

export function StallGrid({ stalls }: { stalls: MarketStall[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {stalls.map((stall) => (
        <Card key={stall.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold">{stall.code}</CardTitle>
            <Badge 
              variant={stall.status === 'VACANT' ? 'secondary' : 'default'}
              className={stall.status === 'OCCUPIED' ? 'bg-green-600' : ''}
            >
              {stall.status[0]}
            </Badge>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Store className="h-3 w-3" />
                <span>{stall.section}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">
                  {stall.currentVendor?.name || "Unassigned"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}