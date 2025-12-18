// src/app/(onboarding)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommonDashboard() {
  return (
    <div className="flex flex-col items-center p-12 space-y-8">
      <h1 className="text-3xl font-bold">Account Setup</h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Path 1: Vendor */}
        <Card>
          <CardHeader><CardTitle>Apply Vendor Access</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Start trading in the market. Requires NIRA KYC verification.</p>
            <Button asChild className="w-full"><a href="/dashboard/apply/vendor">Start KYC</a></Button>
          </CardContent>
        </Card>

        {/* Path 2: Admin */}
        <Card>
          <CardHeader><CardTitle>Apply Admin Access</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage market operations. Requires government email verification.</p>
            <Button variant="outline" asChild className="w-full"><a href="/dashboard/apply/admin">Request Access</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}