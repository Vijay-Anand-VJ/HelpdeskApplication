import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Zap, BarChart3, Users, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-['Outfit'] selection:bg-emerald-100 selection:text-emerald-900">

      {/* NAVIGATION */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#064e3b] p-2 rounded-2xl shadow-xl shadow-emerald-900/10">
            <ShieldCheck className="text-emerald-400" size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#064e3b]">HelpDesk Support.</span>
        </div>
        <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors">
          Login
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">

        <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
          <br />
          <span className="text-emerald-600 italic">HelpDesk Support.</span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-lg font-medium mb-12">
          A centralized Helpdesk architecture engineered for SLA precision,
          real-time analytics, and seamless ticket lifecycles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="btn-cyber group">
            Register <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CORE MODULES DISPLAY (Mapped to PRD) */}
      <section className="bg-[#09090b] py-32 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Module 5: SLA Logic */}
            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-emerald-900/20 backdrop-blur-xl">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-white font-black text-xl mb-3 tracking-tight">SLA Precision</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Automated breach detection and dynamic response mapping based on ticket priority levels.
              </p>
            </div>

            {/* Module 8: Analytics */}
            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-emerald-900/20 backdrop-blur-xl">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-white font-black text-xl mb-3 tracking-tight">Real-time Insights</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Management-level dashboards tracking resolution efficiency and agent performance compliance.
              </p>
            </div>

            {/* Module 1: Security */}
            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-emerald-900/20 backdrop-blur-xl">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-white font-black text-xl mb-3 tracking-tight">RBAC Identity</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Encrypted multi-role access control ensuring data integrity across all enterprise departments.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center border-t border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          HelpDesk Support // 2026 //
        </p>
      </footer>
    </div>
  );
}