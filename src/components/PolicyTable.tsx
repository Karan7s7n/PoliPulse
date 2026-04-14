import React, { useState, useMemo } from "react";
import { supabase } from "../models/supabaseClient";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilePdf,
  FaFileCsv,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaHashtag,
  FaCalendarAlt,
  FaStickyNote,
  FaUserShield,
  FaExternalLinkAlt
} from "react-icons/fa";
import { LayoutGrid } from "lucide-react";
import jsPDF from "jspdf";
import Papa from "papaparse";
import type { Policy } from "../models/supabaseTypes";
import { useTheme } from "../context/ThemeContext";

type SortOrder = "asc" | "desc" | null;

interface Props {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  isAdmin?: boolean;
}

function PolicyTable({ policies, setPolicies, isAdmin = false }: Props) {
  const { isDark } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRemarks, setEditedRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const policiesPerPage = 8;

  const [sortField, setSortField] = useState<keyof Policy | "status">("client_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const getStatus = (renewalDate: string) => {
    const today = new Date();
    const endDate = new Date(renewalDate);
    const diff = (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return "Expired";
    if (diff <= 30) return "Expiring Soon";
    return "Active";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Expired":
        return { icon: <FaTimesCircle />, color: "text-red-500 dark:text-red-400", statusColor: "red" };
      case "Expiring Soon":
        return { icon: <FaClock />, color: "text-amber-500 dark:text-amber-400", statusColor: "amber" };
      case "Active":
        return { icon: <FaCheckCircle />, color: "text-emerald-500 dark:text-emerald-400", statusColor: "emerald" };
      default:
        return { icon: null, color: "text-zinc-500 dark:text-zinc-400", statusColor: "zinc" };
    }
  };

  const filteredPolicies = useMemo(() => {
    return policies.filter(p =>
      p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.policy_no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [policies, searchTerm]);

  const sortedPolicies = useMemo(() => {
    const sorted = [...filteredPolicies];
    sorted.sort((a, b) => {
      let valA: any = sortField === "status" ? getStatus(a.renewal_date) : a[sortField];
      let valB: any = sortField === "status" ? getStatus(b.renewal_date) : b[sortField];

      if (sortField === "status") {
        const order: Record<string, number> = { Active: 1, "Expiring Soon": 2, Expired: 3 };
        valA = order[valA];
        valB = order[valB];
      }

      if (typeof valA === "number" && typeof valB === "number")
        return sortOrder === "asc" ? valA - valB : valB - valA;

      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPolicies, sortField, sortOrder]);

  const startEditing = (id: string, remarks?: string) => {
    setEditingId(id);
    setEditedRemarks(remarks || "");
  };

  const saveRemarks = async (id: string) => {
    const { error } = await supabase.from("policy").update({ remarks: editedRemarks }).eq("id", id);
    if (!error) {
      setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, remarks: editedRemarks } : p)));
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") saveRemarks(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = sortedPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(sortedPolicies.length / policiesPerPage);

  const exportAllPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(18);
    pdf.text("PoliPulse - Policy Inventory Report", width / 2, 15, { align: "center" });
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, width - 10, 22, { align: "right" });

    let y = 35;
    sortedPolicies.forEach((p, idx) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFontSize(11);
      pdf.text(`${idx + 1}. ${p.client_name} - ${p.company_name}`, 10, y);
      pdf.setFontSize(9);
      pdf.text(`   No: ${p.policy_no} | Premium: INR ${p.premium} | Renewal: ${p.renewal_date} | Creator: ${p.creator_name || "Self"}`, 10, y + 5);
      y += 15;
    });
    pdf.save(`PoliPulse_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  const exportAllCSV = () => {
    const csv = Papa.unparse(sortedPolicies);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PoliPulse_Data_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 🚀 CONTROLS & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 bg-white/10 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-white/10 w-full max-w-sm focus-within:ring-2 ring-indigo-500/50 transition-all">
          <FaSearch className="opacity-40 text-black dark:text-white" />
          <input
            type="text"
            placeholder="Search policies, holder, company..."
            className="bg-transparent outline-none w-full text-sm font-medium text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white/10 dark:bg-zinc-800/50 px-3 py-2 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-black opacity-30 dark:opacity-50 ml-1 text-black dark:text-white">Sort By</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent outline-none text-xs font-bold uppercase tracking-wider cursor-pointer text-black dark:text-white"
            >
              <option value="client_name">Client</option>
              <option value="company_name">Company</option>
              <option value="premium">Premium</option>
              <option value="renewal_date">Renewal</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder || "asc"}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent outline-none text-xs font-bold uppercase tracking-wider cursor-pointer border-l border-white/10 pl-2 text-black dark:text-white"
            >
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto md:ml-0">
            <button onClick={exportAllPDF} className="p-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-lg shadow-blue-600/10" title="Export PDF">
              <FaFilePdf size={18} />
            </button>
            <button onClick={exportAllCSV} className="p-3 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90 shadow-lg shadow-emerald-600/10" title="Export CSV">
              <FaFileCsv size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 📄 POLICY CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {currentPolicies.length === 0 ? (
          <div className="py-20 text-center opacity-30 dark:opacity-40 border-2 border-dashed border-white/5 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center gap-4 text-black dark:text-white">
            <LayoutGrid size={48} />
            <span className="font-bold text-black dark:text-white">No policies found matching your search.</span>
          </div>
        ) : (
          currentPolicies.map((p) => {
            const status = getStatus(p.renewal_date);
            const { icon, color } = getStatusConfig(status);

            return (
              <div
                key={p.id}
                className={`group relative p-6 rounded-[1.5rem] transition-all duration-300 border backdrop-blur-md shadow-sm ${
                  isDark ? "bg-zinc-900/40 hover:bg-zinc-900/60" : "bg-white hover:shadow-xl"
                } ${
                  status === "Active"
                    ? (isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")
                    : status === "Expiring Soon"
                      ? (isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200")
                      : (isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200")
                  } border-l-4 ${status === "Active" ? "border-l-emerald-500" : status === "Expiring Soon" ? "border-l-amber-500" : "border-l-red-500"}`}
              >
                {/* TOP ROW: CLIENT + COMPANY + STATUS */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/holder/${p.id}`}
                      className={`text-xl font-black transition-colors ${isDark ? "text-white hover:text-indigo-400" : "text-slate-900 hover:text-indigo-600"}`}
                    >
                      {p.client_name}
                    </Link>
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
                    <Link
                      to={`/company/${p.company_name}`}
                      className={`text-sm font-bold flex items-center gap-2 transition-all ${isDark ? "text-zinc-400 hover:text-white opacity-60 hover:opacity-100" : "text-slate-600 hover:text-slate-900 opacity-60 hover:opacity-100"}`}
                    >
                      <FaBuilding size={12} />
                      {p.company_name}
                      <FaExternalLinkAlt size={10} className="ml-1 opacity-50" />
                    </Link>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-white/10 dark:bg-black/20 ${color} shadow-sm border border-black/5 dark:border-white/5`}>
                    {icon}
                  </div>
                </div>

                {/* BOTTOM ROW: DETAILS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-6 gap-6">
                  <div className="space-y-1">
                    <div className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}><FaHashtag size={10} /> Policy No</div>
                    <div className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{p.policy_no}</div>
                  </div>

                  <div className="space-y-1">
                    <div className={`text-[10px] uppercase font-black tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Premium</div>
                    <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">₹{p.premium.toLocaleString()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className={`text-[10px] uppercase font-black tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Renewal</div>
                    <div className={`font-bold text-sm flex items-center gap-1 ${isDark ? "text-white" : "text-slate-900"}`}><FaCalendarAlt size={10} className={isDark ? "text-zinc-400" : "text-slate-400"} /> {formatDate(p.renewal_date)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className={`text-[10px] uppercase font-black tracking-widest ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Type</div>
                    <div className={`font-bold flex items-center gap-1 uppercase text-[10px] tracking-tighter bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg w-fit border border-black/5 dark:border-white/5 ${isDark ? "text-white" : "text-slate-900"}`}>{p.policy_type}</div>
                  </div>

                  <div className="space-y-1 md:col-span-1">
                    <div className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}><FaStickyNote size={10} /> Remarks</div>
                    {editingId === p.id ? (
                      <input
                        autoFocus
                        value={editedRemarks}
                        onChange={(e) => setEditedRemarks(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, p.id)}
                        onBlur={() => setEditingId(null)}
                        className={`border rounded-lg px-2 py-0.5 outline-none w-full text-xs ${isDark ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                      />
                    ) : (
                      <div
                        onDoubleClick={() => startEditing(p.id, p.remarks)}
                        className={`font-medium text-xs cursor-pointer hover:text-indigo-500 dark:hover:text-indigo-400 transition-all truncate ${isDark ? "text-zinc-300" : "text-slate-600"}`}
                        title="Double click to edit"
                      >
                        {p.remarks || "—"}
                      </div>
                    )}
                  </div>

                  {/* 🔐 ADMIN ONLY TRACKING */}
                  {isAdmin && (
                    <div className="space-y-1 md:col-span-full xl:col-auto xl:border-l xl:border-black/5 dark:xl:border-white/5 xl:pl-4">
                      <div className="text-[10px] uppercase font-black opacity-40 dark:opacity-60 tracking-widest flex items-center gap-1 text-indigo-600 dark:text-indigo-400"><FaUserShield size={10} /> Creator</div>
                      <div className="font-black text-xs text-indigo-600 dark:text-indigo-400 truncate bg-indigo-500/5 dark:bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/10 w-fit">
                        {p.creator_name || "Platform Admin"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 📑 PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/5 mt-8">
          <div className="text-[10px] font-black opacity-40 dark:opacity-60 uppercase tracking-[0.2em] ml-4 hidden sm:block text-black dark:text-white">
            Showing {indexOfFirstPolicy + 1}-{Math.min(indexOfLastPolicy, sortedPolicies.length)} of {sortedPolicies.length}
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mr-0">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-20 ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
            >
              <FaChevronLeft size={10} /> Prev
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === idx + 1 ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 hover:bg-white/10 dark:text-white text-slate-600"
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-20 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20`}
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyTable;
