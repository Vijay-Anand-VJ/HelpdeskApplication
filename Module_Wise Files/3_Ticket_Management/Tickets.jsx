import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, AlertCircle, Loader, Ticket, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Tickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create filters state
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: [], // e.g. ['Open', 'In Progress']
        priority: [] // e.g. ['High', 'Critical']
    });

    const API_URL = "http://localhost:5000/api/tickets";

    const fetchTickets = useCallback(async () => {
        if (!user?.token) return;

        try {
            const response = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load tickets");

            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // --- FILTERING LOGIC ---
    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            if (current.includes(value)) {
                return { ...prev, [type]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [type]: [...current, value] };
            }
        });
    };

    const clearFilters = () => {
        setFilters({ status: [], priority: [] });
        setSearchTerm("");
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket._id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filters.status.length === 0 || filters.status.includes(ticket.status);
        const matchesPriority = filters.priority.length === 0 || filters.priority.includes(ticket.priority);

        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Tickets</h1>
                    <p className="text-slate-500 font-medium">Manage and track your active support requests</p>
                </div>
                <Link to="/tickets/new" className="bg-[#064e3b] hover:bg-[#043327] text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 font-bold active:scale-95">
                    <Plus size={20} /> New Ticket
                </Link>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 relative z-20">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by subject or ID..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all placeholder:font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl font-bold transition-colors ${showFilters || filters.status.length > 0 || filters.priority.length > 0
                        ? 'bg-emerald-50 border-emerald-200 text-[#064e3b]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                >
                    <Filter size={18} /> Filters {(filters.status.length + filters.priority.length) > 0 && `(${filters.status.length + filters.priority.length})`}
                </button>
            </div>

            {/* EXPANDABLE FILTER PANEL */}
            {showFilters && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8 animate-fade-in z-10 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Filter Options</h3>
                        <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline">Clear All</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* STATUS */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Status</label>
                            <div className="flex flex-wrap gap-2">
                                {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => toggleFilter('status', status)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${filters.status.includes(status)
                                            ? 'bg-[#064e3b] text-white border-[#064e3b]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                            }`}
                                    >
                                        {filters.status.includes(status) && <Check size={12} />} {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PRIORITY */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Priority</label>
                            <div className="flex flex-wrap gap-2">
                                {['Low', 'Medium', 'High', 'Critical'].map(priority => (
                                    <button
                                        key={priority}
                                        onClick={() => toggleFilter('priority', priority)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${filters.priority.includes(priority)
                                            ? 'bg-[#064e3b] text-white border-[#064e3b]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                            }`}
                                    >
                                        {filters.priority.includes(priority) && <Check size={12} />} {priority}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-8 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-3 border border-rose-100 font-medium">
                    <AlertCircle size={20} /> Error: {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader className="animate-spin text-[#064e3b]" size={40} />
                    <p className="text-slate-400 font-bold animate-pulse">Syncing with server...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden">
                    {filteredTickets.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {filteredTickets.map((ticket) => (
                                <Link to={`/tickets/${ticket._id}`} key={ticket._id} className="block p-6 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                                    ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                                        ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className="text-slate-300 text-xs font-mono font-bold">#{ticket._id.slice(-4)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#064e3b] transition-colors mb-1 flex items-center gap-2">
                                                {ticket.title}
                                                {new Date(ticket.dueDate) < new Date() && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                                                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-wider shadow-sm shadow-rose-200">
                                                        SLA Breached
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-1 max-w-2xl">{ticket.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">{ticket.category}</p>
                                                <p className="text-[11px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    ticket.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {ticket.status}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 px-6">
                            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Ticket className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                We couldn't find any tickets matching your current filters or search.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
