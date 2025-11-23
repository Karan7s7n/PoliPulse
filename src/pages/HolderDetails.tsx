import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import lightLogo from "../assets/logo-light.png";
import darkLogo from "../assets/logo-dark.png";
import "../pages/HomePage.css";

const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

interface HolderDetailsProps {
  darkMode: boolean;
}

function HolderDetails({ darkMode }: HolderDetailsProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [holder, setHolder] = useState<Policy | null>(null);
  const [filter, setFilter] = useState<"All" | "Active" | "Expiring Soon" | "Expired">("All");
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Policy[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterKeys = ["All", "Active", "Expiring Soon", "Expired"] as const;
  type FilterKey = typeof filterKeys[number];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" as const } },
  };

  // Load all clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("policy").select("*");
      if (error) console.error(error);
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  // Load holder by ID
  const loadHolder = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase.from("policy").select("*").eq("id", id);
    if (error) console.error(error);
    if (data && data.length > 0) {
      setHolder(data[0]);
      setPolicies(data);
    }
    setLoading(false);
  };

  // Initial load from URL
  useEffect(() => {
    const id = window.location.pathname.split("/holder/")[1] ?? "";
    if (id) loadHolder(id);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter(c =>
    c.client_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredClients.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filteredClients[highlightedIndex]) {
        selectClient(filteredClients[highlightedIndex].id);
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  };

  const selectClient = (id: string) => {
    setDropdownOpen(false);
    setSearchText("");
    setHighlightedIndex(0);
    loadHolder(id);
  };

  const getStatus = (renewalDate: string) => {
    const today = new Date();
    const endDate = new Date(renewalDate);
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return "Expiring Soon";
    return "Active";
  };

  const counts: Record<FilterKey, number> = {
    All: policies.length,
    Active: policies.filter(p => getStatus(p.renewal_date) === "Active").length,
    "Expiring Soon": policies.filter(p => getStatus(p.renewal_date) === "Expiring Soon").length,
    Expired: policies.filter(p => getStatus(p.renewal_date) === "Expired").length,
  };

  const filteredPolicies = policies.filter(p =>
    filter === "All" ? true : getStatus(p.renewal_date) === filter
  );

  const icons: Record<FilterKey, JSX.Element> = {
    All: <FaClipboardList />,
    Active: <FaCheckCircle />,
    "Expiring Soon": <FaExclamationTriangle />,
    Expired: <FaTimesCircle />,
  };

  const lightColors: Record<FilterKey, string> = {
    All: "bg-info text-white",
    Active: "bg-success text-white",
    "Expiring Soon": "bg-warning text-dark",
    Expired: "bg-danger text-white",
  };

  const darkColors: Record<FilterKey, string> = {
    All: "bg-info text-white",
    Active: "bg-success text-white",
    "Expiring Soon": "bg-warning text-dark",
    Expired: "bg-danger text-white",
  };

  if (loading) {
    return (
      <div className={`d-flex flex-column justify-content-center align-items-center vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
        <motion.img
          src={darkMode ? darkLogo : lightLogo}
          alt="PoliPulse Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ width: "120px", height: "120px", marginBottom: "1rem" }}
        />
        <motion.h1 className="fw-bold display-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          PoliPulse
        </motion.h1>
      </div>
    );
  }

  return (
    <motion.div className={`container mt-4 holder-page ${darkMode ? "dark-mode" : ""}`} initial="hidden" animate="show" variants={fadeInUp}>

      {/* Autocomplete Search */}
      <div ref={dropdownRef} style={{ position: "relative" }} className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder={holder?.client_name || "Search Client..."}
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setDropdownOpen(true); setHighlightedIndex(0); }}
          onKeyDown={handleKeyDown}
        />
        {dropdownOpen && filteredClients.length > 0 && (
          <div className="card shadow" style={{ position: "absolute", width: "100%", maxHeight: "250px", overflowY: "auto", zIndex: 10 }}>
            {filteredClients.map((c, index) => (
              <div
                key={c.id}
                className={`p-2 ${index === highlightedIndex ? "bg-primary text-white" : "hover-bg-light"}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectClient(c.id)}
              >
                {c.client_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.h2
  className={`mb-4 text-center fw-bold ${darkMode ? "text-white" : "text-dark"}`}
  variants={fadeInUp}
>
  {holder?.client_name || "Holder Details"}
</motion.h2>


      {/* Personal Info Section with 4x4 Glass Cards */}
{holder && (
  <motion.div className="mb-4 personal-info-card" variants={fadeInUp}>
    <h5 className={`mb-4 text-center ${darkMode ? "text-white" : "text-dark"}`}>
  Personal Information
</h5>
    <div className="row g-3">
      {[
        { label: "Holder ID", value: holder.id },
        { label: "Nominee", value: holder.nominee_name },
        { label: "DOB", value: holder.dob },
        { label: "Phone", value: holder.phone_no },
        { label: "Email", value: holder.email },
        { label: "Address", value: holder.address },
        { label: "Client Type", value: holder.client_type },
        { label: "Business Type", value: holder.business_type },
        { label: "Purchase Date", value: holder.purchase_date },
        { label: "Policy Number", value: holder.policy_no },
        { label: "Insurance Type", value: holder.policy_type },
        { label: "Premium", value: `₹${holder.premium?.toLocaleString() || "0"}` },
        { label: "Renewal Date", value: holder.renewal_date },
        { label: "Status", value: getStatus(holder.renewal_date) },
        { label: "Remarks", value: holder.remarks || "None" },
        { label: "Member Since", value: holder.join_date || "N/A" }, // new detail for symmetry
      ].map((item, index) => (
        <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={index}>
          <div
            className={`p-3 h-100 rounded-lg shadow-sm glass-card hover:shadow-lg hover:scale-105 transition-transform duration-300 ${
              darkMode ? "text-white" : "text-dark"
            }`}
          >
            <div className="text-muted mb-1 small">{item.label}</div>
            <div className="fw-bold">{item.value || "N/A"}</div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
)}




            {/* Status Cards - Only show if a valid holder is selected */}
      {holder && (
        <motion.div className="row mb-4" variants={fadeInUp}>
          {filterKeys.map((key, index) => (
            <div className="col-md-3 mb-3" key={key}>
              <motion.div
                className={`card text-center shadow-hover status-card ${filter === key ? "selected-card" : ""} ${darkMode ? darkColors[key] : lightColors[key]}`}
                style={{ cursor: "pointer", "--delay": `${index * 0.1}s` } as React.CSSProperties}
                whileHover={{ scale: 1.05 }}
                onClick={() => setFilter(key)}
              >
                <div className="card-body d-flex flex-column align-items-center">
                  <div className="mb-2" style={{ fontSize: "1.5rem" }}>{icons[key]}</div>
                  <h5 className="card-title">{key}</h5>
                  <p className="card-text display-6">{counts[key]}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      )}


      {/* Policy Table */}
      <AnimatePresence mode="wait">
        <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
          <PolicyTable policies={filteredPolicies} setPolicies={setPolicies} darkMode={darkMode} />
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
}

export default HolderDetails;
