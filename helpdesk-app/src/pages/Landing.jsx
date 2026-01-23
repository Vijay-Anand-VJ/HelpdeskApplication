import { Link } from "react-router-dom";
import { CheckCircle, Shield, Clock, Zap, Users, Layout, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen font-sans text-gray-900 relative overflow-hidden bg-slate-50">
      
      {/* 1. VISIBLE BACKGROUND GRADIENT */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-indigo-200 rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-300">
            H
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">HelpDesk Pro</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-600 font-medium hover:text-blue-600 transition py-2 px-4">
            Sign In
          </Link>
          <Link to="/register" className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold transition shadow-lg flex items-center gap-2">
            Create Account <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center relative z-10">
        
        {/* Glass Container for Text */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 p-8 md:p-12 rounded-3xl shadow-xl inline-block max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 font-bold text-xs mb-6 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Internal Support System v1.0
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            IT Support, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Reimagined.</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            The central hub for all support requests. Track issues, manage assets, and resolve tickets faster with our automated helpdesk.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:-translate-y-1">
              Get Started
            </Link>
            <Link to="/login" className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-bold text-lg transition flex items-center justify-center shadow-sm hover:shadow-md">
              Employee Login
            </Link>
          </div>

        </div>
      </header>

      {/* FEATURES GRID */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-white hover:border-blue-200 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">Fast Resolution</h3>
              <p className="text-gray-500 text-sm">
                SLA timers ensure high-priority tickets are handled instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-white hover:border-indigo-200 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">Secure Access</h3>
              <p className="text-gray-500 text-sm">
                Role-based security keeps sensitive data protected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-white hover:border-green-200 hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Layout size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">Real-time Stats</h3>
              <p className="text-gray-500 text-sm">
                Live dashboards provide insights into system health.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center relative z-10 text-gray-400 text-sm">
        © 2026 Internal IT Support. Authorized Access Only.
      </footer>
    </div>
  );
}