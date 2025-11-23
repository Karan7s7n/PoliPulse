import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaUser,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

interface Props {
  darkMode: boolean;
  policies?: Policy[];
  setPolicies?: React.Dispatch<React.SetStateAction<Policy[]>>;
}

function HomePage({ darkMode }: Props) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] =
    useState<"all" | "active" | "expiring" | "expired">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showExpiringAlert, setShowExpiringAlert] = useState(true);

  const filterSectionRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const filterKeys = ["all", "active", "expiring", "expired"] as const;
  type FilterKey = (typeof filterKeys)[number];

  
  // Auto-hide Expiring Alert after 10 sec


useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    preloadImage("/logo1.png");
    preloadImage("/logo2.png");
  }, []);

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("policy").select("*");
      if (error) setError(error.message);
      else if (data) setPolicies(data as Policy[]);
      setLoading(false);
    };

    fetchPolicies();

    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
  if (expiringPolicies.length > 0) {
    const timer = setTimeout(() => {
      setShowExpiringAlert(false);
    }, 5000); // 10 sec

    return () => clearTimeout(timer);
  }
}, [expiringPolicies]);

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

  const scrollToFilter = () => {
    if (filterSectionRef.current) {
      filterSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExpiringAlertClick = () => {
    setFilter("expiring");
    scrollToFilter();
  };

  if (showSplash)
    return (
      <motion.div
        className={`d-flex flex-column justify-content-center align-items-center vh-100 ${
          darkMode ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        {/* Splash animation */}
        <motion.img
          key="logo"
          src={darkMode ? "/logo1.png" : "/logo2.png"}
          alt="PoliPulse Logo"
          style={{
            width: 150,
            height: 150,
            borderRadius: "20%",
            marginBottom: "1.5rem",
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.6, 1.1, 1],
            opacity: [0, 1, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{ duration: 1.8 }}
        />
      </motion.div>
    );

  if (loading)
    return <div className="container mt-4">Loading policies...</div>;
  if (error)
    return <div className="container mt-4 text-danger">{error}</div>;

  const darkColors: Record<FilterKey, string> = {
    all: "bg-secondary text-light",
    active: "bg-success text-light",
    expiring: "bg-warning text-dark",
    expired: "bg-danger text-light",
  };

  const lightColors: Record<FilterKey, string> = {
    all: "bg-info text-white",
    active: "bg-success text-white",
    expiring: "bg-warning text-dark",
    expired: "bg-danger text-white",
  };

  const icons: Record<FilterKey, React.ReactNode>
 = {
    all: <FaClipboardList />,
    active: <FaCheckCircle />,
    expiring: <FaExclamationTriangle />,
    expired: <FaTimesCircle />,
  };

  const quickNav = [
    { title: "Client", icon: <FaUser />, path: "/holder/:id", color: "#4f46e5" },
    { title: "Company", icon: <FaClipboardList />, path: "/company/_", color: "#f59e0b" },
    { title: "Policy", icon: <FaEdit />, path: "/add", color: "#10b981" },
    { title: "Analytics", icon: <FaChartBar />, path: "/reports", color: "#6366f1" },
    { title: "Settings", icon: <FaCog />, path: "/settings", color: "#f97316" },
    { title: "Profile", icon: <FaUser />, path: "/profile", color: "#3b82f6" },
    { title: "Logout", icon: <FaSignOutAlt />, path: "/logout", color: "#ef4444" },
  ];

  const handleNavClick = (path: string) => {
    if (path === "/logout") {
      supabase.auth.signOut();
      navigate("/auth");
    } else {
      navigate(path);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filter}
        className={`container home-page ${darkMode ? "dark-mode" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 🔥 EXPIRING ALERT BANNER */}
       <AnimatePresence>
  {expiringPolicies.length > 0 && showExpiringAlert && (
    <motion.div
      key="expiring-alert"
      className="shadow-lg position-relative mb-4"
      style={{
        cursor: "pointer",
        borderRadius: 14,
        backgroundColor: "#ff8c42", // 🔥 Modern Orange
        color: "white",
        padding: "18px 20px",
      }}
      onClick={handleExpiringAlertClick}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}  // ➜ Smooth fade+slide
      transition={{ duration: 0.45 }} // ➜ Smooth timing
    >
      {/* BIG CROSS ICON */}
      <FaTimes
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontSize: "28px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowExpiringAlert(false);
        }}
      />

      <h5 className="m-0 fw-bold" style={{ fontSize: "18px" }}>
        ⚠️ {expiringPolicies.length} Policies Expiring Soon — Click to View
      </h5>
    </motion.div>
  )}
</AnimatePresence>



        {/* === HERO SECTION === */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <img
            src={darkMode ? "/logo1.png" : "/logo2.png"}
            alt="PoliPulse Logo"
            style={{ width: 120, height: 120, marginBottom: "1rem" }}
          />
          <h1 className="fw-bold display-4">
            PoliPulse
          </h1>
          <p className="lead mt-2">
            Secure. Reliable. Smart.
          </p>
        </div>

        {/* QUICK NAV */}
        <div className="row mb-5 justify-content-center">
          {quickNav.map((nav) => (
            <motion.div
              className="col-md-3 col-6 mb-4 d-flex justify-content-center"
              key={nav.title}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="card text-center quick-nav-card"
                style={{ backgroundColor: nav.color, color: "white" }}
                onClick={() => handleNavClick(nav.path)}
              >
                <div className="icon">{nav.icon}</div>
                <h5 className="card-title">{nav.title}</h5>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="mb-4 d-flex justify-content-center">
          <input
            type="text"
            className={`form-control search-bar ${
              darkMode
                ? "bg-dark text-white border-secondary"
                : "bg-light text-dark border-dark"
            }`}
            placeholder="🔍 Search by Client Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* === FILTER SECTION === */}
        <div className="row mb-4" ref={filterSectionRef}>
          {filterKeys.map((key, index) => (
            <motion.div
              className="col-md-3 mb-3"
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`card text-center status-card ${
                  filter === key ? "selected-card" : ""
                } ${darkMode ? darkColors[key] : lightColors[key]}`}
                onClick={() => setFilter(key)}
              >
                <div className="card-body d-flex flex-column align-items-center">
                  <div className="mb-2 icon">{icons[key]}</div>
                  <h5 className="card-title">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h5>
                  <p className="card-text display-6">{counts[key]}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* POLICY TABLE */}
        <PolicyTable
          policies={filteredPolicies}
          setPolicies={setPolicies}
          darkMode={darkMode}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default HomePage;
