import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Mail, Lock, User, ShieldCheck, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await register(formData.name, formData.email, formData.password);
            navigate("/tickets");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 animate-fade-in-up">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064e3b] text-white mb-4 shadow-lg shadow-emerald-900/20">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        Join the internal support portal to manage tickets.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl flex items-center gap-3 border border-rose-100 font-bold">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all font-medium"
                                placeholder="Jane Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all font-medium"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#064e3b] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#064e3b] text-white py-3.5 rounded-xl font-bold hover:bg-[#043327] transition shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 mt-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <><UserPlus size={20} /> Create Account</>}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#064e3b] font-bold hover:underline ml-1">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
