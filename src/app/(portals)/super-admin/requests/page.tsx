// src/app/(portals)/super-admin/requests/page.tsx
export default async function AdminRequests() {
  const requests = await fetchPendingApplications(); // Via BFF

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Pending Access Requests</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted text-left">
            <th className="p-2">User</th>
            <th className="p-2">Role Requested</th>
            <th className="p-2">Hierarchy</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b">
              <td className="p-2">{req.email}</td>
              <td className="p-2">{req.requestedRole}</td>
              <td className="p-2">{req.city} - {req.marketName}</td>
              <td className="p-2 space-x-2">
                <Button size="sm">Approve</Button>
                <Button variant="destructive" size="sm">Reject</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}