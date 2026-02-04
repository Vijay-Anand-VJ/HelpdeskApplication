import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, ShieldCheck, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const userData = await login(email, password);
            console.log("Debug - User Data Received:", userData);

            if (userData && userData.role) {
                // UNIFIED REDIRECT: All roles go to Dashboard now
                navigate("/dashboard");
            } else {
                setError("Login successful, but role is missing from data.");
            }
        } catch (err) {
            setError(err.message || "Security validation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Outfit']">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#064e3b] text-emerald-400 mb-4 shadow-lg shadow-emerald-900/20">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Login</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        Enter Your Credentials to Login helpdesk.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl flex items-center gap-3 border border-rose-100 font-bold">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Id</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all font-bold text-slate-700"
                                placeholder="agent@os.system"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                            <Link to="/forgot-password" class="text-xs font-bold text-[#064e3b] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#064e3b] focus:bg-white outline-none transition-all font-bold text-slate-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        className="w-full bg-[#064e3b] text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-[#043327] transition shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 mt-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <><LogIn size={20} /> Login</>}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        New Here ? {" "}
                        <Link to="/register" className="text-[#064e3b] font-black hover:underline ml-1">
                            Create an  Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
