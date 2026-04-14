import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../models/supabaseClient";
import { useProfile } from "./Profile";
import {
  FaCog,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaGlobe,
  FaClock,
  FaMoon,
  FaSun,
  FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const { isDark, toggleTheme } = useTheme();
  const { profile, setProfile, loadingProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("IST");

  const handleSaveProfile = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", profile.id);

    if (!error) {
      setMessage("✅ Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Failed to update profile.");
    }
  };

  if (loadingProfile)
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black uppercase tracking-widest text-[10px] opacity-40">Syncing Profile Data</p>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center mt-20 text-rose-500 font-bold">
        <p>Authentication error. Please re-authenticate.</p>
      </div>
    );

  const cardClass = `p-10 rounded-[3rem] shadow-2xl border transition-all duration-500 ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-100"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none font-bold transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600"}`;
  const labelClass = `text-[10px] uppercase font-black tracking-[0.2em] opacity-40 mb-3 block ml-2 ${isDark ? "text-white" : "text-slate-900"}`;

  return (
    <AnimatePresence>
      <motion.div
        className="container mx-auto px-6 py-12 max-w-5xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-16 text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl mb-6 shadow-2xl ${isDark ? 'bg-zinc-900 text-indigo-400 border border-white/5' : 'bg-white text-indigo-600 border border-black/5'}`}>
                <FaCog />
            </div>
            <h1 className={`font-black text-5xl tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                System Preference
            </h1>
            <p className="mt-2 font-black uppercase tracking-[0.2em] text-[10px] opacity-40 text-indigo-500">Configure your PoliPulse experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 🌟 Interface Settings */}
            <div className="lg:col-span-5 flex flex-col gap-8">
                <div className={cardClass}>
                    <h4 className={`font-black mb-8 text-xl tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                        Interface
                    </h4>
                    
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10">
                            <div>
                                <h5 className="font-black text-xs uppercase tracking-widest m-0">Visual Theme</h5>
                                <p className="text-[10px] opacity-60 m-0 mt-1 uppercase tracking-widest font-bold">{isDark ? "Night Mode Active" : "Day Mode Active"}</p>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-white text-indigo-600 shadow-lg'}`}
                            >
                                {isDark ? <FaMoon /> : <FaSun />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className={labelClass}>
                                <FaClock className="inline mr-2" /> Global Timezone
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className={inputClass}
                            >
                                <option value="UTC">UTC (Universal)</option>
                                <option value="IST">Asia/Kolkata (IST)</option>
                                <option value="EST">America/New_York (EST)</option>
                                <option value="PST">America/Los_Angeles (PST)</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className={labelClass}>
                                <FaGlobe className="inline mr-2" /> System Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className={inputClass}
                            >
                                <option value="English">English (Global)</option>
                                <option value="Hindi">Hindi (In-Review)</option>
                                <option value="Spanish">Español</option>
                                <option value="French">Français</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 👤 Identity Settings */}
            <div className="lg:col-span-7">
                <div className={cardClass}>
                    <div className="flex justify-between items-center mb-10">
                        <h4 className={`font-black text-xl tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                            <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
                            Identity
                        </h4>
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className={`p-4 rounded-2xl transition-all active:scale-95 ${isDark ? 'bg-white/5 border border-white/5 text-indigo-400 hover:bg-white/10' : 'bg-slate-50 border border-black/5 text-indigo-600 hover:bg-slate-100'}`}
                            >
                                <FaEdit size={20} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-6 mb-12 p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/5 to-purple-600/5 border border-indigo-600/5">
                        <div className="relative group">
                            <FaUserCircle size={84} className="text-indigo-600 transition-transform group-hover:scale-105" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl"></div>
                        </div>
                        <div>
                            <h5 className={`font-black text-3xl tracking-tighter m-0 ${isDark ? "text-white" : "text-slate-900"}`}>{profile.name || "Access ID: Required"}</h5>
                            <p className="m-0 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 uppercase tracking-widest text-indigo-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className={labelClass}><FaEnvelope className="inline mr-2" /> Gateway Email</label>
                            <input 
                                type="email" 
                                value={profile.email} 
                                disabled 
                                className={`${inputClass} opacity-50 cursor-not-allowed`}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className={labelClass}><FaPhone className="inline mr-2" /> Secure Terminal</label>
                            <input
                                type="text"
                                value={profile.phone || ""}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                                className={inputClass}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className={labelClass}><FaMapMarkerAlt className="inline mr-2" /> Global Address</label>
                            <input
                                type="text"
                                value={profile.address || ""}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                disabled={!isEditing}
                                className={inputClass}
                                placeholder="HQ / Residential Address"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isEditing && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-12 flex items-center justify-between gap-4 border-t border-white/5 pt-10"
                            >
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100 transition-all ${isDark ? 'text-white' : 'text-slate-900'}`}
                                >
                                    Cancel Changes
                                </button>
                                <button
                                    className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:scale-95"
                                    onClick={handleSaveProfile}
                                >
                                    Commit Updates <FaSave />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {message && (
                        <motion.p 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 py-4 rounded-xl"
                        >
                            {message}
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Settings;
