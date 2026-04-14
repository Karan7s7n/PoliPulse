import { useEffect, useState, useRef } from "react";
import { supabase } from "../models/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaBuilding,
  FaSearch
} from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CompanyDetailsProps {}

function CompanyDetails({}: CompanyDetailsProps) {
  const { id: companyId } = useParams<{ id: string }>();
  const { isDark } = useTheme();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [companyName, setCompanyName] = useState<string>(companyId || "");
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
      setCompanySelected(true);
    } catch (err) {
      console.error(err);
      setPolicies([]);
    }
    setLoading(false);
  };

  /** Load company policies if navigated via companyId */
  useEffect(() => {
    if (companyId && companyId !== "_") fetchCompanyPolicies(companyId);
    else setLoading(false);
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
  const icons: Record<FilterKey, React.ReactNode> = {
    All: <FaClipboardList />,
    Active: <FaCheckCircle />,
    "Expiring Soon": <FaExclamationTriangle />,
    Expired: <FaTimesCircle />,
  };

  /** Colors */
  const colors: Record<FilterKey, string> = {
    All: "bg-cyan-600 text-white shadow-cyan-600/20",
    Active: "bg-emerald-600 text-white shadow-emerald-600/20",
    "Expiring Soon": "bg-amber-500 text-slate-950 shadow-amber-500/20",
    Expired: "bg-rose-600 text-white shadow-rose-600/20",
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
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6"],
      borderWidth: 0,
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
      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 0,
    }]
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDark ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-6 font-black tracking-widest uppercase opacity-40">Loading Data</h2>
      </div>
    );
  }

  return (
    <motion.div className="container mx-auto px-4 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

      {/* Autocomplete */}
      <div ref={dropdownRef} className="relative mb-10">
        <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] border transition-all shadow-xl ${isDark ? "bg-zinc-900 border-zinc-800 focus-within:border-indigo-500" : "bg-white border-slate-200 focus-within:border-indigo-500"}`}>
          <FaSearch className="opacity-40 text-black dark:text-white" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-lg font-bold text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
            placeholder={companyName && companyName !== "_" ? companyName : "Search Insurance Company..."}
            value={searchText}
            onChange={(e) => {
              const text = e.target.value;
              setSearchText(text);
              setDropdownOpen(true);
              setHighlightedIndex(0);
              if (text === "") {
                setCompanyName("");
                setPolicies([]);
                setCompanySelected(false);
              }
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {dropdownOpen && filteredCompanies.length > 0 && (
          <div className={`shadow-2xl rounded-2xl mt-4 overflow-hidden absolute w-full max-h-[300px] overflow-y-auto z-[200] border ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            {filteredCompanies.map((c, index) => (
              <div
                key={c}
                className={`px-6 py-4 font-bold flex items-center gap-3 transition-colors ${index === highlightedIndex ? "bg-indigo-600 text-white" : (isDark ? "hover:bg-white/5" : "hover:bg-slate-50")}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectCompany(c)}
              >
                <FaBuilding className="opacity-40" />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mb-12">
        <h2 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{companyName && companyName !== "_" ? companyName : "Select a Company"}</h2>
        <p className={`mt-2 font-bold uppercase tracking-[0.2em] text-[10px] opacity-40 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Enterprise Analytics View</p>
      </div>

      {companySelected && policies.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { title: "Portfolio Value", value: `₹${totalPremium.toLocaleString()}`, color: "from-indigo-600 to-blue-600" },
                { title: "Total Policies", value: totalPolicies, color: "from-emerald-600 to-teal-600" },
                { title: "Critical Renewals", value: policiesExpiringThisMonth, color: "from-rose-600 to-orange-600" }
              ].map((card, idx) => (
                <div key={idx} className={`p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-100"}`}>
                  <div className="relative z-10">
                    <h6 className={`uppercase font-black text-[10px] tracking-[0.2em] opacity-40 mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>{card.title}</h6>
                    <p className={`text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                  </div>
                  <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${card.color} opacity-[0.05] group-hover:opacity-10 transition-opacity rounded-full`}></div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className={`p-10 rounded-[3rem] shadow-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-100"}`}>
                <h6 className={`text-center font-black uppercase tracking-[0.2em] text-xs mb-8 opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Policy Mix Analysis</h6>
                <div className="max-w-[280px] mx-auto">
                    <Pie data={typeData} options={{ plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#fff' : '#000', font: { weight: 'bold', size: 10 } } } } }} />
                </div>
              </div>

              <div className={`p-10 rounded-[3rem] shadow-2xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-100"}`}>
                <h6 className={`text-center font-black uppercase tracking-[0.2em] text-xs mb-8 opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>Renewal Status Analytics</h6>
                <div className="max-w-[280px] mx-auto">
                    <Pie data={statusData} options={{ plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#fff' : '#000', font: { weight: 'bold', size: 10 } } } } }} />
                </div>
              </div>
            </div>

            {/* Filter Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {filterKeys.map((key) => (
                <motion.div
                  key={key}
                  className={`rounded-[2.5rem] text-center shadow-xl p-8 transition-all relative overflow-hidden group ${filter === key ? "ring-4 ring-indigo-500 scale-105" : ""} ${colors[key]}`}
                  style={{ cursor: "pointer" }}
                  whileHover={{ y: -5 }}
                  onClick={() => setFilter(key)}
                >
                  <div className="flex flex-col items-center relative z-10">
                    <div className="text-3xl mb-4 bg-white/20 p-3 rounded-2xl">{icons[key]}</div>
                    <h5 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-80">{key}</h5>
                    <p className="text-4xl font-black mt-2 tracking-tighter">{counts[key]}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Policy Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-20">
              <PolicyTable policies={filteredPolicies} setPolicies={setPolicies} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </motion.div>
  );
}

export default CompanyDetails;
