import { useEffect, useState, useRef } from "react";
import { supabase } from "../models/supabaseClient";
import type { Policy } from "../models/supabaseTypes";
import { Bar, Pie, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from "chart.js";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaThLarge,
  FaFilePdf,
  FaRupeeSign,
  FaTrophy,
  FaChartBar,
  FaSearch,
  FaCalendarAlt
} from "react-icons/fa";
import CountUp from "react-countup";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface ReportsProps {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}

function Reports({ policies, setPolicies }: ReportsProps) {
  const { isDark } = useTheme();
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expiring: 0, expired: 0 });

  useEffect(() => {
    fetchReports();
  }, []);

  const getDaysDiff = (date: string) =>
    (new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24);

  async function fetchReports() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("policy")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setError("Failed to fetch report data.");
        setLoading(false);
        return;
      }
      if (data) {
        setPolicies(data);
        setFilteredPolicies(data);
        updateStats(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function updateStats(data: Policy[]) {
    const total = data.length;
    const active = data.filter((p) => getDaysDiff(p.renewal_date) > 30).length;
    const expiring = data.filter(
      (p) => getDaysDiff(p.renewal_date) >= 0 && getDaysDiff(p.renewal_date) <= 30
    ).length;
    const expired = total - active - expiring;
    setStats({ total, active, expiring, expired });
  }

  // Filtering
  useEffect(() => {
    let filtered = [...policies];
    if (search)
      filtered = filtered.filter(
        (p) =>
          p.company_name.toLowerCase().includes(search.toLowerCase()) ||
          p.policy_no?.toString().includes(search)
      );
    if (filterCompany) filtered = filtered.filter((p) => p.company_name === filterCompany);
    if (filterStatus) {
      filtered = filtered.filter((p) => {
        const days = getDaysDiff(p.renewal_date);
        if (filterStatus === "active") return days > 30;
        if (filterStatus === "expiring") return days >= 0 && days <= 30;
        if (filterStatus === "expired") return days < 0;
        return true;
      });
    }
    if (dateRange.from)
      filtered = filtered.filter((p) => new Date(p.renewal_date) >= new Date(dateRange.from));
    if (dateRange.to)
      filtered = filtered.filter((p) => new Date(p.renewal_date) <= new Date(dateRange.to));

    setFilteredPolicies(filtered);
    updateStats(filtered);
  }, [search, filterCompany, filterStatus, dateRange, policies]);

  // Chart Data
  const companies = Array.from(new Set(filteredPolicies.map((p) => p.company_name)));
  const companyPremiums = companies.map((c) =>
    filteredPolicies
      .filter((p) => p.company_name === c)
      .reduce((sum, p) => sum + Number(p.premium || 0), 0)
  );

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  const monthCounts = months.map(
    (_, i) => filteredPolicies.filter((p) => new Date(p.renewal_date).getMonth() === i).length
  );
  const monthlyPremiums = months.map(
    (_, i) =>
      filteredPolicies
        .filter((p) => new Date(p.renewal_date).getMonth() === i)
        .reduce((sum, p) => sum + Number(p.premium || 0), 0)
  );
  const avgPremiums = companies.map((c) => {
    const companyPolicies = filteredPolicies.filter((p) => p.company_name === c);
    const total = companyPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
    return companyPolicies.length ? total / companyPolicies.length : 0;
  });

  const chartTextColor = isDark ? "#ffffff" : "#0f172a";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: { color: chartTextColor, font: { weight: 'bold' as const, size: 10 } } 
      },
    },
    scales: {
      x: {
        ticks: { color: chartTextColor, font: { weight: 'bold' as const, size: 10 } },
        grid: { color: 'transparent' },
      },
      y: {
        ticks: { color: chartTextColor, font: { weight: 'bold' as const, size: 10 } },
        grid: { color: gridColor },
      },
    },
  };

  const charts = [
    { title: "Monthly Renewal Trend", chart: <Line data={{
        labels: months,
        datasets: [{ label: "Policies Renewing", data: monthCounts, borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", fill: true, tension: 0.4 }]
      }} options={chartOptions} /> },
    { title: "Premium vs Company", chart: <Bar data={{
        labels: companies,
        datasets: [{ label: "Total Premium", data: companyPremiums, backgroundColor: "#10b981", borderRadius: 8 }]
      }} options={chartOptions} /> },
    { title: "Active vs Expired Mix", chart: <Bar data={{
        labels: companies,
        datasets: [
          { label: "Active", data: companies.map(c => filteredPolicies.filter(p => p.company_name === c && getDaysDiff(p.renewal_date) > 30).length), backgroundColor: "#3b82f6", borderRadius: 4 },
          { label: "Expired", data: companies.map(c => filteredPolicies.filter(p => p.company_name === c && getDaysDiff(p.renewal_date) < 0).length), backgroundColor: "#ef4444", borderRadius: 4 },
        ]
      }} options={{ ...chartOptions, scales: { x: { stacked: true }, y: { stacked: true } } }} /> },
    { title: "Portfolio Value Growth", chart: <Line data={{
        labels: months,
        datasets: [{ label: "Premium Volume", data: monthlyPremiums, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", fill: true, tension: 0.4 }]
      }} options={chartOptions} /> },
    { title: "Company Efficiency", chart: <Radar data={{
        labels: companies,
        datasets: [{ label: "Avg Premium", data: avgPremiums, backgroundColor: "rgba(139,92,246,0.2)", borderColor: "#8b5cf6", pointBackgroundColor: "#8b5cf6" }]
      }} options={{ ...chartOptions, scales: { r: { grid: { color: gridColor }, ticks: { display: false } } } }} /> },
    { title: "Status Segmentation", chart: <Pie data={{
        labels: ["Active", "Expiring", "Expired"],
        datasets: [{ data: [stats.active, stats.expiring, stats.expired], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"], borderWidth: 0 }]
      }} options={{ ...chartOptions, scales: undefined }} /> },
  ];

  const exportPDF = async () => {
    const element = dashboardRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.setFontSize(18);
    pdf.text("PoliPulse Analytics Report", pageWidth / 2, 20, { align: "center" });
    pdf.addImage(imgData, "PNG", 10, 35, imgWidth, imgHeight);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
    pdf.save(`PoliPulse_Report_${Date.now()}.pdf`);
  };

  if (loading) return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${isDark ? "text-white" : "text-slate-900"}`}>
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-6 font-black uppercase tracking-widest text-[10px] opacity-40 text-indigo-500">Processing Analytics</p>
    </div>
  );

  if (error) return <div className="text-center py-20 text-rose-500 font-black">{error}</div>;

  return (
    <motion.div
      ref={dashboardRef}
      className={`container mx-auto px-6 py-12 ${isDark ? "text-white" : "text-slate-900"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
            <h1 className="font-black text-5xl tracking-tighter mb-2">Reports & Intelligence</h1>
            <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-40 text-indigo-500">Portfolio Performance Analytics Dashboard</p>
        </div>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <FaFilePdf /> Export Portfolio PDF
        </button>
      </div>

      {/* Filters */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 p-6 rounded-[2.5rem] border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-slate-100 border-black/5'}`}>
        <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
                type="text"
                placeholder="Search..."
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 focus:border-indigo-600"}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select
            className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 focus:border-indigo-600"}`}
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
        >
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
            className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 focus:border-indigo-600"}`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
        >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
        </select>
        <div className="relative group">
            <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
            <input
                type="date"
                className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 focus:border-indigo-600"}`}
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
        </div>
        <div className="relative group">
            <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
            <input
                type="date"
                className={`w-full px-4 py-3 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 focus:border-indigo-600"}`}
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Unit", value: stats.total, color: "bg-indigo-600 shadow-indigo-600/20", icon: <FaThLarge />, status: "" },
          { label: "Operational", value: stats.active, color: "bg-emerald-600 shadow-emerald-600/20", icon: <FaCheckCircle />, status: "active" },
          { label: "Warning", value: stats.expiring, color: "bg-amber-500 shadow-amber-500/20", icon: <FaExclamationTriangle />, status: "expiring" },
          { label: "Decommissioned", value: stats.expired, color: "bg-rose-600 shadow-rose-600/20", icon: <FaTimesCircle />, status: "expired" },
        ].map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterStatus(card.status)}
            className={`rounded-[2.5rem] text-center p-8 cursor-pointer transition-all ${card.color} text-white shadow-2xl relative overflow-hidden group`}
          >
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-3xl mb-4 bg-white/20 p-4 rounded-2xl group-hover:rotate-12 transition-transform">{card.icon}</div>
                <h5 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-80">{card.label}</h5>
                <p className="text-5xl font-black mt-2 tracking-tighter"><CountUp end={card.value} duration={1.5} /></p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {(() => {
          const totalPremium = filteredPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
          const topCompany = companies.length > 0 ? companies[companyPremiums.indexOf(Math.max(...companyPremiums))] : "N/A";
          const policyTypes = Array.from(new Set(filteredPolicies.map(p => p.policy_type)));
          const topPolicyType = policyTypes.length > 0 ? policyTypes.sort((a, b) => filteredPolicies.filter(p => p.policy_type === b).length - filteredPolicies.filter(p => p.policy_type === a).length)[0] : "N/A";
          const today = new Date();
          const newPoliciesThisMonth = filteredPolicies.filter(p => { const pd = new Date(p.purchase_date); return pd.getMonth() === today.getMonth() && pd.getFullYear() === today.getFullYear(); }).length;
          
          return [
            { title: "Net Premium", value: `₹${totalPremium.toLocaleString()}`, icon: <FaRupeeSign className="text-emerald-500" /> },
            { title: "Lead Provider", value: topCompany, icon: <FaTrophy className="text-amber-500" /> },
            { title: "Dominant Class", value: topPolicyType, icon: <FaThLarge className="text-indigo-400" /> },
            { title: "New Acquisitions", value: newPoliciesThisMonth, icon: <FaChartBar className="text-cyan-400" /> },
          ].map((insight, i) => (
            <div key={i} className={`p-8 rounded-[2rem] flex flex-row items-center gap-6 border ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-black/5"} shadow-xl`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-zinc-950/50':'bg-slate-50'}`}>{insight.icon}</div>
              <div>
                <h6 className="uppercase font-black text-[9px] tracking-[0.2em] opacity-40 mb-1">{insight.title}</h6>
                <h5 className="font-black text-lg m-0 truncate w-32" title={insight.value.toString()}>{insight.value}</h5>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {charts.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`p-10 rounded-[3rem] shadow-2xl border flex flex-col ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-black/5"}`}
          >
            <h5 className="mb-10 font-black uppercase tracking-[0.2em] text-xs opacity-40 text-center">{c.title}</h5>
            <div className="h-[300px] w-full">{c.chart}</div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}

export default Reports;
