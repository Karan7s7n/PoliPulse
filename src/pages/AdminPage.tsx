import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLock, FaSignOutAlt, FaUsers, FaDatabase,
  FaChartLine, FaSearch, FaUserCheck, FaUserSlash, FaCrown
} from "react-icons/fa";
import {
  Home,
  BarChart2,
  List,
  Folder,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  MessageSquare,
  ExternalLink,
  Users as UsersIcon,
  ChevronDown,
  LayoutGrid
} from "lucide-react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "../models/supabaseClient";
import type { Policy, Profile } from "../models/supabaseTypes";
import { useNavigate } from "react-router-dom";
import PolicyTable from "../components/PolicyTable";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

// --- SIDEBAR HELPER COMPONENTS ---

const BadgeWithDot = ({ children, color = "success" }: any) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${color === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
    }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${color === "success" ? "bg-emerald-500" : "bg-zinc-500"}`} />
    {children}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }: any) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${active
        ? (isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600")
        : (isDark ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={active ? "" : "opacity-70 group-hover:opacity-100"} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {badge && <div>{badge}</div>}
    </button>
  );
};

const SidebarCollapse = ({ icon: Icon, label, items }: any) => {
  const { isDark } = useTheme();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${isDark ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="opacity-70" />
          <span className="font-bold text-sm tracking-tight">{label}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-1 mt-1 pl-10 pr-2"
          >
            {items.map((it: any, idx: number) => (
              <button
                key={idx}
                onClick={it.onClick}
                className={`w-full text-left py-1.5 text-xs font-bold transition-all flex items-center justify-between rounded-lg px-2 ${isDark ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                  }`}
              >
                <span className="truncate pr-2">{it.label}</span>
                {it.badge !== undefined && <span className={`px-1.5 py-0.5 rounded-md shrink-0 ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-500"}`}>{it.badge}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarDivider = () => {
  const { isDark } = useTheme();
  return (
    <div className={`h-px w-full my-3 ${isDark ? "bg-zinc-800/50" : "bg-slate-100"}`} />
  );
};

