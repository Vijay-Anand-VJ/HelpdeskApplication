import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Plus, Loader, X, AlertCircle, Ban, CheckCircle, Edit2, FileText, Search, Calendar, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function Users() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals State
    const [showModal, setShowModal] = useState(false); // Edit/Create Modal
    const [viewUser, setViewUser] = useState(null);    // View Details Modal

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Agent",
        department: "IT"
    });

    const API_URL = "http://localhost:5000/api/users";

    const fetchUsers = useCallback(async () => {
        if (!user?.token) return;

        try {
            const res = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch users");

            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const url = isEditing ? `${API_URL}/${editId}` : API_URL;
            const method = isEditing ? "PUT" : "POST";

            const payload = { ...formData };
            if (isEditing && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save user");

            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleStatus = async (u, e) => {
        e.stopPropagation(); // Prevent row click
        if (!window.confirm(`Are you sure you want to ${u.isActive ? 'deactivate' : 'activate'} ${u.name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/${u._id}/deactivate`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (!res.ok) throw new Error("Failed to update status");

            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const openValidModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (u, e) => {
        e.stopPropagation(); // Prevent row click
        setIsEditing(true);
        setEditId(u._id);
        setFormData({
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department || "IT",
            password: ""
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: "", email: "", password: "", role: "Agent", department: "IT" });
    }

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in-up pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium">Provision accounts and manage system roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/logs"
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-sm"
                    >
                        <FileText size={18} /> Logs
                    </Link>
                    <button
                        onClick={openValidModal}
                        className="bg-[#064e3b] hover:bg-[#043327] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 font-bold transition-all active:scale-95"
                    >
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-3 border border-rose-100 font-medium">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader className="animate-spin text-[#064e3b]" size={40} />
                    <p className="text-slate-400 font-bold">Syncing Directory...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest pl-8">User Profile</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((u) => (
                                    <tr
                                        key={u._id}
                                        onClick={() => setViewUser(u)}
                                        className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${!u.isActive && u.isActive !== undefined ? 'opacity-60 bg-slate-50' : ''}`}
                                    >
                                        <td className="p-5 pl-8 flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-colors border border-slate-100 ${!u.isActive && u.isActive !== undefined
                                                ? 'bg-slate-100 text-slate-400'
                                                : 'bg-emerald-50 text-[#064e3b]'
                                                }`}>
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-bold transition-colors ${!u.isActive && u.isActive !== undefined ? 'text-slate-500' : 'text-slate-900 group-hover:text-[#064e3b]'}`}>{u.name}</div>
                                                <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'Admin' || u.role === 'Super Admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : u.role === 'Manager' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {u.isActive === false ? (
                                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider"><Ban size={14} /> Inactive</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider"><CheckCircle size={14} /> Active</span>
                                            )}
                                        </td>
                                        <td className="p-5 pr-8 flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => openEditModal(u, e)}
                                                className="p-2 text-slate-400 hover:text-[#064e3b] hover:bg-emerald-50 rounded-lg transition"
                                                title="Edit User"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            {user._id !== u._id && (
                                                <button
                                                    onClick={(e) => handleToggleStatus(u, e)}
                                                    className={`p-2 rounded-lg transition ${u.isActive === false
                                                        ? 'text-emerald-500 hover:bg-emerald-50'
                                                        : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                                                        }`}
                                                    title={u.isActive === false ? "Activate User" : "Deactivate User"}
                                                >
                                                    {u.isActive === false ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{isEditing ? "Edit User" : "Add New User"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none font-medium transition-all"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none font-medium transition-all disabled:opacity-60"
                                    required
                                    value={formData.email}
                                    disabled={isEditing}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{isEditing ? "New Password (Optional)" : "Temporary Password"}</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none font-medium transition-all"
                                    required={!isEditing}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">System Role</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#064e3b] focus:bg-white font-medium cursor-pointer transition-all"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Customer">Customer (Standard)</option>
                                    <option value="Agent">Support Agent</option>
                                    <option value="Manager">Department Manager</option>
                                    <option value="Admin">System Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Department</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#064e3b] focus:bg-white font-medium cursor-pointer transition-all"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="IT">IT Support</option>
                                    <option value="HR">Human Resources</option>
                                    <option value="Sales">Sales Ops</option>
                                    <option value="Legal">Legal</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#043327] shadow-lg shadow-emerald-900/20 transition active:scale-95">
                                    {isEditing ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW USER DETAILS MODAL */}
            {viewUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 animate-fade-in-up overflow-hidden relative">
                        <button
                            onClick={() => setViewUser(null)}
                            className="absolute right-4 top-4 p-2 bg-white/50 hover:bg-white rounded-full transition z-10"
                        >
                            <X size={20} className="text-slate-600" />
                        </button>

                        <div className="h-32 bg-[#064e3b] relative">
                            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-400">
                                        {viewUser.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-14 pb-8 px-6 text-center">
                            <h2 className="text-2xl font-black text-slate-900 mb-1">{viewUser.name}</h2>
                            <p className="text-slate-500 font-medium mb-4 flex items-center justify-center gap-2">
                                <Mail size={14} /> {viewUser.email}
                            </p>

                            <div className="flex items-center justify-center gap-2 mb-8">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${viewUser.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    viewUser.role === 'Manager' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                    {viewUser.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${viewUser.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                    }`}>
                                    {viewUser.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Briefcase size={12} /> Department</p>
                                    <p className="font-bold text-slate-800">{viewUser.department || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12} /> Joined</p>
                                    <p className="font-bold text-slate-800">{viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
