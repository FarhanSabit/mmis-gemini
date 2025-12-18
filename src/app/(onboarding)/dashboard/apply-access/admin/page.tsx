// src/app/(onboarding)/dashboard/apply/admin/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/services/auth.service";

export default async function AdminApplyPage() {
  const session = await getSession();
  const emailDomain = session.email.split('@')[1];
  
  // Hard-coded check for government domains
  const isGov = emailDomain === 'molg.go.ug' || emailDomain === 'kcca.go.ug';

  if (!isGov) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-red-600 font-bold">Domain Restriction</h2>
        <p>You must use an official @.go.ug email to apply for administration access.</p>
      </div>
    );
  }

  return (
    <form action={submitAdminRequest} className="space-y-4 max-w-md mx-auto">
      <div>
        <label>Admin Level</label>
        <select name="level" className="w-full border p-2 rounded">
          <option value="MARKET_ADMIN">Market Administrator</option>
          <option value="CITY_ADMIN">City Authority</option>
        </select>
      </div>
      <div>
        <label>City/District</label>
        <select name="city" className="w-full border p-2 rounded">
          <option value="kampala">Kampala</option>
          <option value="jinja">Jinja</option>
        </select>
      </div>
      <div>
        <label>Target Market</label>
        <select name="marketId" className="w-full border p-2 rounded">
          <option value="nakasero-01">Nakasero Market</option>
          <option value="owino-02">Owino (St. Balikuddembe)</option>
        </select>
      </div>
      <Button type="submit">Submit for Super Admin Verification</Button>
    </form>
  );
}