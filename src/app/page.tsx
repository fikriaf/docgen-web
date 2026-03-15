"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, Download, Loader2, AlertCircle, Upload, X, Settings } from "lucide-react";
import { clsx } from "clsx";

type Version = "docx" | "classic";

const MASTER_CAESAR_FIELDS = [
  { name: "invoice_no", label: "Invoice No" },
  { name: "invoice_date", label: "Invoice Date" },
  { name: "due_date", label: "Due Date" },
  { name: "client_name", label: "Client Name" },
  { name: "client_address", label: "Client Address" },
  { name: "client_number", label: "Client Number" },
  { name: "item_name", label: "Item Name" },
  { name: "item_quantity", label: "Item Quantity" },
  { name: "item_price_per_unit", label: "Price Per Unit" },
  { name: "item_amount", label: "Item Amount" },
  { name: "payment_bank", label: "Payment Bank" },
  { name: "summary_subtotal", label: "Subtotal" },
  { name: "payment_name_bank", label: "Payment Name" },
  { name: "summary_vat", label: "VAT" },
  { name: "number_bank", label: "Bank Number" },
  { name: "total_due", label: "Total Due" },
];

const HISTORY_KEY = "docgen_history";

const API_BASE = "https://docgen-production-503d.up.railway.app/api/v1";

const saveToHistory = (name: string, template: string, status: "completed" | "failed", filename?: string) => {
  try {
    const existing = localStorage.getItem(HISTORY_KEY);
    const history = existing ? JSON.parse(existing) : [];
    const newItem = {
      id: Date.now().toString(),
      template,
      name,
      date: new Date().toISOString(),
      status,
      filename
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([newItem, ...history].slice(0, 50)));
  } catch (e) {
    console.error("Failed to save to history:", e);
  }
};

