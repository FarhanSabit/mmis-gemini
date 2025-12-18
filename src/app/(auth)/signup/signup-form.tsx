// NIRA-Integrated Form Component (src/app/(auth)/signup/signup-form.tsx)

"use client";

import { useActionState } from "react";
import { signupAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Loader2, ShieldCheck } from "lucide-react";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary" />
          Vendor Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (as on ID)</Label>
              <Input id="fullName" name="fullName" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nin">National ID Number (NIN)</Label>
              <Input id="nin" name="nin" placeholder="CM000000000000" required disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (MTN/Airtel)</Label>
            <Input id="phoneNumber" name="phoneNumber" placeholder="+2567..." required disabled={isPending} />
          </div>

          <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-2">
            <Fingerprint className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Biometric Hardware Not Detected (Optional)</span>
            {/* Hidden field for fingerprint data if peripheral is connected */}
            <input type="hidden" name="fingerprintData" value="" />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="consentToVerify" name="consentToVerify" required />
            <Label htmlFor="consentToVerify" className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I consent to MMIS verifying my details with NIRA.
            </Label>
          </div>

          {state?.error && <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">{state.error}</div>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" /> : "Verify & Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}