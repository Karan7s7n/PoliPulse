import { useEffect, useState, useRef } from "react";
import { supabase } from "../models/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import type { Policy } from "../models/supabaseTypes";
import PolicyTable from "../components/PolicyTable";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

interface HolderDetailsProps { }

function HolderDetails({ }: HolderDetailsProps) {
  const { isDark } = useTheme();
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
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("policy")
        .select("*")
        .eq("user_id", user?.id);
      if (error) console.error(error);
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  // Load holder by ID
  const loadHolder = async (id: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("policy")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      if (data && data.length > 0) {
        setHolder(data[0]);
        setPolicies(data);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  const icons: Record<FilterKey, React.ReactNode> = {
    All: <FaClipboardList />,
    Active: <FaCheckCircle />,
    "Expiring Soon": <FaExclamationTriangle />,
    Expired: <FaTimesCircle />,
  };

  const colors: Record<FilterKey, string> = {
    All: "bg-cyan-500 text-white",
    Active: "bg-emerald-500 text-white",
    "Expiring Soon": "bg-amber-500 text-slate-900",
    Expired: "bg-rose-500 text-white",
  };

  if (loading) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen ${isDark ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <motion.img
          src={isDark ? "/logo1.png" : "/logo2.png"}
          alt="PoliPulse Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-[120px] h-[120px] mb-4 rounded-3xl shadow-2xl"
        />
        <motion.h1 className="font-black text-5xl tracking-tight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          PoliPulse
        </motion.h1>
      </div>
    );
  }

  return (
    <motion.div className="container mx-auto px-4 mt-8" initial="hidden" animate="show" variants={fadeInUp}>

      {/* Autocomplete Search */}
      <div ref={dropdownRef} className="relative mb-10">
        <input
          type="text"
          className={`w-full px-6 py-4 rounded-[2rem] border outline-none transition-all shadow-lg ${isDark ? "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"}`}
          placeholder={holder?.client_name || "Search Client..."}
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setDropdownOpen(true); setHighlightedIndex(0); }}
          onKeyDown={handleKeyDown}
        />
        {dropdownOpen && filteredClients.length > 0 && (
          <div className={`shadow-2xl rounded-2xl mt-4 overflow-hidden absolute w-full max-h-[300px] overflow-y-auto z-[200] border ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            {filteredClients.map((c, index) => (
              <div
                key={c.id}
                className={`px-6 py-4 transition-colors font-bold ${index === highlightedIndex ? "bg-indigo-600 text-white" : (isDark ? "hover:bg-white/5" : "hover:bg-slate-50")}`}
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
        className={`mb-12 text-center text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
        variants={fadeInUp}
      >
        {holder?.client_name || "Select Client"}
      </motion.h2>


      {/* Personal Info Section */}
      {holder && (
        <motion.div className="mb-12" variants={fadeInUp}>
          <h5 className={`mb-8 text-center text-xl font-black uppercase tracking-[0.2em] opacity-40 ${isDark ? "text-white" : "text-slate-900"}`}>
            User Profile Information
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              { label: "Member Since", value: (holder as any).join_date || "N/A" },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-[2rem] shadow-xl transition-all hover:-translate-y-2 group border ${isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-100 text-slate-900"
                  }`}
              >
                <div className={`mb-2 text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-indigo-500 transition-all ${isDark ? "text-zinc-400" : "text-slate-500"}`}>{item!.label}</div>
                <div className="font-black text-lg truncate" title={item!.value || "N/A"}>{item!.value || "N/A"}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}


      {/* Status Cards */}
      {holder && (
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12" variants={fadeInUp}>
          {filterKeys.map((key) => (
            <motion.div
              key={key}
              className={`rounded-[2.5rem] text-center shadow-2xl transition-all border-0 p-8 ${filter === key ? "ring-4 ring-indigo-500 shadow-indigo-500/20" : ""} ${colors[key]}`}
              style={{ cursor: "pointer" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(key)}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-4 p-4 bg-white/20 rounded-2xl">{icons[key]}</div>
                <h5 className="font-black text-sm uppercase tracking-widest opacity-80">{key}</h5>
                <p className="text-5xl font-black mt-2">{counts[key]}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}


      {/* Policy Table — only shown after holder is selected */}
      {holder && (
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }} className="mb-20">
            <PolicyTable policies={filteredPolicies} setPolicies={setPolicies} />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty state — shown before any holder is selected */}
      {!holder && (
        <motion.div
          variants={fadeInUp}
          className={`flex flex-col items-center justify-center py-24 rounded-[2.5rem] border-2 border-dashed mb-20 ${isDark ? "border-zinc-800 text-zinc-600" : "border-slate-200 text-slate-400"}`}
        >
          <FaClipboardList size={48} className="mb-6 opacity-30" />
          <p className="font-black text-lg uppercase tracking-widest opacity-40">Search for a holder above to view their policies</p>
        </motion.div>
      )}

    </motion.div>
  );
}

export default HolderDetails;
