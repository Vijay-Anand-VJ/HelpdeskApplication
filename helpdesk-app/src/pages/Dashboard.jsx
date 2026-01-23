import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Activity, Loader 
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    inProgress: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Stats from Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tickets/stats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.token]);

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of helpdesk performance</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Tickets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Tickets</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Pending / Open</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.open}</h3>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Resolved</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.closed}</h3>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Urgent Issues</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.highPriority}</h3>
          </div>
        </div>

      </div>

      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-blue-100 opacity-90">
               You have <span className="font-bold text-white underline decoration-wavy">{stats.open} open tickets</span> requiring attention today.
            </p>
         </div>
         <div className="hidden md:block opacity-80">
            <Activity size={100} />
         </div>
      </div>

    </div>
  );
}