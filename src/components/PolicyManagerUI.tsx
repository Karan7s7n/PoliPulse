// src/components/PolicyManagerUI.tsx
import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  FloatingLabel,
  InputGroup,
  Spinner,
  ListGroup,
  Table,
  Modal,
  ProgressBar,
  Badge,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaFileCsv, FaDownload } from "react-icons/fa";
import type { Policy } from "../models/supabaseTypes";

type Mode = "add" | "edit" | "delete" | "import";
type CSVRow = Omit<Policy, "id"> & { __rowIndex?: number };

interface Props {
  darkMode: boolean;
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

/**
 * Memoized Floating Input component.
 * - Accepts stable `setField(name, value)` callback to avoid passing a new handler each render.
 * - Controlled value passed as prop.
 * - Memoized to avoid remounting which caused focus loss.
 */
const MemoFloatingInput = React.memo(function MemoFloatingInput({
  label,
  name,
  type = "text",
  rows,
  value,
  setField,
  darkMode,
}: {
  label: string;
  name: string;
  type?: string;
  rows?: number;
  value: any;
  setField: (name: string, value: any) => void;
  darkMode: boolean;
}) {
  // internal handler uses stable setField
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
          className={darkMode ? "glass-input-dark" : "glass-input"}
        />
      ) : type === "select" ? (
        <Form.Select name={name} value={value ?? ""} onChange={onChange} className={darkMode ? "glass-input-dark" : "glass-input"}>
          {/* options should be provided by the caller via children if needed */}
        </Form.Select>
      ) : (
        <Form.Control
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={darkMode ? "glass-input-dark" : "glass-input"}
        />
      )}
    </FloatingLabel>
  );
});

