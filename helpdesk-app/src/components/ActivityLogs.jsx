import { useState, useEffect } from "react";
import { Clock, Loader } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Real-time fetch from your local backend
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/logs`, {
          headers: {
            Authorization: `Bearer ${token}`, // Secure API call
          },
        });
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchLogs();
  }, [user]);

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

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
          {logs.length > 0 ? logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                <Clock size={14} /> {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.userName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-300">
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.details}</td>
            </tr>
          )) : (
            <tr><td colSpan="4" className="text-center p-4 text-gray-500">No activity logs found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}