const AdminPage: React.FC<{
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ setIsAdmin }) => {
  const { isDark } = useTheme();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "data">("overview");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalPolicies: 0, premiumUsers: 0, totalPremiumRevenue: 0 });
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const topCompanies = React.useMemo(() => {
    const counts = allPolicies.reduce((acc: any, p) => {
      const name = p.company_name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([label, badge]) => ({
        label,
        badge,
        onClick: () => {
          setActiveTab("data");
          // We need a way to pass this to PolicyTable or set a local filter
          // For now, we'll just log it or if PolicyTable uses a search prop...
          // In this architecture, AdminPage passes allPolicies to PolicyTable.
          // We should probably filter allPolicies or use a search state.
          setSearchTerm(label as string);
        }
      }));
  }, [allPolicies]);

  // 🔐 Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === "karansinghn.07@gmail.com" && cleanPass === "123456") {
      localStorage.setItem("adminAuth", "true");
      setIsAdminAuth(true);
      setIsAdmin(true);
      setError("");
      fetchAllData();
    } else {
      setError("❌ Invalid Admin Credentials");
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuth(false);
    setIsAdmin(false);
    localStorage.removeItem("adminAuth");
    navigate("/");
  };

  // 📊 Fetch Global Data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profiles } = await supabase.from("profiles").select("*");
      if (profiles) setAllUsers(profiles);

      // 2. Fetch all policies (Admin Bypass)
      const { data: policies } = await supabase.from("policy").select("*");
      if (policies) setAllPolicies(policies);

      // 3. Stats Calculation
      if (profiles && policies) {
        const premium = profiles.filter(u => u.subscription_tier === "premium").length;
        setStats({
          totalUsers: profiles.length,
          totalPolicies: policies.length,
          premiumUsers: premium,
          totalPremiumRevenue: premium * 999 // Based on UpgradePage price
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ Management Actions
  const toggleUserStatus = async (user: Profile) => {
    const newStatus = user.status === "active" ? "blocked" : "active";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", user.id);
    if (!error) fetchAllData();
  };

  const toggleUserTier = async (user: Profile) => {
    const newTier = user.subscription_tier === "premium" ? "free" : "premium";
    const { error } = await supabase.from("profiles").update({ subscription_tier: newTier }).eq("id", user.id);
    if (!error) fetchAllData();
  };

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAdminAuth(true);
      fetchAllData();
    }
  }, []);

  if (!isAdminAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <motion.div
          className={`p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-slate-100"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl rotate-12">
              <FaLock size={30} />
            </div>
          </div>
          <h2 className={`text-3xl font-black text-center mb-8 ${isDark ? "text-white" : "text-slate-900"}`}>Admin Console</h2>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-2xl outline-none transition-all border ${isDark ? "bg-zinc-800 border-zinc-700 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin Email"
            />
            <input
              type="password"
              autoComplete="current-password"
              className={`w-full px-5 py-4 rounded-2xl outline-none transition-all border ${isDark ? "bg-zinc-800 border-zinc-700 focus:border-indigo-500" : "bg-slate-50 border-slate-200 focus:border-indigo-500"}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {error && <p className="text-red-500 text-center font-bold text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              Verify & Enter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 📊 Chart Data Prepping
  const userDistData = [
    { name: "Premium", value: stats.premiumUsers, color: "#f59e0b" },
    { name: "Free", value: stats.totalUsers - stats.premiumUsers, color: "#3b82f6" }
  ];

  const policyTypeCount = allPolicies.reduce((acc: any, p) => {
    acc[p.business_type] = (acc[p.business_type] || 0) + 1;
    return acc;
  }, {});

  const policyDistData = Object.entries(policyTypeCount).map(([name, value]) => ({ name, value })).slice(0, 5);


  return (
    <div className={`min-h-screen flex ${isDark ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}>

      {/* 🚀 SIDEBAR (Untitled UI Style) */}
      <aside className={`w-72 h-screen sticky top-0 flex flex-col border-r lg:flex ${isDark ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-slate-200"
        }`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <img src={isDark ? logoLight : logoDark} alt="PoliPulse Logo" className="w-12 h-12 rounded-2xl shadow-xl transform rotate-3" />
            <div>
              <div className="font-black text-xl tracking-tight leading-none text-black dark:text-white uppercase">PoliPulse</div>
              <div className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 dark:opacity-60 text-black dark:text-white">Admin Panel</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <SidebarItem icon={Home} label="Home" onClick={() => navigate("/dashboard")} />
            <SidebarItem icon={BarChart2} label="Dashboard" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <SidebarItem icon={UsersIcon} label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
            <SidebarItem icon={List} label="Projects" active={activeTab === "data"} onClick={() => setActiveTab("data")} />

            <SidebarDivider />

            <SidebarCollapse
              icon={Folder}
              label="Top Companies"
              items={topCompanies.length > 0 ? topCompanies : [{ label: "No data yet", onClick: () => { } }]}
            />

            <SidebarDivider />

            <SidebarItem icon={PieChartIcon} label="Reporting" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <SidebarItem icon={SettingsIcon} label="Settings" onClick={() => navigate("/settings")} />
            <SidebarItem
              icon={MessageSquare}
              label="Support"
              onClick={() => alert("Connecting to enterprise support...")}
              badge={<BadgeWithDot>Online</BadgeWithDot>}
            />
            <SidebarItem icon={ExternalLink} label="Visit Site" onClick={() => navigate("/")} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center text-white font-bold uppercase ring-2 ring-white/10 overflow-hidden">
              {localStorage.getItem("adminAuth") === "true" ? "A" : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm truncate text-black dark:text-white">Admin User</div>
              <div className="text-xs opacity-50 dark:opacity-60 truncate text-black dark:text-white">admin@polipulse.com</div>
            </div>
            <button onClick={handleAdminLogout} className="text-zinc-500 hover:text-red-500 transition-colors">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* 🏙️ MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full overflow-y-auto">
          <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg">
                <LayoutGrid size={32} />
              </div>
                <div>
                  <h1 className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{activeTab === "overview" ? "System Dashboard" : activeTab === "users" ? "User Management" : "Master Data"}</h1>
                  <p className={`font-medium mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>{activeTab === "overview" ? "Platform-wide management and analytics" : activeTab === "users" ? "Moderate users and subscription tiers" : "Full platform data export and viewing"}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex p-1 bg-zinc-800/10 dark:bg-zinc-800 rounded-2xl border border-white/5 lg:hidden">
                {(["overview", "users", "data"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl font-bold transition-all capitalize ${
                      activeTab === tab 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : (isDark ? "text-zinc-400 hover:bg-white/10" : "text-slate-600 hover:bg-black/5")
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Users", val: stats.totalUsers, icon: <FaUsers />, color: "bg-blue-500" },
                    { label: "Total Policies", val: stats.totalPolicies, icon: <FaDatabase />, color: "bg-indigo-500" },
                    { label: "Premium Users", val: stats.premiumUsers, icon: <FaCrown />, color: "bg-amber-500" },
                    { label: "Platform Revenue", val: `₹${stats.totalPremiumRevenue}`, icon: <FaChartLine />, color: "bg-emerald-500" },
                  ].map((s, idx) => (
                    <div key={idx} className={`p-8 rounded-4xl shadow-xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                      <div className={`p-3 w-fit rounded-2xl text-white mb-4 ${s.color}`}>
                        {s.icon}
                      </div>
                      <h4 className={`font-bold mb-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>{s.label}</h4>
                      <div className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={`p-8 rounded-[2.5rem] shadow-xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                    <h3 className={`text-xl font-black mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Recent User Activity</h3>
                    <div className="space-y-4">
                      {allUsers.slice(0, 5).map(u => (
                        <div key={u.id} className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white uppercase">
                              {u.email?.[0] || "?"}
                            </div>
                            <div>
                              <div className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{u.email}</div>
                              <div className={`text-xs uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-slate-400"}`}>{u.subscription_tier}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-black ${u.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                            {u.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] shadow-xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                    <h3 className={`text-xl font-black mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>User Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDistData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {userDistData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderRadius: "12px", border: "none" }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] shadow-xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                    <h3 className={`text-xl font-black mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Policy Categories</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={policyDistData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3f3f46" : "#e2e8f0"} vertical={false} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#a1a1aa" : "#64748b", fontSize: 12 }}
                          />
                          <YAxis hide />
                          <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{ backgroundColor: isDark ? "#18181b" : "#fff", borderRadius: "12px", border: "none" }}
                          />
                          <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className={`flex justify-between items-center p-4 rounded-2xl ${isDark ? "bg-zinc-800/40" : "bg-slate-100"}`}>
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border w-full max-sm:max-w-sm ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                    <FaSearch className={`opacity-50 ${isDark ? "text-white" : "text-slate-500"}`} />
                    <input
                      type="text"
                      placeholder="Search users by email..."
                      className={`bg-transparent outline-none w-full ${isDark ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400"}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className={`overflow-hidden rounded-[2.5rem] shadow-2xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                  <table className="w-full text-left">
                    <thead className={isDark ? "bg-zinc-800/50" : "bg-slate-100"}>
                      <tr className="text-xs uppercase tracking-widest font-black opacity-60 dark:opacity-80 text-black dark:text-white">
                        <th className="px-8 py-5">User</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5">Tier</th>
                        <th className="px-8 py-5">Managed At</th>
                        <th className="px-8 py-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                      {allUsers.filter(u => (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                        <tr key={u.id} className={`transition-colors group ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                          <td className="px-8 py-6">
                            <div className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{u.email}</div>
                            <div className={`text-xs font-medium ${isDark ? "text-zinc-500" : "text-slate-400"}`}>{u.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1 rounded-full text-xs font-black ${u.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`flex items-center gap-2 font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {u.subscription_tier === "premium" ? <FaCrown className="text-amber-500" /> : null}
                              <span className="capitalize">{u.subscription_tier}</span>
                            </div>
                          </td>
                          <td className={`px-8 py-6 text-sm font-medium ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                            {new Date(u.updated_at || "").toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleUserStatus(u)}
                                title={u.status === "active" ? "Block User" : "Unblock User"}
                                className={`p-3 rounded-xl transition-all ${u.status === "active" ? "bg-red-500/10 text-red-500 hover:bg-red-500" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500"} hover:text-white`}
                              >
                                {u.status === "active" ? <FaUserSlash /> : <FaUserCheck />}
                              </button>
                              <button
                                onClick={() => toggleUserTier(u)}
                                title="Toggle Tier"
                                className="p-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                              >
                                <FaCrown />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Data Tab */}
            {activeTab === "data" && (
              <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={`p-8 rounded-[2.5rem] shadow-2xl ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Master Policy Table</h3>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                      <FaSearch className={`opacity-50 ${isDark ? "text-white" : "text-slate-400"}`} />
                      <input
                        type="text"
                        placeholder="Filter results..."
                        className={`bg-transparent outline-none text-sm font-bold w-48 ${isDark ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400"}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className={`text-[10px] uppercase font-black ${isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Clear</button>
                      )}
                    </div>
                  </div>
                  {allPolicies.length === 0 ? (
                    <div className={`p-20 text-center opacity-50 border-2 border-dashed rounded-3xl ${isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-500"}`}>
                      Loading policies...
                    </div>
                  ) : (
                    <PolicyTable
                      policies={allPolicies.filter(p =>
                        p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.policy_no?.toLowerCase().includes(searchTerm.toLowerCase())
                      )}
                      setPolicies={setAllPolicies}
                      isAdmin={true}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
