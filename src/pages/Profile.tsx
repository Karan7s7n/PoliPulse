import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../models/supabaseClient";
import { FaUserCircle, FaEdit, FaSave, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

// --- Profile Context ---
interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  loadingProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.user.id)
          .single();
        if (!error && data) setProfile(data);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadingProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// --- Profile Page ---
interface ProfileProps {}

const ProfilePage: React.FC<ProfileProps> = () => {
  const { isDark } = useTheme();
  const { profile, setProfile, loadingProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("✅ Identity records updated successfully.");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 4000);
    } else {
      setMessage("❌ Error: Failed to synchronize records.");
    }
  };

  if (loadingProfile) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 font-black uppercase tracking-widest text-[10px] opacity-40 text-indigo-500">Decrypting Identity Data</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-rose-500 font-black uppercase tracking-widest">
        <p>Access Denied: Re-authentication Required</p>
      </div>
    );
  }

  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none font-bold transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-600"}`;
  const labelClass = `text-[10px] uppercase font-black tracking-[0.2em] opacity-40 mb-2 block ml-2 ${isDark ? "text-white" : "text-slate-900"}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="container mx-auto px-6 py-12 max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Identity Card */}
            <div className="w-full lg:w-1/3 sticky top-32">
                <div className={`p-10 rounded-[3rem] shadow-2xl border flex flex-col items-center text-center transition-all duration-500 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-black/5"}`}>
                    <div className="relative group mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative p-2 bg-white dark:bg-zinc-950 rounded-full shadow-2xl">
                             <FaUserCircle size={160} className="text-indigo-600 transition-transform group-hover:scale-105" />
                        </div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center text-white">
                            <FaShieldAlt size={16} />
                        </div>
                    </div>
                    
                    <h3 className={`font-black text-3xl tracking-tighter mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{profile.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/10">CORE SYSTEMS OPERATOR</p>
                    
                    <div className={`w-full py-6 px-4 rounded-3xl border ${isDark ? 'bg-zinc-950/50 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                        <p className={`text-xs font-bold leading-relaxed m-0 opacity-60 ${isDark ? "text-zinc-300" : "text-slate-600"}`}>
                            Your identity is secured with PoliPulse Enterprise Encryption. Last synchronized: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Configuration */}
            <div className="w-full lg:w-2/3">
                <div className={`p-12 rounded-[3.5rem] shadow-3xl border transition-all duration-500 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-black/5"}`}>
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className={`font-black text-3xl tracking-tighter flex items-center gap-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                                <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                                Profile Intelligence
                            </h2>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronize your personal vector data</p>
                        </div>
                        
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-2xl ${isDark ? 'bg-white/5 text-indigo-400 hover:bg-white/10' : 'bg-slate-50 text-indigo-600 hover:bg-slate-100'}`}
                            >
                                <FaEdit /> Unlock Records
                            </button>
                        )}
                    </div>

                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className={labelClass}><FaEnvelope className="inline mr-2" /> Primary Email</label>
                                <input 
                                    type="email" 
                                    value={profile.email} 
                                    disabled 
                                    className={`${inputClass} opacity-30 cursor-not-allowed`}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className={labelClass}><FaPhone className="inline mr-2" /> Mobile Terminal</label>
                                <input
                                    type="text"
                                    value={profile.phone || ""}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className={inputClass}
                                    placeholder="+XX XXXXXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className={labelClass}><FaMapMarkerAlt className="inline mr-2" /> Geographical Vector (Address)</label>
                            <textarea
                                value={profile.address || ""}
                                disabled={!isEditing}
                                rows={3}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                className={`${inputClass} resize-none`}
                                placeholder="Street, City, State, Country"
                            />
                        </div>

                        <AnimatePresence>
                            {(isEditing || message) && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5"
                                >
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => { setIsEditing(false); setMessage(""); }}
                                                className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100 transition-all ${isDark ? 'text-white' : 'text-slate-900'}`}
                                            >
                                                Abort Changes
                                            </button>
                                            <button
                                                className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all transform hover:-translate-y-1 active:scale-95"
                                                onClick={handleSaveProfile}
                                            >
                                                Commit Identity <FaSave />
                                            </button>
                                        </>
                                    ) : (
                                        <p className="w-full text-center text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 py-5 rounded-2xl border border-emerald-500/20">
                                            {message}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Wrapping for export
const ProfilePageWithProvider: React.FC<ProfileProps> = () => (
  <ProfileProvider>
    <ProfilePage />
  </ProfileProvider>
);

export default ProfilePageWithProvider;
