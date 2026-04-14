const fs = require('fs');
const path = require('path');

const filePath = path.join('g:', 'KARAN', 'Project', 'polipulse', 'src', 'components', 'PolicyManagerUI.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove react-bootstrap
content = content.replace(/import\s*\{[^}]*\}\s*from\s+["']react-bootstrap["'];/g, "");

// 2. Add Tailwind Modal & Toast Container helpers above MemoFloatingInput
const helpers = `
const TailwindModal = ({ show, onHide, title, children, footer, darkMode }: any) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={\`rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden \${darkMode ? 'bg-zinc-900 border border-white/10' : 'bg-white'}\`}>
        <div className={\`px-6 py-4 border-b flex justify-between items-center \${darkMode ? 'border-zinc-800' : 'border-slate-100'}\`}>
          <h3 className={\`text-lg font-bold \${darkMode ? 'text-white' : 'text-slate-900'}\`}>{title}</h3>
          <button onClick={onHide} className="text-slate-400 hover:text-rose-500 transition-colors text-xl font-bold">
            ✕
          </button>
        </div>
        <div className={\`px-6 py-4 overflow-y-auto flex-1 \${darkMode ? 'text-zinc-300' : 'text-slate-700'}\`}>
          {children}
        </div>
        {footer && (
          <div className={\`px-6 py-4 border-t flex justify-end gap-3 \${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50'}\`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const TailwindToastContainer = ({ show, onClose, message }: any) => {
  if (!show) return null;
  return (
    <div className="fixed top-4 right-4 z-[70] animate-fade-in-down">
      <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
        <span>✓</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">✕</button>
      </div>
    </div>
  );
};
`;

content = content.replace("const MemoFloatingInput", helpers + "\nconst MemoFloatingInput");

// 3. Update MemoFloatingInput
const memoOld = /const MemoFloatingInput = React\.memo\(function MemoFloatingInput\(\{.*?\}\) \{.*?return \(.*?\);\n\}\);/s;
const memoNew = `const MemoFloatingInput = React.memo(function MemoFloatingInput({
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
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const raw = (e.target as HTMLInputElement).value;
    const v = type === "number" ? (raw === "" ? "" : Number(raw)) : raw;
    setField(name, v);
  };

  const baseInputClass = \`w-full px-4 py-3 rounded-xl border outline-none transition-colors \${darkMode ? "bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"}\`;

  return (
    <div className="w-full flex flex-col gap-2">
      <label className={\`text-sm font-semibold tracking-wide uppercase \${darkMode ? "text-zinc-400" : "text-slate-500"}\`}>{label}</label>
      {type === "textarea" ? (
        <textarea
          rows={rows || 2}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={baseInputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={baseInputClass}
        />
      )}
    </div>
  );
});`;

content = content.replace(memoOld, memoNew);

// 4. Transform Form/Card/Row inside PolicyManagerUI body
// I will do basic string replacements for the most common elements.
// This is not perfect but covers the large chunks of bootstrap.
content = content.replace(/<Row className="g-3">/g, '<div className="flex flex-wrap -mx-2 mb-4">');
content = content.replace(/<\/Row>/g, '</div>');
content = content.replace(/<Row>/g, '<div className="flex flex-wrap -mx-2">');

content = content.replace(/<Col md=\{4\}>/g, '<div className="w-full md:w-1/3 px-2 mb-4">');
content = content.replace(/<Col md=\{3\}>/g, '<div className="w-full md:w-1/4 px-2 mb-4">');
content = content.replace(/<Col md=\{6\}>/g, '<div className="w-full md:w-1/2 px-2 mb-4">');
content = content.replace(/<Col md=\{12\}>/g, '<div className="w-full px-2 mb-4">');
content = content.replace(/<Col sm=\{12\} md=\{6\}>/g, '<div className="w-full md:w-1/2 px-2 mb-4">');
content = content.replace(/<Col>/g, '<div className="w-full px-2 mb-4">');
content = content.replace(/<\/Col>/g, '</div>');

content = content.replace(/<div className="d-flex gap-3 mt-4">/g, '<div className="flex gap-3 mt-6">');

// For buttons
content = content.replace(/<Button variant="primary"/g, '<button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors"');
content = content.replace(/<Button variant="success"/g, '<button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"');
content = content.replace(/<Button variant="danger"/g, '<button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"');
content = content.replace(/<Button variant="outline-primary"/g, "<button className={`px-6 py-3 border rounded-xl shadow-sm transition-colors ${darkMode ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500/10' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}>");
content = content.replace(/<Button/g, '<button className="px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl shadow-md transition-colors"');
content = content.replace(/<\/Button>/g, '</button>');
content = content.replace(/type="submit"/g, 'type="submit"'); // stays same

// Forms
content = content.replace(/<Form onSubmit=\{/g, '<form onSubmit=\{');
content = content.replace(/<\/Form>/g, '</form>');

content = content.replace(/<div className="d-flex justify-content-between align-items-center mb-3">/g, '<div className="flex justify-between items-center mb-6">');
content = content.replace(/<div className="d-flex gap-2">/g, '<div className="flex gap-2">');
content = content.replace(/<div className="mt-3 text-center text-muted">/g, '<div className="mt-4 text-center opacity-70">');

// Special FloatingLabel for select
const fpSelectOld = /<FloatingLabel\s+controlId="floatingSelect"\s+label="Business Type"\s*>\s*<Form\.Select\s+name="business_type"\s+value=\{policy\.business_type \?\? ""\}\s+onChange=\{handleDirectChange\}\s+className=\{`\${darkMode \? "bg-dark text-light border-secondary" : ""}`\}\s*>\s*<option value="">Select\.\.\.<\/option>\s*<option value="SME">SME<\/option>\s*<option value="Corporate">Corporate<\/option>\s*<\/Form\.Select>\s*<\/FloatingLabel>/g;

const fpSelectNew = `<div className="w-full flex flex-col gap-2">
  <label className={\`text-sm font-semibold tracking-wide uppercase \${darkMode ? "text-zinc-400" : "text-slate-500"}\`}>Business Type</label>
  <select
    name="business_type"
    value={policy.business_type ?? ""}
    onChange={handleDirectChange}
    className={\`w-full px-4 py-3 rounded-xl border outline-none transition-colors \${darkMode ? "bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"}\`}
  >
    <option value="">Select...</option>
    <option value="SME">SME</option>
    <option value="Corporate">Corporate</option>
  </select>
</div>`;

content = content.replace(fpSelectOld, fpSelectNew);

// Modal and Toasts replacements
content = content.replace(/<ToastContainer position="top-end" className="p-3"[^>]*>/g, '<div className="toast-container hidden">');
content = content.replace(/<Toast show=\{showPopup\}[^>]*>.*?<\/ToastContainer>/s, '{/* Replaced by TailwindToastContainer */}');

content = content.replace(/<Modal show=\{([a-zA-Z]+)\} onHide=\{([^\}]+)\}[^>]*>/g, '<TailwindModal show={$1} onHide={$2} darkMode={darkMode} title="Dialog">');
content = content.replace(/<Modal\.Header closeButton>/g, '<div className="hidden">');
content = content.replace(/<Modal\.Title>([^<]+)<\/Modal\.Title>/g, '<div className="modal-title-$1"></div>');
content = content.replace(/<\/Modal\.Header>/g, '</div>');
content = content.replace(/<Modal\.Body>/g, '<div>');
content = content.replace(/<\/Modal\.Body>/g, '</div>');
content = content.replace(/<Modal\.Footer>/g, '<div>');
content = content.replace(/<\/Modal\.Footer>/g, '</div>');
content = content.replace(/<\/Modal>/g, '</TailwindModal>');

// Fix titles inside modals manually since my regex above is hacky
content = content.replace(/title="Dialog">\s*<div className="hidden">\s*<div className="modal-title-(.*?)"><\/div>\s*<\/div>/g, 'title="$1">');


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
