import React, { useEffect, useState } from "react";
import { supabase } from "../models/supabaseClient";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaUser,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

interface Props {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}

function HomePage({ policies, setPolicies }: Props) {
  const { isDark } = useTheme();
  const [searchTerm] = useState("");
  const [filter, setFilter] =
    useState<"all" | "active" | "expiring" | "expired">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(3);

  const navigate = useNavigate();

  const filterKeys = ["all", "active", "expiring", "expired"] as const;
  type FilterKey = (typeof filterKeys)[number];

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("policy")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setPolicies(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, [setPolicies]);

  // 🔥 AUTO SLIDE
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quickNav.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % quickNav.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + quickNav.length) % quickNav.length);
  };

  const getDaysDiff = (date: string) =>
    (new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24);

  const expiringPolicies = policies.filter(
    (p) => getDaysDiff(p.renewal_date) > 0 && getDaysDiff(p.renewal_date) <= 30
  );

  const counts: Record<FilterKey, number> = {
    all: policies.length,
    active: policies.filter((p) => getDaysDiff(p.renewal_date) > 30).length,
    expiring: expiringPolicies.length,
    expired: policies.filter((p) => getDaysDiff(p.renewal_date) < 0).length,
  };

  const filteredPolicies = policies
    .filter((p) =>
      p.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => {
      const diff = getDaysDiff(p.renewal_date);
      if (filter === "active") return diff > 30;
      if (filter === "expiring") return diff > 0 && diff <= 30;
      if (filter === "expired") return diff < 0;
      return true;
    });

  const handleNavClick = async (path: string) => {
    if (path === "/logout") {
      await supabase.auth.signOut();
      navigate("/");
    } else {
      navigate(path);
    }
  };

  const quickNav = [
    { title: "Client", icon: <FaUser />, path: "/holder/:id", color: "#6366f1" },
    { title: "Company", icon: <FaClipboardList />, path: "/company/_", color: "#f59e0b" },
    { title: "Policy", icon: <FaEdit />, path: "/add", color: "#10b981" },
    { title: "Analytics", icon: <FaChartBar />, path: "/reports", color: "#8b5cf6" },
    { title: "Settings", icon: <FaCog />, path: "/settings", color: "#f97316" },
    { title: "Profile", icon: <FaUser />, path: "/profile", color: "#3b82f6" },
    { title: "Logout", icon: <FaSignOutAlt />, path: "/logout", color: "#ef4444" },
  ];

  if (loading)
    return <div className="text-center mt-10">Loading...</div>;

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="px-4 md:px-10">

      {/* 🔥 HERO */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full min-h-[400px] mt-6 mb-14 px-4 md:px-10 gap-10">

        {/* 🔥 HERO LEFT */}
        <div className="flex-1 flex flex-col justify-center items-center text-left px-6">
          <div className="max-w-md text-center md:text-left">
            <img
              src={isDark ? "/logo1.png" : "/logo2.png"}
              className="w-24 h-24 mb-4 rounded-xl mx-auto md:mx-0"
            />
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10vw] font-extrabold leading-tight text-white dark:text-black">
              PoliPulse
            </h1>

            <p className="mt-3 text-lg font-semibold text-blue-900 dark:text-blue-500">
              Manage everything in one place
            </p>

          </div>
        </div>


        {/* 🔥 QUICKNAV RIGHT */}
        <div className="flex-1 relative w-full h-[360px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
            {quickNav.map((nav, index) => {
              const offset = index - currentIndex;
              const total = quickNav.length;

              let pos = (offset + total) % total;
              if (pos > Math.floor(total / 2)) pos = pos - total;

              const isCenter = pos === 0;
              const isFront = Math.abs(pos) === 1;
              const isBack = Math.abs(pos) === 2;

              return (
                <div
                  key={nav.title}
                  onClick={() => handleNavClick(nav.path)}
                  className="absolute transition-all duration-500 ease-in-out cursor-pointer flex items-center justify-center"
                  style={{
                    transform: `translateX(${pos * 55}%) scale(${isCenter ? 1 : isFront ? 0.95 : isBack ? 0.75 : 0.6}) rotateY(${pos * -10}deg)`,
                    zIndex: isCenter ? 30 : isFront ? 25 : isBack ? 10 : 0,
                    opacity: isCenter ? 1 : isFront ? 1 : isBack ? 0.35 : 0,
                    filter: isBack ? "blur(6px)" : "blur(0px)",
                    visibility: Math.abs(pos) > 2 ? "hidden" : "visible",
                  }}
                >
                  <div
                    className="w-44 h-48 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl"
                    style={{
                      background: nav.color,
                      boxShadow: isCenter ? "0 25px 50px rgba(0,0,0,0.35)" : "0 15px 30px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="text-3xl mb-2">{nav.icon}</div>
                    <span className="font-semibold">{nav.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NAV BUTTONS */}
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white"
          >
            ←
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white"
          >
            →
          </button>
        </div>
      </div>

      {/* 🔍 SEARCH */}

      {/* 🔥 FILTER CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 mt-4">
        {filterKeys.map((key) => (
          <div
            key={key}
            onClick={() => setFilter(key)}
            className={`
        cursor-pointer p-6 rounded-2xl flex flex-col items-center justify-center
        text-center font-bold transition-all duration-300
        ${filter === key
                ? "border-4 border-indigo-600 bg-indigo-600/20"
                : "border-2 border-gray-400 dark:border-zinc-700 bg-gray-200/20 dark:bg-zinc-900/40"}
        hover:scale-105 shadow-sm
      `}
          >
            <div className="text-3xl md:text-4xl mb-2 text-indigo-700 dark:text-indigo-400">
              {counts[key]}
            </div>
            <div className="text-lg md:text-xl capitalize text-gray-800 dark:text-white">
              {key}
            </div>
          </div>
        ))}
      </div>


      {/* 📄 TABLE */}
      <PolicyTable
        policies={filteredPolicies}
        setPolicies={setPolicies}
      />
    </div>
  );
}

export default HomePage;
