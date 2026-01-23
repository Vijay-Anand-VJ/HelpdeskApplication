import { useState } from "react";
import { Clock } from "lucide-react";

export default function ActivityLogs() {
  const [logs] = useState([
    { id: 101, user: "Super Admin", action: "System Update", details: "Updated security policies", time: "2 mins ago" },
    { id: 102, user: "Admin User", action: "User Created", details: "Created account for Agent Sarah", time: "1 hour ago" },
    { id: 103, user: "Agent Bob", action: "Login", details: "Successful login from IP 192.168.1.5", time: "3 hours ago" },
    { id: 104, user: "Manager Sarah", action: "Report Generated", details: "Exported Monthly Ticket Report", time: "5 hours ago" },
  ]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                <Clock size={14} /> {log.time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-300">
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}