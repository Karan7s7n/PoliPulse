import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../models/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  X,
  Menu,
  ChevronRight
} from "lucide-react";

function Navbar() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ controlled here

  // ✅ Detect admin from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data?.user?.email;

      // 🔥 CHANGE THIS EMAIL TO YOUR ADMIN EMAIL
      if (email === "karansinghn.07@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    getUser();
  }, []);

  // ✅ Safe navLinks (no mutation)
  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/reports", label: "Analytics", icon: BarChart3 },
    { path: "/add", label: "Add Policy", icon: PlusCircle },
    ...(isAdmin
      ? [{ path: "/admin", label: "Admin Console", icon: ShieldCheck }]
      : [])
  ];

  const logoSrc = isDark ? logoLight : logoDark;

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSidebarOpen(false);
      navigate("/", { replace: true });
    } catch {
      alert("Logout failed");
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-2000 w-[95%] max-w-5xl">
        <nav
          className="flex items-center justify-between px-6 py-3 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300"
          style={{
            background: isDark ? "rgba(25, 25, 25, 0.7)" : "rgba(255, 255, 255, 0.7)",
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            color: isDark ? "#fff" : "#111",
          }}
        >
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigate("/dashboard")}
          >
            <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-md" />
            <span className="font-semibold text-lg">PoliPulse</span>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full transition-colors"
            style={{
              background: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            }}
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-1500 transition-opacity duration-300 ${
          sidebarOpen ? "bg-black/60 backdrop-blur-sm opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full z-2001 transition-transform duration-300 shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "300px",
          background: isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          color: isDark ? "#fff" : "#111",
        }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${
            isDark
              ? "hover:bg-white/10 text-white/40 hover:text-white"
              : "hover:bg-black/5 text-black/40 hover:text-black"
          }`}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 p-8">
          <img src={logoSrc} alt="PoliPulse Logo" className="w-10 h-10 rounded-xl shadow-xl rotate-3" />
          <div>
            <div className="font-black text-xl uppercase">PoliPulse</div>
            <div className="text-[10px] uppercase opacity-40">User Panel</div>
          </div>
        </div>

        <div className="px-6 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                    : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-bold text-sm">{link.label}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </div>

        <div className="px-6 mt-10 space-y-2 border-t pt-10">
          <button onClick={() => handleNavigate("/profile")} className="w-full text-left py-2">My Profile</button>
          <button onClick={() => handleNavigate("/settings")} className="w-full text-left py-2">Settings</button>
          <button onClick={handleLogout} className="w-full text-left py-2 text-red-500">Logout</button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
