import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, Users, Ticket, LogOut, ShieldCheck, 
  Bell, Menu, Settings, CheckCircle, AlertTriangle, Info,
  BookOpen, BarChart // <--- Added BarChart Icon
} from "lucide-react"; 

export default function Layout() {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // MOCK NOTIFICATIONS
  const [notifications, setNotifications] = useState([
    { id: 1, type: "alert", text: "SLA Warning: Ticket #105 is about to breach.", time: "2 mins ago", read: false },
    { id: 2, type: "info", text: "New Ticket #108 assigned to you.", time: "1 hour ago", read: false },
    { id: 3, type: "success", text: "Ticket #102 was marked as Closed.", time: "5 hours ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Permissions
  const canViewUsers = ["Super Admin", "Admin"].includes(user?.role);
  const canViewDashboard = ["Super Admin", "Admin", "Manager", "Agent"].includes(user?.role);
  const canViewReports = ["Super Admin", "Admin", "Manager"].includes(user?.role); // <--- Reports Permission

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-center">
           {isSidebarOpen ? (
             <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
               <ShieldCheck className="text-blue-400" /> Helpdesk
             </div>
           ) : (
             <ShieldCheck className="text-blue-400" size={28} />
           )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          
          {/* DASHBOARD */}
          {canViewDashboard && (
            <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Dashboard">
              <LayoutDashboard size={20} /> 
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          )}
          
          {/* TICKETS */}
          <Link to="/tickets" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Tickets">
            <Ticket size={20} /> 
            {isSidebarOpen && <span>Tickets</span>}
          </Link>

          {/* KNOWLEDGE BASE */}
          <Link to="/knowledge-base" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Knowledge Base">
             <BookOpen size={20} /> 
             {isSidebarOpen && <span>Knowledge Base</span>}
          </Link>

          {/* REPORTS (NEW - Only for Admins/Managers) */}
          {canViewReports && (
            <Link to="/reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Reports">
               <BarChart size={20} /> 
               {isSidebarOpen && <span>Reports</span>}
            </Link>
          )}

          {/* USERS */}
          {canViewUsers && (
            <Link to="/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Users">
              <Users size={20} /> 
              {isSidebarOpen && <span>Users & Roles</span>}
            </Link>
          )}

          {/* PROFILE */}
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors" title="My Profile">
            <Settings size={20} /> 
            {isSidebarOpen && <span>My Profile</span>}
          </Link>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-slate-700">
           <button onClick={logout} className="flex items-center gap-3 w-full p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition" title="Logout">
             <LogOut size={20} />
             {isSidebarOpen && <span>Logout</span>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-20">
          
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up z-50">
                   <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="font-bold text-gray-700">Notifications</h3>
                     {unreadCount > 0 && <button onClick={handleMarkAsRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>}
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                     {notifications.map((n) => (
                       <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${!n.read ? "bg-blue-50/50" : ""}`}>
                          <div className={`mt-1 p-1.5 rounded-full h-fit ${n.type === 'alert' ? 'bg-red-100 text-red-600' : n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {n.type === 'alert' ? <AlertTriangle size={14}/> : n.type === 'success' ? <CheckCircle size={14}/> : <Info size={14}/>}
                          </div>
                          <div><p className={`text-sm ${!n.read ? "font-semibold text-gray-800" : "text-gray-600"}`}>{n.text}</p><p className="text-xs text-gray-400 mt-1">{n.time}</p></div>
                       </div>
                     ))}
                   </div>
                   <div className="p-2 border-t border-gray-100 text-center">
                     <Link to="/tickets" onClick={() => setShowNotifications(false)} className="text-xs font-bold text-gray-500 hover:text-blue-600">VIEW ALL ACTIVITY</Link>
                   </div>
                </div>
              )}
            </div>
            <Link to="/profile" className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:bg-gray-50 p-2 rounded transition">
               <div className="text-right hidden sm:block">
                 <div className="text-sm font-bold text-gray-800">{user?.name}</div>
                 <div className="text-xs text-gray-500 uppercase">{user?.role}</div>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.name?.charAt(0)}
               </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-6 relative">
           {showNotifications && <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>}
           <Outlet />
        </main>
      </div>
    </div>
  );
}