export default function PolicyManagerUI(props: Props) {
  const {
    darkMode,
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

  // internal toast state (bottom-center, 4s autohide)
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<"success" | "danger" | "info" | "warning">("success");
  const toastDuration = 4000; // 4 seconds

  // stable setter passed to MemoFloatingInput to avoid new handler each render
  const setField = useCallback(
  (name: string, value: any) => {
    (setPolicy as React.Dispatch<React.SetStateAction<Omit<Policy, "id">>>)(
      (prev: Omit<Policy, "id">): Omit<Policy, "id"> => ({
        ...prev,
        [name]: value,
      })
    );
  },
  []
);





  // wrapper helpers to call provided props and show toasts
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
      // keep original behavior; show toast for error too
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
    // keep exactly same behavior
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
      // If there are csvErrors we still consider preview done (caller populates csvErrors)
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

  // small motion variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.26 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`container my-4 ${darkMode ? "dark-mode" : ""}`}
    >
      {/* SUBNAV — pill tabs */}
      <div
        className="polipulse-subnav mb-3 d-flex justify-content-center gap-3 p-3 rounded-3"
        style={{
          background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
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
              // small reset handled by parent if needed
            }}
            className={`subnav-btn ${mode === t.key ? "active" : ""}`}
          >
            {t.icon} <span className="ms-1">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Animated area: show one panel at a time */}
      <AnimatePresence mode="wait">
        {(mode === "edit" || mode === "delete") && (
          <motion.div key="search" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
            <Card className={`mb-4 p-3 ${darkMode ? "glass-dark" : "glass-light"}`}>
              <Row className="g-2 align-items-center">
                <Col xs={12} md={7}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Search policy number..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={darkMode ? "glass-input-dark" : "glass-input"}
                    />
                    <Button onClick={() => query && handleLoad(query)} disabled={!query || loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Load"}
                    </Button>
                  </InputGroup>

                  {suggestions.length > 0 && (
                    <ListGroup className={`mt-2 ${darkMode ? "bg-dark border-secondary" : ""}`}>
                      {suggestions.map((s) => (
                        <ListGroup.Item
                          key={s}
                          action
                          onClick={() => {
                            setQuery(s);
                            handleLoad(s);
                          }}
                          className={darkMode ? "bg-dark text-light" : ""}
                        >
                          {s}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Col>

                <Col xs={12} md={5} className="text-md-end">
                  {mode === "edit" && (
                    <Button
                      className="me-2"
                      onClick={() => {
                        handleClear();
                      }}
                    >
                      Clear
                    </Button>
                  )}

                  {mode === "delete" && (
                    <Button variant="danger" onClick={handleDelete} disabled={loading || (!query && !selectedPolicyNo)}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Delete"}
                    </Button>
                  )}
                </Col>
              </Row>

              {errorMsg && <div className="text-danger mt-2">{errorMsg}</div>}
            </Card>
          </motion.div>
        )}

        {(mode === "add" || mode === "edit") && (
          <motion.form key="form" variants={cardVariants} initial="hidden" animate="visible" exit="exit" onSubmit={mode === "add" ? handleAdd : handleUpdate}>
            {/* Client Info */}
            <Card className={`mb-3 p-4 ${darkMode ? "glass-dark" : "glass-light"}`}>
              <h5 className="section-title">Client Information</h5>
              <Row className="g-3">
                <Col md={6}>
                  <MemoFloatingInput label="Client Name" name="client_name" value={(policy as any).client_name ?? ""} setField={setField} darkMode={darkMode} />
                </Col>
                <Col md={6}>
                  <MemoFloatingInput label="Nominee Name" name="nominee_name" value={(policy as any).nominee_name ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="DOB" name="dob" type="date" value={(policy as any).dob ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Phone" name="phone_no" value={(policy as any).phone_no ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Email" name="email" type="email" value={(policy as any).email ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col xs={12}>
                  <MemoFloatingInput label="Address" name="address" type="textarea" rows={2} value={(policy as any).address ?? ""} setField={setField} darkMode={darkMode} />
                </Col>
              </Row>
            </Card>

            {/* Policy Info */}
            <Card className={`mb-3 p-4 ${darkMode ? "glass-dark" : "glass-light"}`}>
              <h5 className="section-title">Policy Information</h5>
              <Row className="g-3">
                <Col md={4}>
                  <MemoFloatingInput label="Policy No" name="policy_no" value={(policy as any).policy_no ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Company Name" name="company_name" value={(policy as any).company_name ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <FloatingLabel label="Business Type" className="w-100">
                    <Form.Select
                      name="business_type"
                      value={(policy as any).business_type ?? ""}
                      onChange={(e) => setField("business_type", e.target.value)}
                      className={darkMode ? "glass-input-dark" : "glass-input"}
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
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Policy Type" name="policy_type" value={(policy as any).policy_type ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <FloatingLabel label="Premium (₹)" className="w-100">
                    <Form.Control
                      type="number"
                      name="premium"
                      value={(policy as any).premium ?? ""}
                      onChange={(e) => setField("premium", e.target.value === "" ? "" : Number(e.target.value))}
                      className={darkMode ? "glass-input-dark" : "glass-input"}
                      min={0}
                    />
                  </FloatingLabel>
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Purchase Date" name="purchase_date" type="date" value={(policy as any).purchase_date ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col md={4}>
                  <MemoFloatingInput label="Renewal Date" name="renewal_date" type="date" value={(policy as any).renewal_date ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col xs={12}>
                  <MemoFloatingInput label="Remarks" name="remarks" type="textarea" rows={2} value={(policy as any).remarks ?? ""} setField={setField} darkMode={darkMode} />
                </Col>

                <Col xs={12} className="text-end">
                  <Button type="submit" className="modern-submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : mode === "add" ? "➕ Add Policy" : "💾 Update Policy"}
                  </Button>
                </Col>
              </Row>
            </Card>
          </motion.form>
        )}

        {mode === "import" && (
          <motion.div key="import" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
            <Card className={`mb-3 p-4 ${darkMode ? "glass-dark" : "glass-light"}`}>
              <Row className="align-items-center">
                <Col md={8}>
                  <h4 className="section-title">
                    <FaFileCsv /> Import Policies (CSV)
                  </h4>
                  <small className="text-muted">Download template → upload CSV → preview → resolve duplicates → import</small>
                </Col>

                <Col md={4} className="text-end d-flex flex-column gap-2">
                  <Button variant="outline-secondary" onClick={handleDownloadTemplate} className="w-100">
                    <FaDownload /> Template
                  </Button>

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
                <Col>
                  <div className="d-flex gap-2">
                    <Button onClick={handlePrepareImport} disabled={csvRows.length === 0 || csvLoading}>
                      {csvLoading ? <Spinner animation="border" size="sm" /> : "Preview & Validate"}
                    </Button>

                    <Button variant="outline-secondary" onClick={() => { window.location.reload(); showToast("Cleared import state", "info"); }}>
                      Clear
                    </Button>

                    {importProgress > 0 && (
                      <div style={{ minWidth: 200 }}>
                        <ProgressBar now={importProgress} label={`${importProgress}%`} />
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <div style={{ maxHeight: 360, overflow: "auto", borderRadius: 12 }}>
                <Table bordered hover size="sm" className={`modern-table ${darkMode ? "table-dark" : ""}`}>
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
                          <tr key={rowIndex} className={darkMode ? "text-light" : "text-dark"}>
                            <td>{rowIndex + 1}</td>
                            <td>{r.policy_no || "—"}</td>
                            <td>{r.client_name}</td>
                            <td>{r.company_name}</td>
                            <td>{r.premium}</td>
                            <td>{r.purchase_date}</td>
                            <td>{r.renewal_date}</td>
                            <td>{err ? <Badge bg="danger">Invalid</Badge> : <Badge bg="success">OK</Badge>}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => {
                                  const updated = { ...r, client_name: prompt("Edit client name", r.client_name) ?? r.client_name };
                                  handleEditCsvRow(rowIndex, updated);
                                }}
                              >
                                Edit
                              </Button>
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

      {/* POPUP */}
      <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>{popupMessage}</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowPopup(false)}>OK</Button>
        </Modal.Footer>
      </Modal>

      {/* DUPLICATE MODAL */}
      <Modal show={duplicateModalOpen} onHide={() => setDuplicateModalOpen(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Duplicates Found</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Found <strong>{duplicateSummary.existing.length}</strong> duplicates (existing policy numbers).</p>

          <div className="d-flex gap-2 mb-3">
            <Button variant={duplicateAction === "insert-only" ? "primary" : "outline-secondary"} onClick={() => setDuplicateAction("insert-only")}>Insert Only</Button>
            <Button variant={duplicateAction === "update-existing" ? "primary" : "outline-secondary"} onClick={() => setDuplicateAction("update-existing")}>Update Existing</Button>
            <Button variant={duplicateAction === "skip-duplicates" ? "primary" : "outline-secondary"} onClick={() => setDuplicateAction("skip-duplicates")}>Skip Duplicates</Button>
          </div>

          <div style={{ maxHeight: 240, overflow: "auto" }}>
            <Table size="sm" bordered className={darkMode ? "table-dark" : ""}>
              <thead>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDuplicateModalOpen(false)}>Cancel</Button>
          <Button onClick={() => { handleDuplicateProceed(); }}>Proceed</Button>
        </Modal.Footer>
      </Modal>

      {/* CONFIRM IMPORT */}
      <Modal show={confirmImportOpen} onHide={() => setConfirmImportOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Import</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Import <strong>{csvRows.length}</strong> rows?</p>
          <div className="small text-muted">Duplicate handling: <strong>{duplicateAction}</strong></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmImportOpen(false)}>Cancel</Button>
          <Button onClick={handleExecuteImport} disabled={csvLoading}>{csvLoading ? <Spinner animation="border" size="sm" /> : "Start Import"}</Button>
        </Modal.Footer>
      </Modal>

      {/* BOTTOM-CENTER TOAST (internal) */}
      <ToastContainer className="p-3" position="bottom-center">
        <Toast bg={toastVariant} onClose={() => setToastShow(false)} show={toastShow} autohide delay={toastDuration}>
          <Toast.Body className="text-white fw-semibold">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* STYLES */}
      <style>{`
        /* Subnav */
        .polipulse-subnav { gap: 18px; }
        .subnav-btn {
          padding: 8px 18px;
          border-radius: 999px;
          border: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
          background: transparent;
          color: inherit;
        }
        .subnav-btn.active {
          background: linear-gradient(135deg,#0b3b75,#007bff);
          color: white;
          box-shadow: 0 8px 20px rgba(13,110,253,0.18);
          transform: translateY(-3px);
        }

        /* Glass cards + inputs */
        .glass-light { background: rgba(255,255,255,0.55); border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); }
        .glass-dark { background: rgba(10,10,10,0.55); border-radius: 14px; border: 1px solid rgba(255,255,255,0.04); }
        .glass-card { border-radius: 14px; padding: 18px; }
        .glass-input { border-radius: 10px !important; background: rgba(255,255,255,0.9) !important; color: inherit; }
        .glass-input-dark { border-radius: 10px !important; background: rgba(0,0,0,0.65) !important; color: inherit; }

        .modern-file-input { padding: 10px 14px; border-radius: 10px; border: 1px dashed rgba(0,0,0,0.08); text-align:center; cursor:pointer; background: rgba(255,255,255,0.03); }
        .modern-file-input input { display:none; }

        .modern-submit { padding: 10px 22px; border-radius: 12px; background: #0d6efd; color: white; border: none; font-weight: 700; }

        .section-title { font-weight: 700; margin-bottom: 12px; }

        .modern-table th, .modern-table td { vertical-align: middle; }

        /* Dark mode theme overrides */
        .dark-mode { color: #eaeaea; }
        .dark-mode .glass-light { background: rgba(255,255,255,0.03); }
        .dark-mode .glass-dark { background: rgba(10,10,10,0.7); }
        .dark-mode .glass-input { background: rgba(255,255,255,0.04) !important; color: #eaeaea !important; }
        .dark-mode .glass-input-dark { background: rgba(0,0,0,0.6) !important; color: #eaeaea !important; }
        .dark-mode .card { color: #eaeaea; }
        .dark-mode .table, .dark-mode .table td, .dark-mode .table th { color: #eaeaea; }
        .dark-mode .btn-primary { background: #0d6efd; border-color:#0d6efd; color:#fff; }
      `}</style>
    </motion.div>
  );
}
