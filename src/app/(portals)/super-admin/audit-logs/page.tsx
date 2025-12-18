// src/app/(portals)/super-admin/audit-logs/page.tsx
import { DataTable } from "@/components/ui/data-table";

export default async function AuditLogsPage() {
  const logs = await fetchAuditLogs(); // Server-side fetch from BFF

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Audit Trail</h1>
      <DataTable 
        columns={[
          { accessorKey: "timestamp", header: "Time" },
          { accessorKey: "userId", header: "User ID" },
          { accessorKey: "action", header: "Action" },
          { accessorKey: "ipAddress", header: "IP Source" }
        ]} 
        data={logs} 
      />
    </div>
  );
}