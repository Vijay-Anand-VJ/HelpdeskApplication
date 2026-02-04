import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard, Users, Ticket, LogOut, ShieldCheck,
    Bell, BookOpen, BarChart3, Menu, X
} from "lucide-react";

export default function Layout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [loadingNotif, setLoadingNotif] = useState(true);

    // Fetch Notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch("http://localhost:5000/api/notifications", {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) setNotifications(data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoadingNotif(false);
            }
        };
        fetchNotifications();
    }, [user]);

    const handleLogout = () => {
        if (window.confirm("Terminate secure session?")) {
            logout();
            navigate("/login");
        }
    };

    const navItems = [
        { name: "Dashboard", path: "/dashboard", roles: ["Super Admin", "Admin", "Manager", "Agent", "Customer"] },
        { name: "Tickets", path: "/tickets", roles: ["Super Admin", "Admin", "Manager", "Agent", "Customer"] },
        { name: "Knowledge", path: "/knowledge-base", roles: ["Super Admin", "Admin", "Manager", "Agent", "Customer"] },
        { name: "Reports", path: "/reports", roles: ["Super Admin", "Admin", "Manager"] },
        { name: "Users", path: "/users", roles: ["Super Admin"] },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-white border-b border-emerald-50 sticky top-0 z-50 h-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-[#064e3b] p-2 rounded-2xl group-hover:-rotate-6 transition-transform shadow-lg shadow-emerald-900/20">
                                <ShieldCheck className="text-emerald-400" size={22} />
                            </div>
                            <span className="font-extrabold text-2xl tracking-tighter text-[#064e3b]">HelpDesk</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-2">
                            {navItems.map((item) => {
                                if (item.roles && !item.roles.includes(user?.role)) return null;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-[#064e3b] text-emerald-400 shadow-lg" : "text-slate-400 hover:text-[#064e3b]"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* NOTIFICATIONS */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotif(!showNotif)}
                                className="p-2 text-slate-400 hover:text-[#064e3b] transition relative"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in z-[60]">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Notifications</h4>
                                        <button onClick={() => setShowNotif(false)}><X size={14} className="text-slate-400" /></button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="p-6 text-center text-xs text-slate-400 font-bold italic">No new alerts</p>
                                        ) : (
                                            notifications.map((n, i) => (
                                                <div key={i} className="p-4 border-b border-slate-50 hover:bg-emerald-50/30 transition text-sm">
                                                    <p className="font-bold text-slate-800 mb-1">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/profile" className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100 hover:bg-slate-100 transition cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-[#064e3b] flex items-center justify-center text-emerald-400 font-black border-2 border-white shadow-md">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[10px] font-black text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{user?.role}</p>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-rose-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12">
                <Outlet />
            </main>
        </div>
    );
}
