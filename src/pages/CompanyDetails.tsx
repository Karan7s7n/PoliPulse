import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import lightLogo from "../assets/logo-light.png";
import darkLogo from "../assets/logo-dark.png";
import "../pages/HomePage.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

interface CompanyDetailsProps {
  darkMode: boolean;
}

function CompanyDetails({ darkMode }: CompanyDetailsProps) {
  const { id: companyId } = useParams<{ id: string }>();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [companyName, setCompanyName] = useState<string>(companyId || "");

  // NEW FIX
  const [companySelected, setCompanySelected] = useState(false);

  const [filter, setFilter] = useState<"All" | "Active" | "Expiring Soon" | "Expired">("All");
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterKeys = ["All", "Active", "Expiring Soon", "Expired"] as const;
  type FilterKey = typeof filterKeys[number];

  /** Fetch all unique companies for autocomplete */
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase.from("policy").select("company_name");
        if (error) throw error;
        if (data) setCompanies(Array.from(new Set(data.map(d => d.company_name))));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, []);

  /** Fetch policies for the selected company */
  const fetchCompanyPolicies = async (company: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("policy").select("*").eq("company_name", company);
      if (error) throw error;
      setPolicies(data || []);
      setCompanyName(company);
      setCompanySelected(true); // FIX
    } catch (err) {
      console.error(err);
      setPolicies([]);
    }
    setLoading(false);
  };

  /** Load company policies if navigated via companyId */
  useEffect(() => {
    if (companyId) fetchCompanyPolicies(companyId);
  }, [companyId]);

  /** Handle outside click for autocomplete */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Autocomplete filtered list */
  const filteredCompanies = companies.filter(c =>
    c.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex(prev => Math.min(prev + 1, filteredCompanies.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (filteredCompanies[highlightedIndex]) selectCompany(filteredCompanies[highlightedIndex]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  };

  const selectCompany = (company: string) => {
    setDropdownOpen(false);
    setSearchText("");
    setHighlightedIndex(0);

    // FIX
    setCompanySelected(true);

    fetchCompanyPolicies(company);
  };

  /** Helper to determine policy status */
  const getStatus = (renewalDate: string) => {
    const today = new Date();
    const endDate = new Date(renewalDate);
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays <= 30) return "Expiring Soon";
    return "Active";
  };

  /** Filtered policies based on filter selection */
  const filteredPolicies = policies.filter(p =>
    filter === "All" ? true : getStatus(p.renewal_date) === filter
  );

  /** Summary cards */
  const totalPremium = filteredPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const totalPolicies = filteredPolicies.length;
  const policiesExpiringThisMonth = filteredPolicies.filter(p => {
    const today = new Date();
    const renewal = new Date(p.renewal_date);
    return renewal.getMonth() === today.getMonth() && renewal.getFullYear() === today.getFullYear();
  }).length;

  /** Filter card counts */
  const counts: Record<FilterKey, number> = {
    All: policies.length,
    Active: policies.filter(p => getStatus(p.renewal_date) === "Active").length,
    "Expiring Soon": policies.filter(p => getStatus(p.renewal_date) === "Expiring Soon").length,
    Expired: policies.filter(p => getStatus(p.renewal_date) === "Expired").length,
  };

  /** Icons */
  const icons: Record<FilterKey, JSX.Element> = {
    All: <FaClipboardList />,
    Active: <FaCheckCircle />,
    "Expiring Soon": <FaExclamationTriangle />,
    Expired: <FaTimesCircle />,
  };

  /** Colors */
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

  /** Charts Data */
  const typeCounts = filteredPolicies.reduce<Record<string, number>>((acc, p) => {
    const type = p.policy_type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeData = {
    labels: Object.keys(typeCounts),
    datasets: [{
      data: Object.values(typeCounts),
      backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
    }]
  };

  const statusCounts = filteredPolicies.reduce<Record<string, number>>((acc, p) => {
    const status = getStatus(p.renewal_date);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
    }]
  };

  if (loading) {
    return (
      <motion.div className={`d-flex flex-column align-items-center justify-content-center vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
        <motion.img src={darkMode ? darkLogo : lightLogo} alt="PoliPulse Logo" style={{ width: 90, marginBottom: 16 }} />
        <motion.h2 style={{ fontWeight: 700 }}>PoliPulse</motion.h2>
      </motion.div>
    );
  }

  return (
    <motion.div className={`container mt-4 company-page ${darkMode ? "dark-mode" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

      {/* Autocomplete */}
      <div ref={dropdownRef} style={{ position: "relative" }} className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder={companyName && companyName !== "_" ? companyName : "Search Company..."}
          value={searchText}
          onChange={(e) => {
            const text = e.target.value;
            setSearchText(text);
            setDropdownOpen(true);
            setHighlightedIndex(0);

            // FIX: Hide everything when input becomes empty
            if (text === "") {
              setCompanyName("");
              setPolicies([]);
              setCompanySelected(false);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {dropdownOpen && filteredCompanies.length > 0 && (
          <div className="card shadow" style={{ position: "absolute", width: "100%", maxHeight: 250, overflowY: "auto", zIndex: 10 }}>
            {filteredCompanies.map((c, index) => (
              <div
                key={c}
                className={`p-2 ${index === highlightedIndex ? "bg-primary text-white" : ""}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectCompany(c)}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Name */}
      <h2 className={`mb-4 text-center ${darkMode ? "text-white" : ""}`}>{companyName || "Select Company"}</h2>

      {/* FIX: SHOW NOTHING UNTIL COMPANY SELECTED */}
      {companySelected && policies.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="row mb-4">
            {[{
              title: "Total Premium",
              value: `₹${totalPremium.toLocaleString()}`
            }, {
              title: "Total Policies",
              value: totalPolicies
            }, {
              title: "Expiring This Month",
              value: policiesExpiringThisMonth
            }].map((card, idx) => (
              <div className="col-md-4 mb-3" key={idx}>
                <div
                  className="card text-center p-3 shadow"
                  style={{
                    background: darkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.4)",
                    backdropFilter: "blur(15px)",
                    borderRadius: "1rem",
                    border: darkMode
                      ? "1px solid rgba(255,255,255,0.2)"
                      : "1px solid rgba(0,0,0,0.1)",
                    color: darkMode ? "white" : "black",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(-5px)";
                    el.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  <h6>{card.title}</h6>
                  <p className="display-6">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div
                className="card p-3 shadow"
                style={{
                  background: darkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(15px)",
                  borderRadius: "1rem",
                  border: darkMode
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid rgba(0,0,0,0.1)",
                  color: darkMode ? "white" : "black",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-5px)";
                  el.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                <h6 className="text-center">Insurance Type Distribution</h6>
                <Pie data={typeData} />
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div
                className="card p-3 shadow"
                style={{
                  background: darkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.4)",
                  backdropFilter: "blur(15px)",
                  borderRadius: "1rem",
                  border: darkMode
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid rgba(0,0,0,0.1)",
                  color: darkMode ? "white" : "black",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-5px)";
                  el.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                <h6 className="text-center">Status Distribution</h6>
                <Pie data={statusData} />
              </div>
            </div>
          </div>

          {/* Filter Cards */}
          <div className="row mb-4">
            {filterKeys.map(key => (
              <div className="col-md-3 mb-3" key={key}>
                <motion.div
                  className={`card text-center shadow-hover status-card ${filter === key ? "selected-card" : ""} ${darkMode ? darkColors[key] : lightColors[key]}`}
                  style={{ cursor: "pointer" }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilter(key)}
                >
                  <div className="card-body d-flex flex-column align-items-center">
                    <div style={{ fontSize: "1.5rem" }}>{icons[key]}</div>
                    <h5 className="card-title">{key}</h5>
                    <p className="card-text display-6">{counts[key]}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Policy Table */}
          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <PolicyTable policies={filteredPolicies} setPolicies={setPolicies} darkMode={darkMode} />
            </motion.div>
          </AnimatePresence>
        </>
      )}

    </motion.div>
  );
}

export default CompanyDetails;
