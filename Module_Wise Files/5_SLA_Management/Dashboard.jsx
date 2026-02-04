import { useEffect, useState } from "react";
import {
    Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, Loader,
    Plus, Search, User, Shield, FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth(); // Destructure auth loading too
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = user?.token;
                if (!token) return; // Should not happen if protected, but safe

                const headers = { Authorization: `Bearer ${token}` };

                // 1. Fetch Stats
                let statsData = null;
                try {
                    const statsRes = await fetch("http://localhost:5000/api/tickets/stats", { headers });
                    if (statsRes.ok) statsData = await statsRes.json();
                } catch (e) {
                    console.error("Stats fetch failed", e);
                }

                // 2. Fetch Tickets
                let ticketsData = [];
                try {
                    const ticketsRes = await fetch("http://localhost:5000/api/tickets", { headers });
                    const json = await ticketsRes.json();
                    // SAFETY GUARD: Ensure it is an array
                    if (Array.isArray(json)) ticketsData = json;
                    else console.error("Expected array for tickets, got:", json);
                } catch (e) {
                    console.error("Tickets fetch failed", e);
                }

                setStats(statsData);
                setTickets(ticketsData);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setDataLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        } else if (!authLoading) {
            // If auth finished and no user, stop data loading
            setDataLoading(false);
        }
    }, [user, authLoading]);

    // Global Loading State
    if (authLoading || (user && dataLoading)) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    // Redirect if not logged in (Double safety)
    if (!user && !authLoading) {
        return <Navigate to="/login" />;
    }

    // --- ROLE-BASED RENDER (Case Insensitive) ---
    const role = user?.role?.toLowerCase() || "";

    if (role === "customer") {
        return <CustomerDashboard user={user} tickets={tickets} stats={stats} />;
    }

    if (role === "agent") {
        return <AgentDashboard user={user} tickets={tickets} stats={stats} />;
    }

    // Default: Admin / Super Admin / Manager
    return <AdminDashboard user={user} tickets={tickets} stats={stats} />;
}

