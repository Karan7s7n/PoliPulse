import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  Lock,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

interface LandingPageProps { }

const LandingPage: React.FC<LandingPageProps> = () => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
      title: "Secure by Design",
      description: "Bank-grade encryption ensures your policy data is always protected."
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: "Lightning Fast",
      description: "Optimized infrastructure delivers instant access to your portfolio."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
      title: "Smart Analytics",
      description: "Gain actionable insights with real-time tracking and reporting."
    },
    {
      icon: <Globe2 className="w-8 h-8 text-blue-500" />,
      title: "Global Access",
      description: "Manage your assets from anywhere in the world, on any device."
    },
    {
      icon: <Lock className="w-8 h-8 text-rose-500" />,
      title: "Privacy First",
      description: "Your data is yours. We never share or sell it to third parties."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
      title: "Mobile Ready",
      description: "A seamless experience whether on desktop, tablet, or mobile phone."
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? "bg-zinc-950 text-zinc-50" : "bg-slate-50 text-slate-900"}`}>
      {/* Dynamic unauthenticated Navbar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-2xl border-b transition-all duration-300 ${isDark
        ? "bg-zinc-950/80 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        : "bg-white/80 border-slate-200/50 shadow-sm"
        }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <img src={isDark ? logoLight : logoDark} alt="PoliPulse Logo" className="h-12 w-12 rounded-2xl shadow-xl transform hover:rotate-6 transition-transform" />
              <span className="font-black text-3xl tracking-tighter bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                PoliPulse
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className={`text-[11px] uppercase font-black tracking-widest transition-all hover:text-indigo-500 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Features</a>
              <a href="#contact" className={`text-[11px] uppercase font-black tracking-widest transition-all hover:text-indigo-500 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Contact</a>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>
              <Link to="/auth" className={`text-[11px] uppercase font-black tracking-widest transition-all hover:text-indigo-500 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Log in</Link>
              <Link to="/auth" className="relative group p-[2px] rounded-2xl overflow-hidden shadow-2xl">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl" />
                <div className={`relative px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${isDark ? "bg-zinc-900 text-white group-hover:bg-transparent" : "bg-white text-indigo-600 group-hover:bg-transparent group-hover:text-white"
                  }`}>
                  Sign Up Free
                </div>
              </Link>
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-2xl transition-all ${isDark ? "text-zinc-400 bg-zinc-900 border border-white/5" : "text-slate-600 bg-slate-100 border border-black/5"}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-3 rounded-2xl transition-all ${isDark ? "text-zinc-400 bg-zinc-900 border border-white/5" : "text-slate-600 bg-slate-100 border border-black/5"}`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`md:hidden border-t p-6 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}
            >
              <div className="flex flex-col space-y-6">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Features</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Contact</a>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Log in</Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20">
                  Access Platform
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-32 pb-40 px-6">
          {/* Advanced Background Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000" />
          </div>

          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 border ${isDark ? "bg-white/5 border-white/10 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              PoliPulse is now available
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`max-w-5xl font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter leading-[0.9] mb-12 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Master your portfolio with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">radical clarity</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`max-w-3xl text-xl sm:text-2xl font-medium leading-relaxed mb-16 opacity-70 ${isDark ? "text-zinc-300" : "text-slate-600"}`}
            >
              Enter the new era of insurance management.
              Real-time insights, zero-trust security, and instant global accessibility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link to="/auth" className="group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30">
                Launch Dashboard
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className={`flex items-center justify-center px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 border ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-xl"
                }`}>
                Explore Technology
              </a>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className={`py-40 relative ${isDark ? "bg-zinc-900/40" : "bg-slate-100/50"}`}>
          <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
            <div className="text-center mb-32">
              <h2 className="text-[10px] font-black tracking-[0.4em] text-indigo-500 uppercase mb-4">Core Infrastructure</h2>
              <h3 className={`text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Engineered for maximum <br /> enterprise performance
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  key={i}
                  className={`p-10 rounded-[3rem] border transition-all hover:-translate-y-2 group ${isDark
                    ? "bg-zinc-900 border-white/5 hover:border-white/10 shadow-2xl shadow-black/40"
                    : "bg-white border-black/5 hover:border-black/10 shadow-xl shadow-slate-200/50"
                    }`}
                >
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transform group-hover:rotate-6 transition-all ${isDark ? "bg-zinc-950 border border-white/5" : "bg-slate-50 border border-black/5"
                    }`}>
                    {feature.icon}
                  </div>
                  <h4 className={`text-2xl font-black mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{feature.title}</h4>
                  <p className={`text-lg font-medium opacity-60 leading-relaxed ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-indigo-900/50 via-transparent to-transparent opacity-50" />

          <div className="max-w-5xl mx-auto px-8 relative z-10 text-center">
            <h2 className="text-6xl sm:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
              Deploy PoliPulse <br /> across your organization.
            </h2>
            <p className="text-zinc-400 text-2xl mb-16 font-medium max-w-3xl mx-auto leading-relaxed">
              Scale your management capabilities with our advanced multi-user architecture and secure API layer.
            </p>
            <Link to="/auth" className="inline-flex items-center gap-4 bg-white text-black hover:bg-indigo-50 px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[13px] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.15)]">
              Initialize Account
              <ChevronRight className="w-6 h-6 text-indigo-600" />
            </Link>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className={`py-40 border-b ${isDark ? "bg-zinc-950 border-white/5" : "bg-white border-black/5"}`}>
          <div className="max-w-4xl mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className={`text-5xl font-black tracking-tight mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                Precision Support
              </h2>
              <p className={`text-xl font-medium opacity-60 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                Connect with our technical team for custom enterprise integrations.
              </p>
            </div>

            <form className={`p-12 rounded-[3.5rem] border shadow-3xl ${isDark ? "bg-zinc-900 border-white/5 shadow-black/50" : "bg-white border-black/5 shadow-slate-200/50"
              }`} onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <label className={`text-[10px] uppercase font-black tracking-[0.2em] opacity-40 ml-2 ${isDark ? "text-white" : "text-slate-900"}`}>Identification</label>
                  <input type="text" className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold placeholder:opacity-30 transition-all ${isDark
                    ? "bg-zinc-950 border-white/5 text-white focus:border-indigo-500"
                    : "bg-slate-50 border-black/5 text-slate-900 focus:border-indigo-500"
                    }`} placeholder="Full Name" />
                </div>
                <div className="space-y-4">
                  <label className={`text-[10px] uppercase font-black tracking-[0.2em] opacity-40 ml-2 ${isDark ? "text-white" : "text-slate-900"}`}>Gateway Email</label>
                  <input type="email" className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold placeholder:opacity-30 transition-all ${isDark
                    ? "bg-zinc-950 border-white/5 text-white focus:border-indigo-500"
                    : "bg-slate-50 border-black/5 text-slate-900 focus:border-indigo-500"
                    }`} placeholder="work@organization.com" />
                </div>
              </div>
              <div className="space-y-4 mb-10">
                <label className={`text-[10px] uppercase font-black tracking-[0.2em] opacity-40 ml-2 ${isDark ? "text-white" : "text-slate-900"}`}>Detailed Request</label>
                <textarea rows={5} className={`w-full px-6 py-4 rounded-3xl border outline-none font-bold placeholder:opacity-30 transition-all ${isDark
                  ? "bg-zinc-950 border-white/5 text-white focus:border-indigo-500"
                  : "bg-slate-50 border-black/5 text-slate-900 focus:border-indigo-500"
                  }`} placeholder="Describe your technical requirements..." />
              </div>
              <button type="button" className="w-full bg-indigo-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-xs py-6 rounded-[2.5rem] transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98]">
                Establish Connection
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={`py-20 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
            <img src={isDark ? logoLight : logoDark} alt="PoliPulse Logo" className="h-10 w-10 grayscale opacity-50" />
            <span className={`font-black text-2xl tracking-tighter opacity-50 ${isDark ? "text-white" : "text-slate-900"}`}>PoliPulse Inc.</span>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
            &copy; {new Date().getFullYear()} CORE UNIT 108. All Systems Operational.
          </p>
          <div className="flex items-center gap-10">
            <div className="flex space-x-10">
              <Link to="/privacy" className={`text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-100 opacity-40 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Privacy Policy</Link>
              <Link to="/terms" className={`text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-100 opacity-40 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Terms of Service</Link>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-4 rounded-3xl transition-all border group ${isDark
                  ? "bg-zinc-900 border-white/5 hover:border-white/10 text-indigo-400"
                  : "bg-slate-50 border-black/5 hover:bg-slate-100 text-indigo-600"
                }`}
            >
              {isDark ? <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform" /> : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
