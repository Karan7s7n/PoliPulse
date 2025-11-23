import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
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
  FaTrophy
} from "react-icons/fa";
import CountUp from "react-countup";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";

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

const supabase = createClient(
  "https://shmvmxxhxvrnhlwdjcmp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48"
);

interface ReportsProps {
  darkMode: boolean;
  policies: Policy[];
}

function Reports({ darkMode }: ReportsProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
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
    const { data, error } = await supabase.from<Policy>("policy").select("*");
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
    setLoading(false);
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

  const chartTextColor = darkMode ? "#f5f5f5" : "#1a1a1a";
  const gridColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: chartTextColor } },
    },
    scales: {
      x: {
        ticks: { color: chartTextColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: chartTextColor },
        grid: { color: gridColor },
      },
    },
  };

  const charts = [
    { title: "Monthly Renewal Trend", chart: <Line data={{
        labels: months,
        datasets: [{ label: "Policies Renewing", data: monthCounts, borderColor: "#007bff", backgroundColor: "rgba(0,123,255,0.3)", fill: true }]
      }} options={chartOptions} /> },
    { title: "Premium by Company", chart: <Bar data={{
        labels: companies,
        datasets: [{ label: "Total Premium", data: companyPremiums, backgroundColor: "rgba(75,192,192,0.6)" }]
      }} options={chartOptions} /> },
    { title: "Active vs Expired by Company", chart: <Bar data={{
        labels: companies,
        datasets: [
          { label: "Active", data: companies.map(c => filteredPolicies.filter(p => p.company_name === c && getDaysDiff(p.renewal_date) > 30).length), backgroundColor: "#28a745" },
          { label: "Expired", data: companies.map(c => filteredPolicies.filter(p => p.company_name === c && getDaysDiff(p.renewal_date) < 0).length), backgroundColor: "#dc3545" },
        ]
      }} options={{ ...chartOptions, scales: { x: { stacked: true }, y: { stacked: true } } }} /> },
    { title: "Premium Trend Over Time", chart: <Line data={{
        labels: months,
        datasets: [{ label: "Total Premium", data: monthlyPremiums, borderColor: "#ff6384", backgroundColor: "rgba(255,99,132,0.3)", fill: true, tension: 0.3 }]
      }} options={chartOptions} /> },
    { title: "Average Premium per Policy", chart: <Radar data={{
        labels: companies,
        datasets: [{ label: "Average Premium", data: avgPremiums, backgroundColor: "rgba(153,102,255,0.3)", borderColor: "rgba(153,102,255,0.8)" }]
      }} options={chartOptions} /> },
    { title: "Policy Status Distribution", chart: <Pie data={{
        labels: ["Active", "Expiring Soon", "Expired"],
        datasets: [{ data: [stats.active, stats.expiring, stats.expired], backgroundColor: ["#28a745", "#ffc107", "#dc3545"] }]
      }} options={chartOptions} /> },
    
  ];


  const exportPDF = async () => {
  const element = dashboardRef.current;
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  // Load logo (must be inside /public/)
  const logo = new Image();
  logo.src = "/logo2.png"; // ✅ place your logo in public/logo-pp1.png
  await new Promise((resolve) => (logo.onload = resolve));

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add logo and title
  pdf.addImage(logo, "PNG", 10, 8, 20, 20);
  pdf.setFontSize(16);
  pdf.text("PolicyPulse - Analytics Dashboard", pageWidth / 2, 20, { align: "center" });

  // Add captured dashboard image
  pdf.addImage(imgData, "PNG", 10, 35, imgWidth, imgHeight);

  // Add footer (page + timestamp)
  pdf.setFontSize(10);
  pdf.text(
    `Generated on: ${new Date().toLocaleString()}`,
    10,
    pageHeight - 10
  );

  pdf.save(`PolicyPulse_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};


  if (loading) return <div className="container mt-4">Loading report...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <motion.div
      ref={dashboardRef}
      className={`container mt-4 mb-5 ${darkMode ? "text-light" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2
  className="mb-4 fw-bold text-center"
  style={{ color: darkMode ? "white" : "black" }}
>
  Analytics Dashboard
</h2>


      {/* Filters */}
      <div className="row g-3 mt-3">
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Search by Company or Policy No"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mt-3">
        {[
          { label: "Total Policies", value: stats.total, bg: "info", icon: <FaThLarge />, status: "" },
          { label: "Active", value: stats.active, bg: "success", icon: <FaCheckCircle />, status: "active" },
          { label: "Expiring Soon", value: stats.expiring, bg: "warning", icon: <FaExclamationTriangle />, status: "expiring" },
          { label: "Expired", value: stats.expired, bg: "danger", icon: <FaTimesCircle />, status: "expired" },
        ].map((card) => (
          <div key={card.label} className="col-md-3 col-6">
            <div
              onClick={() => setFilterStatus(card.status)}
              className={`card shadow text-center bg-${card.bg} ${darkMode ? "text-light" : "text-white"}`}
              style={{
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
            >
              <div className="card-body">
                <div className="fs-2 mb-2">{card.icon}</div>
                <h5 className="card-title">{card.label}</h5>
                <p className="card-text display-6">
                  <CountUp end={card.value} duration={1.2} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

     {/* Key Insights */}
<div className="row g-3 mt-4">
  {(() => {
    const totalPremium = filteredPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);

    const companies = Array.from(new Set(filteredPolicies.map(p => p.company_name)));
    const companyPremiums = companies.map(c =>
      filteredPolicies
        .filter(p => p.company_name === c)
        .reduce((sum, p) => sum + Number(p.premium || 0), 0)
    );
    const topCompany =
      companies.length > 0
        ? companies[companyPremiums.indexOf(Math.max(...companyPremiums))]
        : "N/A";

    const policyTypes = Array.from(new Set(filteredPolicies.map(p => p.policy_type)));
    const topPolicyType =
      policyTypes.length > 0
        ? policyTypes.sort((a, b) =>
            filteredPolicies.filter(p => p.policy_type === b).length -
            filteredPolicies.filter(p => p.policy_type === a).length
          )[0]
        : "N/A";

    const today = new Date();
    const newPoliciesThisMonth = filteredPolicies.filter(p => {
      const pd = new Date(p.purchase_date);
      return pd.getMonth() === today.getMonth() && pd.getFullYear() === today.getFullYear();
    }).length;

    const averagePremium =
      filteredPolicies.length > 0
        ? Math.round(totalPremium / filteredPolicies.length)
        : 0;

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthPremium = filteredPolicies
      .filter(p => {
        const pd = new Date(p.purchase_date);
        return pd.getMonth() === lastMonth.getMonth() && pd.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, p) => sum + Number(p.premium || 0), 0);
    const premiumGrowthRate =
      lastMonthPremium > 0
        ? Math.round(((totalPremium - lastMonthPremium) / lastMonthPremium))
        : 0;

    const totalActivePremium = filteredPolicies
      .filter(p => {
        const rd = new Date(p.renewal_date);
        const diffDays = (rd.getTime() - today.getTime()) / (1000 * 3600 * 24);
        return diffDays > 30;
      })
      .reduce((sum, p) => sum + Number(p.premium || 0), 0);

    const insights = [
      { title: "Total Premium Collected", value: `₹${totalPremium.toLocaleString()}`, icon: <FaRupeeSign className="me-2 text-success" /> },
      { title: "Top Company", value: topCompany, icon: <FaTrophy className="me-2 text-warning" /> },
      { title: "Top Policy Type", value: topPolicyType, icon: <FaThLarge className="me-2 text-info" /> },
      { title: "New Policies", value: newPoliciesThisMonth, icon: <FaFilePdf className="me-2 text-primary" /> },
      { title: "Average Premium", value: `₹${averagePremium.toLocaleString()}`, icon: <FaRupeeSign className="me-2 text-secondary" /> },
      { title: "Premium Growth Rate", value: `${premiumGrowthRate}%`, icon: <FaTrophy className="me-2 text-warning" /> },
      { title: "Total Active Premium", value: `₹${totalActivePremium.toLocaleString()}`, icon: <FaRupeeSign className="me-2 text-danger" /> },
      { title: "Policies Renewed", value: filteredPolicies.filter(p => {
          const rd = new Date(p.renewal_date);
          return rd.getMonth() === today.getMonth() && rd.getFullYear() === today.getFullYear();
        }).length, icon: <FaCheckCircle className="me-2 text-success" /> },
    ];

    return insights.map((insight, i) => (
      <div key={i} className="col-md-6 col-lg-3">
        <div
          className={`card shadow-lg border-0 d-flex flex-row align-items-center gap-3 p-4`}
          style={{
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: darkMode
              ? "rgba(255, 255, 255, 0.05)" // dark mode: light semi-transparent
              : "rgba(255, 255, 255, 0.35)", // light mode: more visible glass
            color: darkMode ? "white" : "black",
          }}
        >
          <div className="fs-2">{insight.icon}</div>
          <div>
            <h6 className="text-uppercase fw-semibold mb-1">{insight.title}</h6>
            <h5 className="fw-bold">{insight.value}</h5>
          </div>
        </div>
      </div>
    ));
  })()}
</div>


      {/* Charts */}
      <div className="row mt-4 g-3">
        {charts.map((c, i) => (
          <motion.div
            key={i}
            className="col-md-6 col-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div
              className={`card h-100 shadow-lg border-0 ${
                darkMode ? "bg-dark text-light" : "bg-white text-dark"
              }`}
              style={{
                borderRadius: "16px",
                padding: "1.2rem",
                minHeight: "420px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <h5 className="mb-3 fw-semibold">{c.title}</h5>
              <div style={{ flex: 1 }}>{c.chart}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Export PDF */}
      <div className="mt-4 d-flex gap-2">
        <button className="btn btn-danger d-flex align-items-center" onClick={exportPDF}>
          <FaFilePdf className="me-2" /> Export PDF
        </button>
      </div>
    </motion.div>
  );
}

export default Reports;