// ----------------------------------------------------------------------
// 1. CUSTOMER VIEW
// ----------------------------------------------------------------------
function CustomerDashboard({ user, tickets, stats }) {
    // Defensive checks
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const myOpen = safeTickets.filter(t => t.status !== "Closed" && t.status !== "Resolved").length;
    const myResolved = safeTickets.filter(t => t.status === "Closed" || t.status === "Resolved").length;
    const firstName = user?.name?.split(" ")[0] || "User";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, {firstName}!</h1>
                    <p className="text-slate-500 mt-1">Here is the status of your support requests.</p>
                </div>
                <Link to="/tickets" className="bg-[#064e3b] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-[#043327] transition active:scale-95">
                    <Plus size={20} /> New Ticket
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Active Tickets" value={myOpen} icon={<Ticket size={24} />} color="text-blue-500" bg="bg-blue-50" />
                <StatCard label="Resolved" value={myResolved} icon={<CheckCircle2 size={24} />} color="text-emerald-500" bg="bg-emerald-50" />
                {/* Replaced Briefcase with FileText to avoid potential icon missing crash */}
                <StatCard label="Total Submitted" value={safeTickets.length} icon={<FileText size={24} />} color="text-slate-500" bg="bg-slate-50" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock className="text-[#064e3b]" size={20} /> Recent Activity
                </h3>
                <TicketList tickets={safeTickets.slice(0, 5)} />
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. AGENT VIEW
// ----------------------------------------------------------------------
function AgentDashboard({ user, tickets, stats }) {
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    // Filter client-side
    const assignedToMe = safeTickets.filter(t => t.assignedTo === user._id || t.assignedTo?._id === user._id);
    const unassigned = safeTickets.filter(t => !t.assignedTo && t.status !== "Closed");
    const myPending = assignedToMe.filter(t => t.status !== "Closed" && t.status !== "Resolved");

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Agent Workspace</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Queue Updates
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Assigned to Me" value={assignedToMe.length} icon={<User size={24} />} color="text-purple-600" bg="bg-purple-50" />
                <StatCard label="My Pending" value={myPending.length} icon={<Clock size={24} />} color="text-amber-600" bg="bg-amber-50" />
                <StatCard label="Unassigned Queue" value={unassigned.length} icon={<AlertTriangle size={24} />} color="text-rose-600" bg="bg-rose-50" />
                <StatCard label="Total Resolved" value={stats?.status?.closed || 0} icon={<CheckCircle2 size={24} />} color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="text-purple-600" size={18} /> My Active Tickets
                    </h3>
                    <TicketList tickets={assignedToMe.slice(0, 5)} emptyMsg="No tickets assigned to you." />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-rose-600" size={18} /> Unassigned Queue
                    </h3>
                    <TicketList tickets={unassigned.slice(0, 5)} emptyMsg="Queue is clear!" />
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 3. ADMIN / MANAGER VIEW
// ----------------------------------------------------------------------
function AdminDashboard({ user, tickets, stats }) {
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const criticalCount = stats?.priority?.critical || 0;
    const totalTickets = stats?.total || 0;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">System Overview.</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
                        Global Operations Center
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-[#064e3b] rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
                        <Shield size={12} /> {user.role} Access
                    </span>
                </div>
            </div>

            {/* ADMIN STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="hub-card group hover:border-[#064e3b] transition-all duration-500 border border-slate-100 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-[#064e3b] rounded-xl"><TrendingUp size={24} /></div>
                        <span className="text-emerald-600 text-xs font-bold">+12%</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{totalTickets}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tickets</p>
                </div>

                <div className="hub-card group hover:border-rose-500 transition-all duration-500 border border-slate-100 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={24} /></div>
                        <span className="text-rose-600 text-xs font-bold">Action Req.</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{criticalCount}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Issues</p>
                </div>

                <div className="hub-card border border-slate-100 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Ticket size={24} /></div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{stats?.status?.open || 0}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Open Backlog</p>
                </div>

                <div className="hub-card border border-slate-100 bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><CheckCircle2 size={24} /></div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">{stats?.status?.closed || 0}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Resolved</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ACTIVITY STREAM */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl tracking-tight flex items-center gap-2 text-slate-800">
                            <TrendingUp className="text-[#064e3b]" size={20} />
                            Live Ticket Stream
                        </h3>
                    </div>
                    <TicketList tickets={safeTickets.slice(0, 5)} />
                </div>

                {/* SYSTEM HEALTH (Mocked Visual) */}
                <div className="bg-[#09090b] p-8 rounded-2xl relative overflow-hidden text-white flex flex-col justify-between min-h-[300px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#064e3b]/20 rounded-full blur-[80px]"></div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">System Health</h3>
                        <p className="text-zinc-500 text-xs uppercase tracking-widest">All systems operational</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1 font-mono text-zinc-400"><span>API Latency</span> <span>24ms</span></div>
                                <div className="w-full bg-zinc-800 h-1 rounded-full"><div className="w-[15%] bg-emerald-500 h-full rounded-full"></div></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1 font-mono text-zinc-400"><span>Database</span> <span>Optimal</span></div>
                                <div className="w-full bg-zinc-800 h-1 rounded-full"><div className="w-[8%] bg-emerald-500 h-full rounded-full"></div></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1 font-mono text-zinc-400"><span>Email Server</span> <span>Active</span></div>
                                <div className="w-full bg-zinc-800 h-1 rounded-full"><div className="w-[99%] bg-emerald-500 h-full rounded-full"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// SHARED COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ label, value, icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-4 rounded-xl ${bg} ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-900">{value}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}

function TicketList({ tickets, emptyMsg = "No tickets found." }) {
    if (tickets.length === 0) {
        return <p className="text-slate-400 text-sm font-medium italic p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">{emptyMsg}</p>;
    }

    return (
        <div className="space-y-3">
            {tickets.map((ticket) => (
                <Link
                    to={`/tickets/${ticket._id}`}
                    key={ticket._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-emerald-100 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs transition-colors
              ${ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'}
            `}>
                            #{ticket._id.slice(-4)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#064e3b] transition-colors flex items-center gap-2">
                                {ticket.title}
                                {new Date(ticket.dueDate) < new Date() && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                                    <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                        SLA Breached
                                    </span>
                                )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                    ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                        'bg-slate-100 text-slate-400'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm text-[10px] font-bold uppercase text-slate-600">
                        {ticket.status}
                    </div>
                </Link>
            ))}
        </div>
    );
}
