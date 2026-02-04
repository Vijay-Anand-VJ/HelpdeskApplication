import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ActivityLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Correct Path
    const API_URL = `${API_BASE_URL}/api/auth/logs`;

    const fetchLogs = useCallback(async () => {
        if (!user?.token) return;

        try {
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Logs Fetch Error:", text);
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            setLogs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/users" className="text-slate-400 hover:text-blue-600 transition"><ArrowLeft size={20} /></Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Logs</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-7">Audit trail of system events</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-3 border border-rose-100 font-medium">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-400 font-bold">Loading Audit Trail...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 text-sm font-medium text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-5 font-bold text-slate-900">
                                            {log.user ? log.user.name : "Unknown User"}
                                            {log.user && <div className="text-xs text-slate-400 font-normal">{log.user.email}</div>}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' :
                                                log.action === 'REGISTER' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm text-slate-600 font-medium">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400 font-bold">No activity recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