export default function GeneratePage() {
  const [version, setVersion] = useState<Version>("classic");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<{ name: string; value: string }[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [useWatermark, setUseWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("LUNAS");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [corsNote, setCorsNote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [classicFormData, setClassicFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MASTER_CAESAR_FIELDS.forEach(f => { initial[f.name] = ""; });
    return initial;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      setError("Please upload a DOCX file");
      return;
    }
    setTemplateFile(file);
    setError(null);
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE}/docx/scan`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to scan template");
      const data = await response.json();
      if (data.fields && Array.isArray(data.fields)) {
        const fields = data.fields.map((field: string) => ({ name: field, value: "" }));
        setDetectedFields(fields);
        const initialData: Record<string, string> = {};
        fields.forEach((f: { name: string }) => { initialData[f.name] = ""; });
        setFormData(initialData);
      }
    } catch (err) {
      // CORS or network error
      setCorsNote(true);
      setDetectedFields(MASTER_CAESAR_FIELDS.map(f => ({ name: f.name, value: "" })));
      setFormData(Object.fromEntries(MASTER_CAESAR_FIELDS.map(f => [f.name, ""])));
    } finally {
      setScanning(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }));
  const handleClassicFieldChange = (name: string, value: string) => setClassicFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCorsNote(false);

    try {
      let payloadJson: Record<string, string> = {};
      let fileToUse: File | null = null;

      if (version === "docx") {
        if (!templateFile) throw new Error("Please upload a DOCX template");
        fileToUse = templateFile;
        detectedFields.forEach(field => { if (field.name && formData[field.name]) payloadJson[field.name] = formData[field.name]; });
      } else {
        if (!templateFile) throw new Error("Please upload Master_Caesar.docx template");
        fileToUse = templateFile;
        MASTER_CAESAR_FIELDS.forEach(field => { if (classicFormData[field.name]) payloadJson[field.name] = classicFormData[field.name]; });
      }

      const payload = new FormData();
      payload.append("file", fileToUse);
      payload.append("payload", JSON.stringify(payloadJson));

      const options: Record<string, any> = { smartReplace: false, filename: filename || undefined };
      if (useWatermark) options.watermark = { enabled: true, text: watermarkText };
      payload.append("options", JSON.stringify(options));

      const response = await fetch(`${API_BASE}/docx/generate`, { method: "POST", body: payload });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedPdf(url);

      const docName = filename || payloadJson["invoice_no"] || payloadJson["client_name"] || "Document";
      saveToHistory(docName, "invoice", "completed", `${docName}.pdf`);
    } catch (err) {
      // Check if it's a CORS error
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setCorsNote(true);
        setError("CORS error: Please run this app locally or use a CORS proxy");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
      const docName = filename || "Document";
      saveToHistory(docName, "invoice", "failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateFile(null);
    setDetectedFields([]);
    setFormData({});
    setGeneratedPdf(null);
    setError(null);
    setCorsNote(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchVersion = (v: Version) => {
    setVersion(v);
    resetForm();
  };

  const activeFormData = version === "docx" ? formData : classicFormData;
  const activeFields = version === "docx" ? detectedFields : MASTER_CAESAR_FIELDS;

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="noise" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-medium mb-3">
            Generate <span className="gradient-text">Document</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            {version === "docx" 
              ? "Upload a DOCX template, fill in the fields, and generate professional PDF documents instantly."
              : "Use pre-defined Master Caesar invoice template. Upload template, fill 16 fields, generate PDF."}
          </p>
        </motion.div>

        {/* CORS Warning */}
        {corsNote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-500 mb-1">CORS Error Detected</p>
                <p className="text-sm text-muted-foreground">
                  The API is blocking requests from this domain. To fix this, either:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                  <li>Run the app locally: <code className="bg-surface px-1 rounded">npm run dev</code></li>
                  <li>Or add CORS headers to the backend API</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <label className="block text-sm text-muted-foreground mb-3 uppercase tracking-wider font-mono text-xs">Select Version</label>
          <div className="flex gap-2">
            {[
              { id: "classic", label: "Classic (16 Fields)" },
              { id: "docx", label: "DOCX Upload" },
            ].map((v) => (
              <button key={v.id} onClick={() => switchVersion(v.id as Version)}
                className={clsx("px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  version === v.id ? "bg-primary text-background shadow-lg shadow-primary/20" : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-border-default")}>
                {v.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="block text-sm text-muted-foreground mb-3 uppercase tracking-wider font-mono text-xs">
                {version === "docx" ? "Your Template" : "Master_Caesar Template"}
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                {templateFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileText className="w-10 h-10 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-lg">{ templateFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(templateFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); resetForm(); }} className="p-2 hover:bg-surface-elevated rounded-lg"><X className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-muted-foreground">
                      {version === "classic" ? "Upload Master_Caesar.docx template" : "Drop your DOCX template here or browse"}
                    </p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFileSelect} className="hidden" />
            </motion.div>

            {scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-surface rounded-xl border border-border flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Scanning template for fields...</span>
              </motion.div>
            )}

            {activeFields.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-muted-foreground uppercase tracking-wider font-mono text-xs">
                    {version === "docx" ? "Detected Fields" : "Invoice Fields"}
                    <span className="text-muted-foreground ml-2">({activeFields.length} fields)</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeFields.map((field) => {
                    const fieldName = typeof field === "string" ? field : field.name;
                    const fieldLabel = typeof field === "string" ? field : (field as { label?: string }).label || field.name;
                    return (
                      <div key={fieldName}>
                        <label className="block text-sm text-muted-foreground mb-2">{fieldLabel}</label>
                        <input type="text" placeholder={`Enter ${fieldLabel}`} value={activeFormData[fieldName] || ""}
                          onChange={(e) => version === "docx" ? handleFieldChange(fieldName, e.target.value) : handleClassicFieldChange(fieldName, e.target.value)}
                          className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20" />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="sticky top-24 space-y-6">
              <div className="p-6 bg-surface rounded-xl border border-border">
                <h3 className="font-display text-xl font-medium mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" /> Options
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Filename</label>
                    <input type="text" placeholder="Output filename" value={filename} onChange={(e) => setFilename(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={useWatermark} onChange={(e) => setUseWatermark(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                    <span className="text-sm">Add Watermark</span>
                  </label>
                  {useWatermark && (
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Watermark Text</label>
                      <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg" />
                    </div>
                  )}
                </div>
              </div>

              {error && !corsNote && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />{error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading || !templateFile}
                className="w-full py-4 bg-primary text-background font-medium rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Download className="w-5 h-5" />Generate PDF</>}
              </button>

              {generatedPdf && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-surface rounded-xl border border-border">
                  <h3 className="font-display text-xl font-medium mb-4">Document Generated</h3>
                  <iframe src={generatedPdf} className="w-full h-80 rounded-lg mb-4" />
                  <a href={generatedPdf} download={`${filename || "document"}.pdf`}
                    className="w-full py-3 bg-secondary text-background font-medium rounded-xl hover:bg-secondary-hover transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
