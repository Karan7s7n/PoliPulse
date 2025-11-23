// src/pages/PolicyManager.tsx
// Updated PolicyManager.tsx with PapaParse integration and fixes
// (Complete working version)

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../models/supabaseClient";
import type { Policy } from "../models/supabaseTypes";
import PolicyManagerUI from "../components/PolicyManagerUI";
import Papa from "papaparse";

type Mode = "add" | "edit" | "delete" | "import";

const emptyPolicy: Omit<Policy, "id"> = {
  client_name: "",
  nominee_name: "",
  dob: "",
  phone_no: "",
  email: "",
  address: "",
  client_type: "",
  business_type: "",
  purchase_date: "",
  policy_no: "",
  company_name: "",
  policy_type: "",
  premium: 0,
  renewal_date: "",
  remarks: "",
};

export default function PolicyManager({
  darkMode,
  initialPolicies,
  setPolicies,
}: {
  darkMode: boolean;
  initialPolicies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}) {
  const [mode, setMode] = useState<Mode>("add");
  const [, setLocalPolicies] = useState<Policy[]>(initialPolicies || []);
  const [policy, setPolicy] = useState<Omit<Policy, "id">>(emptyPolicy);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<number | null>(null);
  const [selectedPolicyNo, setSelectedPolicyNo] = useState<string | null>(null);

  // CSV
  type CSVRow = Omit<Policy, "id"> & { __rowIndex?: number };
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<Record<number, string>>({});
  const [csvLoading, setCsvLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateSummary, setDuplicateSummary] = useState<{ existing: CSVRow[]; incoming: CSVRow[] }>({ existing: [], incoming: [] });
  const [duplicateAction, setDuplicateAction] = useState<"insert-only" | "update-existing" | "skip-duplicates">("insert-only");
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => fetchSuggestions(query), 300);
  }, [query]);

  const fetchSuggestions = async (q: string) => {
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from("policy")
        .select("policy_no")
        .ilike("policy_no", `%${q}%`)
        .limit(8);
      if (error) throw error;
      setSuggestions((data || []).map((r: any) => String(r.policy_no)));
    } catch (e: any) {
      console.error("fetchSuggestions error:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPolicyByNo = async (policyNo: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.from("policy").select("*").eq("policy_no", policyNo).single();
      if (error) throw error;
      const { id: _, ...rest } = data;
      setPolicy(rest);
      setSelectedPolicyNo(policyNo);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Failed to load policy");
      setPolicy(emptyPolicy);
      setSelectedPolicyNo(null);
    } finally {
      setLoading(false);
    }
  };

  // validation accepts Policy-like object
  const validatePolicyRow = (p: Omit<Policy, "id">) => {
    if (!p.client_name || String(p.client_name).trim() === "") return "Client name required";
    if (!p.policy_no || String(p.policy_no).trim() === "") return "Policy number required";
    if (!p.company_name || String(p.company_name).trim() === "") return "Company name required";
    if (!p.business_type || String(p.business_type).trim() === "") return "Business type required";
    if (!p.policy_type || String(p.policy_type).trim() === "") return "Policy type required";
    if (!p.purchase_date || String(p.purchase_date).trim() === "") return "Purchase date required";
    if (!p.renewal_date || String(p.renewal_date).trim() === "") return "Renewal date required";
    const premiumNum = Number((p as any).premium);
    if (Number.isNaN(premiumNum) || premiumNum <= 0) return "Premium must be > 0";
    return null;
  };

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validatePolicyRow(policy);
    if (v) return setErrorMsg(v);
    setLoading(true);
    try {
      // ensure no internal keys
      const toInsert = { ...policy } as any;
      delete toInsert.__rowIndex;
      const { data, error } = await supabase.from("policy").insert([toInsert]).select();
      if (error) throw error;
      setPolicies(prev => [...prev, data![0]]);
      setPopupMessage("Policy added");
      setShowPopup(true);
      setPolicy(emptyPolicy);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Add failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedPolicyNo) return setErrorMsg("No policy loaded");
    const v = validatePolicyRow(policy);
    if (v) return setErrorMsg(v);
    setLoading(true);
    try {
      const toUpdate = { ...policy } as any;
      delete toUpdate.__rowIndex;
      const { data, error } = await supabase.from("policy").update(toUpdate).eq("policy_no", selectedPolicyNo).select();
      if (error) throw error;
      setPolicies(prev => prev.map(p => (p.policy_no === selectedPolicyNo ? data![0] : p)));
      setPopupMessage("Policy updated");
      setShowPopup(true);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const toDelete = selectedPolicyNo || query;
    if (!toDelete) return;
    if (!confirm(`Delete ${toDelete}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("policy").delete().eq("policy_no", toDelete);
      if (error) throw error;
      setPolicies(prev => prev.filter(p => p.policy_no !== toDelete));
      setPopupMessage("Policy deleted");
      setShowPopup(true);
      setQuery("");
      setSelectedPolicyNo(null);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = [
      "client_name",
      "nominee_name",
      "dob",
      "phone_no",
      "email",
      "address",
      "client_type",
      "business_type",
      "purchase_date",
      "policy_no",
      "company_name",
      "policy_type",
      "premium",
      "renewal_date",
      "remarks",
    ];
    const sample = [
      "John Doe",
      "Jane Doe",
      "1980-07-01",
      "9876543210",
      "john@example.com",
      "Mumbai",
      "Individual",
      "Life Insurance",
      "2025-01-01",
      "POL12345",
      "Acme Insurers",
      "Term",
      "12000",
      "2026-01-01",
      "N/A",
    ];
    const csv = [headers.join(","), sample.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policies_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSVFile = (file: File) => {
    setCsvErrors({});
    setCsvRows([]);
    setErrorMsg(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => (h ? h.trim() : h),
      complete: (res) => {
        // map each row, trim string values and convert premium
        const rows: CSVRow[] = (res.data as any[]).map((rawRow: any, idx: number) => {
          const normalized: any = {};
          Object.entries(rawRow || {}).forEach(([k, v]) => {
            const key = String(k).trim();
            const val = typeof v === "string" ? v.trim() : v;
            normalized[key] = val;
          });

          // Ensure shape matches expected columns
          const row: CSVRow = {
            client_name: normalized.client_name ?? "",
            nominee_name: normalized.nominee_name ?? "",
            dob: normalized.dob ?? "",
            phone_no: normalized.phone_no ?? "",
            email: normalized.email ?? "",
            address: normalized.address ?? "",
            client_type: normalized.client_type ?? "",
            business_type: normalized.business_type ?? "",
            purchase_date: normalized.purchase_date ?? "",
            policy_no: normalized.policy_no ?? "",
            company_name: normalized.company_name ?? "",
            policy_type: normalized.policy_type ?? "",
            premium: normalized.premium !== undefined && normalized.premium !== "" ? Number(normalized.premium) : 0,
            renewal_date: normalized.renewal_date ?? "",
            remarks: normalized.remarks ?? "",
            __rowIndex: idx,
          };

          return row;
        });

        const errs: Record<number, string> = {};
        rows.forEach((r) => {
          const v = validatePolicyRow(r);
          if (v) errs[r.__rowIndex as number] = v;
        });

        setCsvErrors(errs);
        setCsvRows(rows);
        // if errors exist, set a higher-level message so UI can show it
        if (Object.keys(errs).length) setErrorMsg("CSV has validation errors. Fix rows before importing.");
      },
      error: (err) => {
        setErrorMsg(err.message ?? "CSV parse error");
      },
    });
  };

  const handleCSVFileInput = (file?: File) => file && parseCSVFile(file);

  const findDuplicates = async (rows: CSVRow[]) => {
    const policyNos = Array.from(new Set(rows.map((r) => String(r.policy_no).trim()).filter(Boolean)));
    if (!policyNos.length) return [];
    const { data, error } = await supabase.from("policy").select("*").in("policy_no", policyNos);
    if (error) {
      console.error("findDuplicates error:", error);
      return [];
    }
    return data || [];
  };

  const prepareImport = async () => {
    setErrorMsg(null);
    if (!csvRows.length) return setErrorMsg("No CSV rows loaded");
    const errs: Record<number, string> = {};
    csvRows.forEach((r) => {
      const v = validatePolicyRow(r);
      if (v) errs[r.__rowIndex as number] = v;
    });
    if (Object.keys(errs).length) {
      setCsvErrors(errs);
      return setErrorMsg("Fix validation errors");
    }

    const existing = await findDuplicates(csvRows);
    const existMap = new Map(existing.map((e: any) => [e.policy_no, e]));

    const existingRows: CSVRow[] = [];
    const incomingRows: CSVRow[] = [];

    csvRows.forEach((r) => (existMap.has(r.policy_no) ? existingRows.push(r) : incomingRows.push(r)));

    setDuplicateSummary({ existing: existingRows, incoming: incomingRows });

    if (existingRows.length) {
      // prompt user choice UI (modal) will decide duplicateAction
      setDuplicateModalOpen(true);
    } else {
      setDuplicateAction("insert-only");
      setConfirmImportOpen(true);
    }
  };

  const executeImport = async () => {
    setCsvLoading(true);
    setImportProgress(0);
    setErrorMsg(null);

    // re-check duplicates from server to avoid race conditions
    const existingRaw = await findDuplicates(csvRows);
    const existMap = new Map(existingRaw.map((e: any) => [e.policy_no, e]));

    // build tasks using csvRows but only include actions based on duplicateAction
    const tasks: { type: "insert" | "update"; row: CSVRow }[] = [];
    for (const r of csvRows) {
      if (!existMap.has(r.policy_no)) {
        tasks.push({ type: "insert", row: r });
      } else {
        if (duplicateAction === "update-existing") tasks.push({ type: "update", row: r });
        // if skip-duplicates -> do nothing
      }
    }

    const total = tasks.length;
    if (!total) {
      setCsvLoading(false);
      setPopupMessage("No rows to import (all duplicates skipped or nothing to insert).");
      setShowPopup(true);
      setConfirmImportOpen(false);
      setDuplicateModalOpen(false);
      return;
    }

    let done = 0;
    const failedRows: { rowIndex?: number; error: string }[] = [];

    for (const t of tasks) {
      // copy row and remove internal fields
      const rowCopy: any = { ...t.row };
      const rowIndex = rowCopy.__rowIndex;
      delete rowCopy.__rowIndex;

      // ensure no undefined values and trim strings
      Object.entries(rowCopy).forEach(([k, v]) => {
        if (typeof v === "string") rowCopy[k] = v.trim();
        if (v === "") rowCopy[k] = null; // normalize empty strings to null if you prefer
      });

      try {
        if (t.type === "insert") {
          const { error } = await supabase.from("policy").insert([rowCopy]);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("policy").update(rowCopy).eq("policy_no", (t.row.policy_no as string));
          if (error) throw error;
        }
      } catch (e: any) {
        console.error("import row error:", e);
        failedRows.push({ rowIndex, error: e.message ?? "Unknown" });
      } finally {
        done++;
        setImportProgress(Math.round((done / total) * 100));
      }
    }

    // refresh affected rows in local state if any succeeded
    const affectedNos = tasks.map((t) => t.row.policy_no);
    if (affectedNos.length) {
      const { data, error } = await supabase.from("policy").select("*").in("policy_no", affectedNos);
      if (!error && data) {
        setPolicies((prev) => {
          const map = new Map(prev.map((p) => [p.policy_no, p]));
          data.forEach((r: any) => map.set(r.policy_no, r));
          return [...map.values()];
        });
      }
    }

    // show result
    if (failedRows.length) {
      setErrorMsg(`Import completed with ${failedRows.length} failed rows. Check console for details.`);
      console.error("Failed import rows:", failedRows);
    } else {
      setPopupMessage("CSV import completed");
      setShowPopup(true);
    }

    // cleanup UI state
    setCsvRows([]);
    setCsvErrors({});
    setDuplicateModalOpen(false);
    setConfirmImportOpen(false);
    setCsvLoading(false);
    setImportProgress(0);
  };

  const updateCsvRow = (rowIndex: number, newRow: CSVRow) => {
    setCsvRows((prev) => prev.map((r) => (r.__rowIndex === rowIndex ? { ...newRow, __rowIndex: rowIndex } : r)));
    const v = validatePolicyRow(newRow);
    setCsvErrors((prev) => {
      const cp = { ...prev };
      if (v) cp[rowIndex] = v;
      else delete cp[rowIndex];
      return cp;
    });
  };

  return (
    <PolicyManagerUI
      darkMode={darkMode}
      mode={mode}
      setMode={(m) => {
        setMode(m);
        setErrorMsg(null);
        setPolicy(emptyPolicy);
        setQuery("");
        setSuggestions([]);
        setCsvRows([]);
        setCsvErrors({});
        setImportProgress(0);
      }}
      policy={policy}
      setPolicy={setPolicy}
      loading={loading}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      query={query}
      setQuery={setQuery}
      suggestions={suggestions}
      searchLoading={searchLoading}
      loadPolicyByNo={loadPolicyByNo}
      selectedPolicyNo={selectedPolicyNo}
      errorMsg={errorMsg}
      setErrorMsg={setErrorMsg}
      popupMessage={popupMessage}
      showPopup={showPopup}
      setShowPopup={setShowPopup}
      csvRows={csvRows}
      csvErrors={csvErrors}
      csvLoading={csvLoading}
      importProgress={importProgress}
      onFileSelect={handleCSVFileInput}
      onDownloadTemplate={downloadCSVTemplate}
      onPrepareImport={prepareImport}
      duplicateModalOpen={duplicateModalOpen}
      duplicateSummary={duplicateSummary}
      setDuplicateAction={setDuplicateAction}
      duplicateAction={duplicateAction}
      setDuplicateModalOpen={setDuplicateModalOpen}
      confirmImportOpen={confirmImportOpen}
      setConfirmImportOpen={setConfirmImportOpen}
      executeImport={executeImport}
      updateCsvRow={updateCsvRow}
    />
  );
}
