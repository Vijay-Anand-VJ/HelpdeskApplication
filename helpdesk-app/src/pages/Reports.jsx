import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Loader, Download } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("https://helpdesk-yida.onrender.com/api/tickets/stats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const result = await res.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token]);

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  // --- PREPARE DATA FOR CHARTS ---
  
  // 1. Priority Data (Pie Chart)
  const priorityChartData = [
    { name: "Low", value: data.priority.low },
    { name: "Medium", value: data.priority.medium },
    { name: "High", value: data.priority.high },
    { name: "Critical", value: data.priority.critical },
  ].filter(item => item.value > 0); // Hide empty slices

  const COLORS = ["#10B981", "#FBBF24", "#F87171", "#DC2626"]; // Green, Yellow, Red, Dark Red

  // 2. Status Data (Bar Chart)
  const statusChartData = [
    { name: "Open", count: data.status.open },
    { name: "In Progress", count: data.status.inProgress },
    { name: "Closed", count: data.status.closed },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Reports</h1>
          <p className="text-gray-500">Visual insights into helpdesk performance</p>
        </div>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-4xl font-bold text-blue-600">{data.total}</h3>
          <p className="text-gray-500 mt-1">Total Tickets</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-4xl font-bold text-green-600">{data.status.closed}</h3>
          <p className="text-gray-500 mt-1">Resolved Tickets</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-4xl font-bold text-red-600">{data.priority.critical}</h3>
          <p className="text-gray-500 mt-1">Critical Issues</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BAR CHART: Ticket Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Ticket Volume by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Priority Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Tickets by Priority</h3>
          <div className="h-64 flex justify-center items-center">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}