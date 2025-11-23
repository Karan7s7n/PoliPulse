import React, { useState, useMemo } from "react";
import type { Policy } from "../models/supabaseTypes";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import jsPDF from "jspdf";
import Papa from "papaparse";

const supabaseUrl = "https://shmvmxxhxvrnhlwdjcmp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXZteHhoeHZybmhsd2RqY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDAyMzMsImV4cCI6MjA3NTQ3NjIzM30.HpC27sRY0sxlz6QzqdKCzJJpDRnHEFT2uGcPl-gXo48";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SortOrder = "asc" | "desc" | null;

interface Props {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  darkMode: boolean;
}

function PolicyTable({ policies, setPolicies, darkMode }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRemarks, setEditedRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 10;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Expired":
        return <FaTimesCircle size={22} style={{ color: "#dc3545", transition: "0.3s" }} />;
      case "Expiring Soon":
        return <FaClock size={22} style={{ color: "#ffa500", transition: "0.3s" }} />;
      case "Active":
        return <FaCheckCircle size={22} style={{ color: "#28a745", transition: "0.3s" }} />;
      default:
        return null;
    }
  };

  const getBackgroundTint = (status: string, darkMode: boolean) => {
    if (darkMode) return "#1e1e1e";
    switch (status) {
      case "Active":
        return "rgba(40, 167, 69, 0.08)";
      case "Expiring Soon":
        return "rgba(255, 165, 0, 0.08)";
      case "Expired":
        return "rgba(220, 53, 69, 0.08)";
      default:
        return "white";
    }
  };

  const sortedPolicies = useMemo(() => {
    const sorted = [...policies];
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
  }, [policies, sortField, sortOrder]);

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
  const totalPages = Math.ceil(policies.length / policiesPerPage);

  const prepareDataForExport = (data: Policy[]) =>
    data.map((p) => ({ ...p, premium: p.premium ? `INR ${p.premium}` : "" }));

  const exportAllPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(16);
    pdf.text("Policy Report", width / 2, 15, { align: "center" });
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, width - 10, 22, { align: "right" });

    let y = 30;
    pdf.setFontSize(9);

    const allData = prepareDataForExport(sortedPolicies);
    allData.forEach((p) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(
        `${p.client_name} | ${p.policy_no} | ${p.company_name} | ${p.policy_type} | ${p.renewal_date}`,
        10,
        y
      );
      y += 6;
    });

    pdf.save(`policies_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportAllCSV = () => {
    const allData = prepareDataForExport(sortedPolicies);
    const csv = Papa.unparse(allData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `policies_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const buttonStyle = (bgColor: string, color: string) => ({
    padding: "8px 16px",
    borderRadius: "12px",
    border: "none",
    background: bgColor,
    color,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    transition: "all 0.25s ease",
  });

  const buttonHover = {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  };

  const cardHover = {
    transform: "scale(1.02)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* SORT BY */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "15px",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <label style={{ fontWeight: 500 }}>Sort By:</label>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as keyof Policy | "status")}
          style={{
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <option value="client_name">Client Name</option>
          <option value="company_name">Company Name</option>
          <option value="policy_no">Policy No</option>
          <option value="premium">Premium</option>
          <option value="renewal_date">Renewal Date</option>
          <option value="policy_type">Type</option>
          <option value="status">Status</option>
        </select>
        <select
          value={sortOrder || "asc"}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          style={{
            padding: "8px 12px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* CARDS */}
      <div className="row" style={{ margin: 0 }}>
        {currentPolicies.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.6, width: "100%", padding: "40px", fontSize: "18px" }}>
            No policies found.
          </div>
        ) : (
          currentPolicies.map((p) => {
            const status = getStatus(p.renewal_date);
            return (
              <div key={p.id} style={{ width: "100%", marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    borderLeft: `6px solid ${
                      status === "Active" ? "#28a745" : status === "Expiring Soon" ? "#ffa500" : "#dc3545"
                    }`,
                    background: getBackgroundTint(status, darkMode),
                    color: darkMode ? "white" : "black",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e: any) => Object.assign(e.currentTarget.style, cardHover)}
                  onMouseLeave={(e: any) =>
                    Object.assign(e.currentTarget.style, {
                      transform: "scale(1)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    })
                  }
                >
                  {/* TOP ROW */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link
                      to={`/holder/${p.id}`}
                      style={{ fontSize: "18px", fontWeight: "600", color: darkMode ? "white" : "black", textDecoration: "none" }}
                    >
                      {p.client_name}
                    </Link>
                    <Link
                      to={`/company/${p.company_name}`}
                      style={{ fontSize: "16px", color: darkMode ? "#aaa" : "#555", textDecoration: "none" }}
                    >
                      {p.company_name}
                    </Link>
                    <div style={{ textAlign: "center", transition: "all 0.3s" }}>{getStatusIcon(status)}</div>
                  </div>

                  {/* BOTTOM ROW */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                      marginTop: "12px",
                      fontSize: "14px",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <b>Policy No:</b> {p.policy_no}
                    </div>
                    <div>
                      <b>Premium:</b> ₹{p.premium}
                    </div>
                    <div>
                      <b>Renewal:</b> {formatDate(p.renewal_date)}
                    </div>
                    <div>
                      <b>Type:</b> {p.policy_type}
                    </div>
                    <div>
                      <b>Remarks:</b>{" "}
                      {editingId === p.id ? (
                        <input
                          type="text"
                          value={editedRemarks}
                          onChange={(e) => setEditedRemarks(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, p.id)}
                          autoFocus
                          style={{
                            padding: "4px 6px",
                            width: "100%",
                            borderRadius: "5px",
                            border: "1px solid #777",
                            background: darkMode ? "#333" : "white",
                            color: darkMode ? "white" : "black",
                          }}
                        />
                      ) : (
                        <span onDoubleClick={() => startEditing(p.id, p.remarks)} style={{ cursor: "pointer" }}>
                          {p.remarks || "-"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", marginBottom: "20px", opacity: 0.9 }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          style={{ ...buttonStyle("#6c757d", "white"), opacity: currentPage === 1 ? 0.5 : 1 }}
          onMouseOver={(e: any) => Object.assign(e.currentTarget.style, buttonHover)}
          onMouseOut={(e: any) =>
            Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" })
          }
        >
          Prev
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          style={{ ...buttonStyle("#6c757d", "white"), opacity: currentPage === totalPages ? 0.5 : 1 }}
          onMouseOver={(e: any) => Object.assign(e.currentTarget.style, buttonHover)}
          onMouseOut={(e: any) =>
            Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" })
          }
        >
          Next
        </button>
      </div>

      {/* EXPORT BUTTONS */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <button
          onClick={exportAllPDF}
          style={buttonStyle("#007bff", "white")}
          onMouseOver={(e: any) => Object.assign(e.currentTarget.style, buttonHover)}
          onMouseOut={(e: any) =>
            Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" })
          }
        >
          📄 Export All as PDF
        </button>
        <button
          onClick={exportAllCSV}
          style={buttonStyle("#28a745", "white")}
          onMouseOver={(e: any) => Object.assign(e.currentTarget.style, buttonHover)}
          onMouseOut={(e: any) =>
            Object.assign(e.currentTarget.style, { transform: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" })
          }
        >
          📊 Export All as CSV
        </button>
      </div>
    </div>
  );
}

export default PolicyTable;
