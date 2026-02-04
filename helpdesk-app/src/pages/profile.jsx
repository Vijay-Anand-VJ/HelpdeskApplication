
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Briefcase, Save, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function Profile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: "",
    currentPass: "",
    newPass: "",
    confirmPass: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const API_URL = `${API_BASE_URL} /api/users / profile`;

  // 1. Update Name Logic
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token} `,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update global context so sidebar name changes immediately
      const updatedUser = { ...user, name: data.name };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      // if setUser is in your context: setUser(updatedUser); 

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Change Password Logic
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL} `, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token} `,
        },
        body: JSON.stringify({ currentPass, newPass }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPass("");
      setNewPass("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // NUCLEAR SAFETY GUARD
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">My Profile</h1>

      {message.text && (
        <div className={`mb - 6 p - 4 rounded - xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} `}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
            <div className="w-24 h-24 bg-[#064e3b]/10 text-[#064e3b] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl shadow-emerald-900/10">
              <span className="text-4xl font-black">{user.name?.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500 text-sm mb-6">{user.email}</p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-[#064e3b] text-xs font-bold uppercase tracking-wider border border-emerald-100">
              <Shield size={14} />
              {user.role}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-8">

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <User size={20} className="text-[#064e3b]" /> General Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Email address is managed by the administrator.</p>
              </div>
              <button
                disabled={loading}
                className="bg-[#064e3b] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#043327] transition flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Key size={20} className="text-[#064e3b]" /> Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all"
                />
              </div>
              <button
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg active:scale-95 disabled:opacity-50"
              >
                Update Password
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}