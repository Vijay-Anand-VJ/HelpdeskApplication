
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Loader, Download, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = `${API_BASE_URL} /api/tickets / stats`;

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token) return;

      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${user.token} ` },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to fetch stats");

        setData(result);
      } catch (err) {
        console.error("Reports Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.token]);

  // NUCLEAR SAFETY GUARD
  if (!user) return null;

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  if (error) return (
    <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-100 mx-auto max-w-lg">
      <AlertCircle className="mx-auto mb-2" />
      <p className="font-bold">Error loading analytics: {error}</p>
    </div>
  );

  // --- PREPARE DATA FOR CHARTS ---
  // Ensure we handle potential nulls from backend
  const priorityChartData = [
    { name: "Low", value: data?.priority?.low || 0 },
    { name: "Medium", value: data?.priority?.medium || 0 },
    { name: "High", value: data?.priority?.high || 0 },
    { name: "Critical", value: data?.priority?.critical || 0 },
  ].filter(item => item.value > 0);

  const categoryChartData = data?.category
    ? Object.entries(data.category).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ["#10B981", "#FBBF24", "#F87171", "#DC2626", "#8B5CF6", "#3B82F6"];

  const statusChartData = [
    { name: "Open", count: data?.status?.open || 0 },
    { name: "In Progress", count: data?.status?.inProgress || 0 },
    { name: "Closed", count: data?.status?.closed || 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Reports</h1>
          <p className="text-slate-500 font-medium">Visual insights into helpdesk performance</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition shadow-sm font-bold active:scale-95">
          <Download size={18} /> Export PDF
        </button>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
          <h3 className="text-5xl font-black text-blue-600 tracking-tight">{data.total}</h3>
          <p className="text-slate-500 font-bold uppercase text-xs mt-2 tracking-widest">Total Tickets</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
          <h3 className="text-5xl font-black text-emerald-600 tracking-tight">{data.status.closed}</h3>
          <p className="text-slate-500 font-bold uppercase text-xs mt-2 tracking-widest">Resolved Tickets</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
          <h3 className="text-5xl font-black text-rose-600 tracking-tight">{data.priority.critical}</h3>
          <p className="text-slate-500 font-bold uppercase text-xs mt-2 tracking-widest">Critical Issues</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
          <h3 className="text-5xl font-black text-purple-600 tracking-tight">{data.slaBreaches || 0}</h3>
          <p className="text-slate-500 font-bold uppercase text-xs mt-2 tracking-widest">SLA Breaches</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-50">
          <h3 className="text-lg font-bold text-slate-800 mb-8 border-b pb-4">Ticket Volume by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-50">
          <h3 className="text-lg font-bold text-slate-800 mb-8 border-b pb-4">Tickets by Priority</h3>
          <div className="h-72 flex justify-center items-center">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <p className="text-slate-400 font-medium italic">No priority data recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AGENT PERFORMANCE */}
      <div className="grid grid-cols-1 gap-8">
        {/* Agent Performance Table */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-50">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Top Performing Agents</h3>
          {data.agentPerformance && data.agentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pl-2">Agent Name</th>
                    <th className="pb-3 text-center">Resolved</th>
                    <th className="pb-3 text-center">Pending</th>
                    <th className="pb-3 text-right pr-2">Total Assigned</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {data.agentPerformance
                    .sort((a, b) => b.resolved - a.resolved)
                    .slice(0, 8) // Expanded to Top 8 since we have more space
                    .map((agent, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                        <td className="py-4 pl-2 font-bold text-slate-900">{agent.name}</td>
                        <td className="py-4 text-center text-emerald-600 font-bold">{agent.resolved}</td>
                        <td className="py-4 text-center text-amber-500">{agent.open}</td>
                        <td className="py-4 text-right pr-2 font-bold">{agent.total}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 italic">No agent data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}