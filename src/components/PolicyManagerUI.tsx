// src/components/PolicyManagerUI.tsx
import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { FaPlus, FaEdit, FaTrash, FaFileCsv, FaDownload } from "react-icons/fa";
import {
  Card,
  Row,
  Col,
  Form,
  InputGroup,
  Spinner,
  FloatingLabel,
  ListGroup,
  Badge,
  ProgressBar,
  Table,
  ToastContainer,
  Toast,
} from "react-bootstrap";
import type { Policy } from "../models/supabaseTypes";
import { useTheme } from "../context/ThemeContext";

type Mode = "add" | "edit" | "delete" | "import";
type CSVRow = Omit<Policy, "id"> & { __rowIndex?: number };

interface Props {
  mode: Mode;
  setMode: (m: Mode) => void;
  policy: Omit<Policy, "id">;
  setPolicy: (p: Omit<Policy, "id">) => void;
  loading: boolean;
  onAdd: (e?: React.FormEvent) => Promise<void>;
  onUpdate: (e?: React.FormEvent) => Promise<void>;
  onDelete: () => Promise<void>;
  query: string;
  setQuery: (q: string) => void;
  suggestions: string[];
  searchLoading: boolean;
  loadPolicyByNo: (s: string) => Promise<void>;
  selectedPolicyNo: string | null;
  errorMsg: string | null;
  setErrorMsg: (s: string | null) => void;
  popupMessage: string;
  showPopup: boolean;
  setShowPopup: (b: boolean) => void;

  csvRows: CSVRow[];
  csvErrors: Record<number, string>;
  csvLoading: boolean;
  importProgress: number;
  onFileSelect: (file?: File) => void;
  onDownloadTemplate: () => void;
  onPrepareImport: () => Promise<void>;
  duplicateModalOpen: boolean;
  duplicateSummary: { existing: CSVRow[]; incoming: CSVRow[] };
  setDuplicateAction: (a: "insert-only" | "update-existing" | "skip-duplicates") => void;
  duplicateAction: "insert-only" | "update-existing" | "skip-duplicates";
  setDuplicateModalOpen: (b: boolean) => void;
  confirmImportOpen: boolean;
  setConfirmImportOpen: (b: boolean) => void;
  executeImport: () => Promise<void>;
  updateCsvRow: (rowIndex: number, newRow: CSVRow) => void;
}

