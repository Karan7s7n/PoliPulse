import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";
import {
  Twitter,
  Linkedin,
  Github,
  ArrowUp,
  Sun,
  Moon
} from "lucide-react";

interface FooterProps {
  version?: string;
}

export default function Footer({ version = "v1.0.0" }: FooterProps) {
  const { isDark, toggleTheme } = useTheme();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const textBase = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/70" : "text-gray-700";
  const textHover = isDark ? "hover:text-white" : "hover:text-gray-900";
  const borderCol = isDark ? "border-white/10" : "border-black/10";
  const bgCol = isDark ? "bg-white/10" : "bg-white/70";

  return (
    <footer className="relative mt-32 mb-10 flex justify-center px-4 overflow-hidden lg:overflow-visible">
      {/* 🔮 Gradient Glow */}
      <div className="absolute inset-0 mx-auto max-w-6xl rounded-3xl blur-3xl opacity-40 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 pointer-events-none"></div>

      {/* 💎 Glass Container */}
      <div className={`relative w-full max-w-6xl px-8 py-12 rounded-[2.5rem] border ${borderCol} ${bgCol} backdrop-blur-2xl shadow-2xl`}>

        {/* 🏔️ Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* 🛡️ Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src={isDark ? logoLight : logoDark} alt="PoliPulse" className="w-12 h-12 rounded-2xl shadow-2xl rotate-3" />
              <h2 className={`text-3xl font-black tracking-tighter ${textBase}`}>PoliPulse</h2>
              {version && <span className={`text-[10px] uppercase font-black tracking-widest opacity-40 ml-2 ${textBase}`}>{version}</span>}
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${textSecondary} max-w-sm font-medium`}>
              The premier AI-powered dashboard for elite insurance portfolio management.
              Real-time insights, zero-trust security, and instant global accessibility.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className={`${textSecondary} hover:text-indigo-500 transition-all`}><Twitter size={18} /></a>
              <a href="#" className={`${textSecondary} hover:text-indigo-500 transition-all`}><Linkedin size={18} /></a>
              <a href="#" className={`${textSecondary} hover:text-indigo-500 transition-all`}><Github size={18} /></a>
            </div>
          </div>

          {/* 🔗 Navigation Grids */}
          <div className="flex gap-16 lg:gap-24 text-sm">
            <div className="flex flex-col gap-4">
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${textBase} opacity-40`}>Product</span>
              <Link to="/reports" className={`${textHover} transition font-bold`}>Analytics</Link>
              <Link to="/dashboard" className={`${textHover} transition font-bold`}>Dashboard</Link>
              <Link to="/add" className={`${textHover} transition font-bold`}>Add Policy</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${textBase} opacity-40`}>Organization</span>
              <Link to="/profile" className={`${textHover} transition font-bold`}>My Profile</Link>
              <Link to="/settings" className={`${textHover} transition font-bold`}>Settings</Link>
              <Link to="/" className={`${textHover} transition font-bold`}>Brand Home</Link>
            </div>
          </div>
        </div>

        {/* ➖ Divider */}
        <div className={`my-10 h-px w-full ${isDark ? "bg-white/5" : "bg-black/5"}`}></div>

        {/* 🧾 Bottom Operational Bar */}
        <div className={`flex flex-col md:flex-row justify-between items-center text-[11px] font-black uppercase tracking-widest gap-6 ${textSecondary}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p>© {new Date().getFullYear()} CORE UNIT 108. All Systems Operational.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 items-center">
            <Link to="/privacy" className={`${textHover} transition`}>Privacy Layer</Link>
            <Link to="/terms" className={`${textHover} transition text-indigo-500`}>Terms</Link>

            <div className="flex items-center gap-3 ml-4 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${isDark
                  ? "bg-zinc-800 text-amber-400 border border-white/5"
                  : "bg-white text-indigo-600 border border-black/5"
                  }`}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button
                onClick={scrollToTop}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${isDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
