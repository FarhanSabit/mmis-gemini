// src/app/(market)/dashboard/page.tsx
import { Suspense } from "react";
import { StallGrid } from "./stalls/stall-grid";
import { getMarketStalls } from "@/services/market.service";
import { Skeleton } from "@/components/ui/skeleton";

export default async function MarketMasterDashboard() {
  const stalls = await getMarketStalls("KAMPALA-CENTRAL-01");

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Nakasero Market Overview</h1>
        <p className="text-muted-foreground">Real-time stall occupancy and revenue status.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Metric Cards */}
        <Card>
          <CardHeader>Occupancy Rate</CardHeader>
          <CardContent className="text-2xl font-bold">87.5%</CardContent>
        </Card>
        {/* ... other metrics */}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stall Inventory</h2>
        <Suspense fallback={<StallGridSkeleton />}>
          <StallGrid stalls={stalls} />
        </Suspense>
      </section>
    </div>
  );
}

function StallGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}