const TailwindModal = ({ show, onHide, title, children, footer }: any) => {
  const { isDark } = useTheme();
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden ${isDark ? 'bg-zinc-900 border border-white/10' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          <button onClick={onHide} className="text-slate-400 hover:text-rose-500 transition-colors text-xl font-bold">
            ✕
          </button>
        </div>
        <div className={`px-6 py-4 overflow-y-auto flex-1 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          {children}
        </div>
        {footer && (
          <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const MemoFloatingInput = React.memo(function MemoFloatingInput({
  label,
  name,
  type = "text",
  rows,
  value,
  setField,
}: {
  label: string;
  name: string;
  type?: string;
  rows?: number;
  value: any;
  setField: (name: string, value: any) => void;
}) {
  const { isDark } = useTheme();
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const raw = (e.target as HTMLInputElement).value;
    const v = type === "number" ? (raw === "" ? "" : Number(raw)) : raw;
    setField(name, v);
  };

  return (
    <FloatingLabel label={label} className="w-100 mb-2">
      {type === "textarea" ? (
        <Form.Control
          as="textarea"
          rows={rows || 2}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={isDark ? "glass-input-dark" : "glass-input"}
        />
      ) : type === "select" ? (
        <Form.Select name={name} value={value ?? ""} onChange={onChange} className={isDark ? "glass-input-dark" : "glass-input"}>
          {/* options should be provided by the caller via children if needed */}
        </Form.Select>
      ) : (
        <Form.Control
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={isDark ? "glass-input-dark" : "glass-input"}
        />
      )}
    </FloatingLabel>
  );
});

export default function PolicyManagerUI(props: Props) {
  const { isDark } = useTheme();
  const {
    mode,
    setMode,
    policy,
    setPolicy,
    loading,
    onAdd,
    onUpdate,
    onDelete,
    query,
    setQuery,
    suggestions,
    loadPolicyByNo,
    selectedPolicyNo,
    errorMsg,
    setErrorMsg,
    popupMessage,
    showPopup,
    setShowPopup,
    csvRows,
    csvErrors,
    csvLoading,
    importProgress,
    onFileSelect,
    onDownloadTemplate,
    onPrepareImport,
    duplicateModalOpen,
    duplicateSummary,
    setDuplicateAction,
    duplicateAction,
    setDuplicateModalOpen,
    confirmImportOpen,
    setConfirmImportOpen,
    executeImport,
    updateCsvRow,
  } = props;

  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger" | "info" | "warning">("success");
  const toastDuration = 4000;

  const setField = useCallback(
    (name: string, value: any) => {
      (setPolicy as React.Dispatch<React.SetStateAction<Omit<Policy, "id">>>)(
        (prev: Omit<Policy, "id">): Omit<Policy, "id"> => ({
          ...prev,
          [name]: value,
        })
      );
    },
    [setPolicy]
  );

  const showToast = (message: string, variant: "success" | "danger" | "info" | "warning" = "success") => {
    setToastMsg(message);
    setToastVariant(variant);
    setToastShow(true);
  };

  const handleAdd = async (e?: React.FormEvent) => {
    try {
      await onAdd(e);
      showToast("Policy added successfully", "success");
    } catch (err: any) {
      const m = err?.message ?? "Failed to add policy";
      showToast(m, "danger");
      throw err;
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    try {
      await onUpdate(e);
      showToast("Policy updated successfully", "success");
    } catch (err: any) {
      const m = err?.message ?? "Failed to update policy";
      showToast(m, "danger");
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      showToast("Policy deleted", "success");
    } catch (err: any) {
      const m = err?.message ?? "Failed to delete policy";
      showToast(m, "danger");
      throw err;
    }
  };

  const handleLoad = async (s: string) => {
    try {
      await loadPolicyByNo(s);
      showToast(`Loaded policy ${s}`, "success");
    } catch (err: any) {
      const m = err?.message ?? `Failed to load ${s}`;
      showToast(m, "danger");
      throw err;
    }
  };

  const handleClear = () => {
    setPolicy({} as any);
    setQuery("");
    setErrorMsg(null);
    showToast("Cleared form", "info");
  };

  const handleFileSelect = (file?: File) => {
    onFileSelect(file);
    if (file) showToast(`Selected file: ${file.name}`, "info");
  };

  const handleDownloadTemplate = () => {
    try {
      onDownloadTemplate();
      showToast("Template downloaded", "info");
    } catch (err: any) {
      showToast(err?.message ?? "Failed to download template", "danger");
    }
  };

  const handlePrepareImport = async () => {
    try {
      await onPrepareImport();
      if (Object.keys(csvErrors).length > 0) {
        showToast("Preview completed with some validation issues", "warning");
      } else {
        showToast("Preview successful — no validation issues", "success");
      }
    } catch (err: any) {
      showToast(err?.message ?? "Preview failed", "danger");
      throw err;
    }
  };

  const handleEditCsvRow = (rowIndex: number, r: CSVRow) => {
    updateCsvRow(rowIndex, r);
    showToast(`Row ${rowIndex + 1} updated`, "info");
  };

  const handleDuplicateProceed = () => {
    setDuplicateModalOpen(false);
    setConfirmImportOpen(true);
    showToast("Proceeding to import — confirm to start", "info");
  };

  const handleExecuteImport = async () => {
    try {
      await executeImport();
      showToast("Import started", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Import failed to start", "danger");
      throw err;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.26 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`container my-4 ${isDark ? "dark-mode" : ""}`}
    >
      <div
        className="polipulse-subnav mb-3 d-flex justify-content-center gap-3 p-3 rounded-3"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
          backdropFilter: "blur(10px)",
        }}
      >
        {[
          { key: "add", icon: <FaPlus />, label: "Add" },
          { key: "edit", icon: <FaEdit />, label: "Edit" },
          { key: "delete", icon: <FaTrash />, label: "Delete" },
          { key: "import", icon: <FaFileCsv />, label: "Import" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setMode(t.key as Mode);
            }}
            className={`subnav-btn ${mode === t.key ? "active" : ""}`}
          >
            {t.icon} <span className="ms-1">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(mode === "edit" || mode === "delete") && (
          <motion.div key="search" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
            <Card className={`mb-4 p-3 ${isDark ? "glass-dark" : "glass-light"}`}>
              <Row className="g-2 align-items-center">
                <Col xs={12} md={7}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search policy number..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={isDark ? "glass-input-dark" : "glass-input"}
                    />
                    <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors" onClick={() => query && handleLoad(query)} disabled={!query || loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Load"}
                    </button>
                  </InputGroup>

                  {suggestions.length > 0 && (
                    <ListGroup className={`mt-2 ${isDark ? "bg-dark border-secondary" : ""}`}>
                      {suggestions.map((s) => (
                        <ListGroup.Item
                          key={s}
                          action
                          onClick={() => {
                            setQuery(s);
                            handleLoad(s);
                          }}
                          className={isDark ? "bg-dark text-light" : ""}
                        >
                          {s}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>

                <Col xs={12} md={5} className="text-md-end">
                  {mode === "edit" && (
                    <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors me-2"
                    onClick={() => {
                      handleClear();
                    }}
                  >
                    Clear
                  </button>
                  )}

                  {mode === "delete" && (
                    <button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors" onClick={handleDelete} disabled={loading || (!query && !selectedPolicyNo)}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Delete"}
                    </button>
                  )}
                </Col>
              </Row>
              {errorMsg && <div className="text-danger mt-2">{errorMsg}</div>}
            </Card>
          </motion.div>
        )}

        {(mode === "add" || mode === "edit") && (
          <motion.form key="form" variants={cardVariants} initial="hidden" animate="visible" exit="exit" onSubmit={mode === "add" ? handleAdd : handleUpdate}>
            <Card className={`mb-3 p-4 ${isDark ? "glass-dark" : "glass-light"}`}>
              <h5 className="section-title">Client Information</h5>
              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <MemoFloatingInput label="Client Name" name="client_name" value={(policy as any).client_name ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/2 px-2 mb-4">
                  <MemoFloatingInput label="Nominee Name" name="nominee_name" value={(policy as any).nominee_name ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="DOB" name="dob" type="date" value={(policy as any).dob ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Phone" name="phone_no" value={(policy as any).phone_no ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Email" name="email" type="email" value={(policy as any).email ?? ""} setField={setField} />
                </div>
                <Col xs={12}>
                  <MemoFloatingInput label="Address" name="address" type="textarea" rows={2} value={(policy as any).address ?? ""} setField={setField} />
                </Col>
              </div>
            </Card>

            <Card className={`mb-3 p-4 ${isDark ? "glass-dark" : "glass-light"}`}>
              <h5 className="section-title">Policy Information</h5>
              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Policy No" name="policy_no" value={(policy as any).policy_no ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Company Name" name="company_name" value={(policy as any).company_name ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <FloatingLabel label="Business Type" className="w-100">
                    <Form.Select
                      name="business_type"
                      value={(policy as any).business_type ?? ""}
                      onChange={(e) => setField("business_type", e.target.value)}
                      className={isDark ? "glass-input-dark" : "glass-input"}
                    >
                      <option value="">Select</option>
                      <option>Life Insurance</option>
                      <option>Health Insurance</option>
                      <option>General Insurance</option>
                      <option>Motor Insurance</option>
                      <option>Travel Insurance</option>
                      <option>Home Insurance</option>
                    </Form.Select>
                  </FloatingLabel>
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Policy Type" name="policy_type" value={(policy as any).policy_type ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <FloatingLabel label="Premium (₹)" className="w-100">
                    <Form.Control
                      type="number"
                      name="premium"
                      value={(policy as any).premium ?? ""}
                      onChange={(e) => setField("premium", e.target.value === "" ? "" : Number(e.target.value))}
                      className={isDark ? "glass-input-dark" : "glass-input"}
                      min={0}
                    />
                  </FloatingLabel>
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Purchase Date" name="purchase_date" type="date" value={(policy as any).purchase_date ?? ""} setField={setField} />
                </div>
                <div className="w-full md:w-1/3 px-2 mb-4">
                  <MemoFloatingInput label="Renewal Date" name="renewal_date" type="date" value={(policy as any).renewal_date ?? ""} setField={setField} />
                </div>
                <Col xs={12}>
                  <MemoFloatingInput label="Remarks" name="remarks" type="textarea" rows={2} value={(policy as any).remarks ?? ""} setField={setField} />
                </Col>
                <Col xs={12} className="text-end">
                  <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors modern-submit" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : mode === "add" ? "➕ Add Policy" : "💾 Update Policy"}
                  </button>
                </Col>
              </div>
            </Card>
          </motion.form>
        )}

        {mode === "import" && (
          <motion.div key="import" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
            <Card className={`mb-3 p-4 ${isDark ? "glass-dark" : "glass-light"}`}>
              <Row className="align-items-center">
                <Col md={8}>
                  <h4 className="section-title">
                    <FaFileCsv /> Import Policies (CSV)
                  </h4>
                  <small className="text-muted">Download template → upload CSV → preview → resolve duplicates → import</small>
                </Col>
                <Col md={4} className="text-end d-flex flex-column gap-2">
                  <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors w-100" onClick={handleDownloadTemplate}>
                    <FaDownload /> Template
                  </button>
                  <label className="modern-file-input w-100">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        handleFileSelect(file);
                      }}
                    />
                    Select CSV File
                  </label>
                </Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col xs={12}>
                  <div className="flex gap-2">
                    <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors" onClick={handlePrepareImport} disabled={csvRows.length === 0 || csvLoading}>
                      {csvLoading ? <Spinner animation="border" size="sm" /> : "Preview & Validate"}
                    </button>
                    <button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors" onClick={() => { window.location.reload(); showToast("Cleared import state", "info"); }}>
                      Clear
                    </button>
                    {importProgress > 0 && (
                      <div style={{ minWidth: 200 }}>
                        <ProgressBar now={importProgress} label={`${importProgress}%`} />
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              <div style={{ maxHeight: 360, overflow: "auto", borderRadius: 12 }}>
                <Table bordered hover size="sm" className={`modern-table ${isDark ? "table-dark" : ""}`}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Policy No</th>
                      <th>Client</th>
                      <th>Company</th>
                      <th>Premium</th>
                      <th>Purchase</th>
                      <th>Renewal</th>
                      <th>Status</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">
                          No CSV loaded. Upload a file first.
                        </td>
                      </tr>
                    ) : (
                      csvRows.map((r, idx) => {
                        const rowIndex = r.__rowIndex ?? idx;
                        const err = csvErrors[rowIndex];
                        return (
                          <tr key={rowIndex} className={isDark ? "text-light" : "text-dark"}>
                            <td>{rowIndex + 1}</td>
                            <td>{r.policy_no || "—"}</td>
                            <td>{r.client_name}</td>
                            <td>{r.company_name}</td>
                            <td>{r.premium}</td>
                            <td>{r.purchase_date}</td>
                            <td>{r.renewal_date}</td>
                            <td>{err ? <Badge bg="danger">Invalid</Badge> : <Badge bg="success">OK</Badge>}</td>
                            <td>
                              <button className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg shadow-md transition-colors text-xs"
                                onClick={() => {
                                  const updated = { ...r, client_name: prompt("Edit client name", r.client_name) ?? r.client_name };
                                  handleEditCsvRow(rowIndex, updated);
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <TailwindModal show={showPopup} onHide={() => setShowPopup(false)} title="Notice">
        <div>{popupMessage}</div>
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors" onClick={() => setShowPopup(false)}>OK</button>
        </div>
      </TailwindModal>

      <TailwindModal show={duplicateModalOpen} onHide={() => setDuplicateModalOpen(false)} title="Duplicates Found">
        <div>
          <p>Found <strong>{duplicateSummary.existing.length}</strong> duplicates (existing policy numbers).</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className={`px-4 py-2 rounded-xl border font-bold transition-all ${duplicateAction === "insert-only" ? "bg-indigo-600 text-white" : "bg-white/5 border-white/10"}`} onClick={() => setDuplicateAction("insert-only")}>Insert Only</button>
            <button className={`px-4 py-2 rounded-xl border font-bold transition-all ${duplicateAction === "update-existing" ? "bg-indigo-600 text-white" : "bg-white/5 border-white/10"}`} onClick={() => setDuplicateAction("update-existing")}>Update Existing</button>
            <button className={`px-4 py-2 rounded-xl border font-bold transition-all ${duplicateAction === "skip-duplicates" ? "bg-indigo-600 text-white" : "bg-white/5 border-white/10"}`} onClick={() => setDuplicateAction("skip-duplicates")}>Skip Duplicates</button>
          </div>
          <div style={{ maxHeight: 240, overflow: "auto" }}>
            <Table size="sm" bordered className={isDark ? "table-dark" : ""}>
              <thead className={isDark ? 'bg-zinc-800' : 'bg-slate-50'}>
                <tr><th>Policy No</th><th>Client (CSV)</th><th>Company (CSV)</th></tr>
              </thead>
              <tbody>
                {duplicateSummary.existing.length === 0 ? (
                  <tr><td colSpan={3} className="text-muted">No duplicates</td></tr>
                ) : (
                  duplicateSummary.existing.map((r, i) => <tr key={i}><td>{r.policy_no}</td><td>{r.client_name}</td><td>{r.company_name}</td></tr>)
                )}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button className="px-6 py-2 border border-white/10 font-bold rounded-xl" onClick={() => setDuplicateModalOpen(false)}>Cancel</button>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20" onClick={() => { handleDuplicateProceed(); }}>Proceed</button>
        </div>
      </TailwindModal>

      <TailwindModal show={confirmImportOpen} onHide={() => setConfirmImportOpen(false)} title="Confirm Import">
        <div>
          <p>Import <strong>{csvRows.length}</strong> rows?</p>
          <div className="small text-muted">Duplicate handling: <strong className="text-indigo-500 uppercase">{duplicateAction}</strong></div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button className="px-6 py-2 border border-white/10 font-bold rounded-xl" onClick={() => setConfirmImportOpen(false)}>Cancel</button>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20" onClick={handleExecuteImport} disabled={csvLoading}>{csvLoading ? <Spinner animation="border" size="sm" /> : "Start Import"}</button>
        </div>
      </TailwindModal>

      <ToastContainer className="p-3" position="bottom-center">
        <Toast bg={toastVariant} onClose={() => setToastShow(false)} show={toastShow} autohide delay={toastDuration}>
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <style>{`
        .polipulse-subnav { gap: 18px; }
        .subnav-btn {
          padding: 10px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all .25s ease;
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
          color: inherit;
        }
        .subnav-btn.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 10px 25px rgba(99,102,241,0.3);
          transform: translateY(-2px);
        }

        .glass-light { background: rgba(255,255,255,0.8); border-radius: 2rem; border: 1px solid rgba(0,0,0,0.05); }
        .glass-dark { background: rgba(24,24,27,0.8); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); }
        .glass-input { border-radius: 12px !important; border: 1px solid rgba(0,0,0,0.1) !important; padding: 12px !important; }
        .glass-input-dark { border-radius: 12px !important; background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #fff !important; padding: 12px !important; }
        
        .modern-file-input { padding: 12px 18px; border-radius: 12px; border: 2px dashed rgba(99,102,241,0.2); text-align:center; cursor:pointer; font-weight: 700; transition: all 0.3s; }
        .modern-file-input:hover { border-color: #6366f1; background: rgba(99,102,241,0.05); }
        .modern-file-input input { display:none; }

        .section-title { font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; opacity: 0.5; margin-bottom: 24px; }

        .modern-table { border-radius: 1rem; overflow: hidden; border: none; }
        .modern-table thead th { background: rgba(99,102,241,0.1); border: none; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; padding: 16px; }
        .modern-table tbody td { padding: 16px; font-weight: 600; font-size: 13px; border: none; }

        .dark-mode { color: #fff; }
        .dark-mode .table, .dark-mode .table td, .dark-mode .table th { color: #fff; }
      `}</style>
    </motion.div>
  );
}
