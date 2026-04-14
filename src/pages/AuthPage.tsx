import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../models/supabaseClient";
import { motion } from "framer-motion";
import {
  FaUser,
  FaLock,
  FaGoogle,
  FaGithub,
  FaLinkedin,
  FaMicrosoft,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

interface AuthPageProps {}

const AuthPage: React.FC<AuthPageProps> = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("✅ Logged in successfully!");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("✅ Signup successful! Check your email to verify your account.");
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setMessage("⚠️ Enter your email to reset password.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) setMessage(`❌ ${error.message}`);
    else setMessage("✅ Password reset link sent to your email.");
  };

  const handleOAuthLogin = async (
    provider: "google" | "github" | "linkedin" | "azure"
  ) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center transition-colors duration-500 ${isDark ? "bg-zinc-950" : "bg-slate-50"}`}
    >
      <motion.div
        className={`flex flex-col md:flex-row w-11/12 md:w-3/4 lg:w-2/3 shadow-[0_50px_100px_rgba(0,0,0,0.25)] rounded-[3rem] overflow-hidden border ${isDark ? 'border-white/5' : 'border-black/5'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Left Section */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center text-center p-12 relative overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #18181b, #27272a)"
              : "linear-gradient(135deg, #4f46e5, #6366f1)",
            color: "#fff",
          }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <img src={isDark ? logoLight : logoDark} alt="PoliPulse Logo" className="w-24 h-24 mb-6 rounded-3xl shadow-2xl transform hover:rotate-6 transition-all" />
            <h1 className="font-black mb-2 text-5xl tracking-tighter uppercase">
              PoliPulse
            </h1>
            <p className="text-xl font-bold opacity-80 uppercase tracking-widest text-[10px]">
              The Intelligence Layer for Modern Insurance
            </p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Right Section */}
        <div
          className={`w-full md:w-1/2 p-12 flex flex-col justify-center ${isDark ? "bg-zinc-900 border-l border-white/5" : "bg-white border-l border-black/5"}`}
        >
          <div className="max-w-sm mx-auto w-full">
            <h3 className={`font-black mb-8 text-3xl tracking-tight text-center ${isDark ? "text-white" : "text-slate-900"}`}>
              {isLogin ? "Sign In" : "Register"}
            </h3>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-zinc-500 group-focus-within:text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-600"}`}>
                  <FaUser />
                </div>
                <input
                  type="email"
                  className={`w-full pl-12 pr-6 py-4 rounded-2xl border outline-none font-bold transition-all ${
                    isDark
                      ? "bg-zinc-950 text-white border-zinc-800 focus:border-indigo-500"
                      : "bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-600"
                  }`}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-zinc-500 group-focus-within:text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-600"}`}>
                  <FaLock />
                </div>
                <input
                  type="password"
                  className={`w-full pl-12 pr-6 py-4 rounded-2xl border outline-none font-bold transition-all ${
                    isDark
                      ? "bg-zinc-950 text-white border-zinc-800 focus:border-indigo-500"
                      : "bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-600"
                  }`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end p-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={`text-[10px] uppercase font-black tracking-widest transition-opacity hover:opacity-100 opacity-40 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
                >
                  Reset Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-black uppercase tracking-widest text-xs py-5 rounded-[2rem] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                style={{
                  background: isDark
                    ? "#fff"
                    : "#1e1b4b",
                  color: isDark ? "#000" : "#fff",
                }}
              >
                {loading ? "Authenticating..." : isLogin ? "Access Account" : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
                <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Secure Login</span>
                <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "google" as const, icon: <FaGoogle /> },
                { id: "github" as const, icon: <FaGithub /> },
                { id: "linkedin" as const, icon: <FaLinkedin /> },
                { id: "azure" as const, icon: <FaMicrosoft /> }
              ].map(provider => (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthLogin(provider.id)}
                  className={`flex justify-center items-center py-4 rounded-2xl border transition-all text-xl ${
                    isDark 
                      ? "bg-white/5 border-white/5 hover:bg-white/10 text-white" 
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  {provider.icon}
                </button>
              ))}
            </div>

            {message && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-500"
              >
                {message}
              </motion.p>
            )}

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center mt-10">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className={`text-[10px] font-black uppercase tracking-widest border-b-2 hover:border-indigo-500 transition-all ${isDark ? 'text-white border-white/10' : 'text-slate-900 border-black/10'}`}
              >
                {isLogin ? "Need an entry? Register Free" : "Member? Sign In Now"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
