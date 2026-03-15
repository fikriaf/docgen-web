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

export default function GeneratePage() {
  const [version, setVersion] = useState<Version>("docx");
  
  // DOCX version state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<{ name: string; value: string }[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  
  // Common state
  const [useWatermark, setUseWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("LUNAS");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle DOCX file selection and scan
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

      const response = await fetch("https://docgen-production-503d.up.railway.app/api/v1/docx/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to scan template");
      }

      const data = await response.json();
      
      if (data.fields && Array.isArray(data.fields)) {
        const fields = data.fields.map((field: string) => ({
          name: field,
          value: "",
        }));
        setDetectedFields(fields);
        const initialData: Record<string, string> = {};
        fields.forEach((f: { name: string }) => {
          initialData[f.name] = "";
        });
        setFormData(initialData);
      }
    } catch (err) {
      setError("Failed to scan template. Using default fields.");
      // Use default fields on error
      setDetectedFields(MASTER_CAESAR_FIELDS.map(f => ({ name: f.name, value: "" })));
      setFormData(Object.fromEntries(MASTER_CAESAR_FIELDS.map(f => [f.name, ""])));
    } finally {
      setScanning(false);
    }
  };

  // Classic version - hardcoded fields
  const [classicFormData, setClassicFormData] = useState<Record<string, string>>(
    Object.fromEntries(MASTER_CAESAR_FIELDS.map(f => [f.name, ""]))
  );

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassicFieldChange = (name: string, value: string) => {
    setClassicFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response: Response;

      if (version === "docx") {
        // DOCX version - needs template file
        if (!templateFile) {
          throw new Error("Please upload a DOCX template");
        }

        const payload = new FormData();
        payload.append("file", templateFile);
        
        const payloadJson: Record<string, string> = {};
        detectedFields.forEach((field) => {
          if (field.name && formData[field.name]) {
            payloadJson[field.name] = formData[field.name];
          }
        });
        payload.append("payload", JSON.stringify(payloadJson));

        const options: Record<string, any> = {
          smartReplace: false,
          filename: filename || undefined,
        };
        
        if (useWatermark) {
          options.watermark = { enabled: true, text: watermarkText };
        }
        
        payload.append("options", JSON.stringify(options));

        response = await fetch("https://docgen-production-503d.up.railway.app/api/v1/docx/generate", {
          method: "POST",
          body: payload,
        });
      } else {
        // Classic version - hardcoded Master Caesar
        const payload = new FormData();
        
        // We need to fetch the Master_Caesar.docx first or the user needs to provide it
        // For now, let's use a different endpoint if available, or ask user to upload
        throw new Error("Classic version requires Master_Caesar.docx. Please use DOCX version or upload the template.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedPdf(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateFile(null);
    setDetectedFields([]);
    setFormData({});
    setClassicFormData(Object.fromEntries(MASTER_CAESAR_FIELDS.map(f => [f.name, ""])));
    setGeneratedPdf(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activeFormData = version === "docx" ? formData : classicFormData;
  const activeFields = version === "docx" ? detectedFields : MASTER_CAESAR_FIELDS;

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Generate Document</h1>
          <p className="text-muted-foreground">Generate PDF from DOCX template</p>
        </motion.div>

        {/* Version Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <label className="block text-sm font-medium mb-3">Version</label>
          <div className="flex gap-3">
            <button
              onClick={() => { setVersion("docx"); resetForm(); }}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                version === "docx"
                  ? "bg-primary text-background"
                  : "bg-surface border border-border-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              DOCX Upload
            </button>
            <button
              onClick={() => { setVersion("classic"); resetForm(); }}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                version === "classic"
                  ? "bg-primary text-background"
                  : "bg-surface border border-border-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              Classic (Hardcoded)
            </button>
          </div>
        </motion.div>

        {/* DOCX Version */}
        {version === "docx" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <label className="block text-sm font-medium mb-3">Upload DOCX Template</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {templateFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{templateFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(templateFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetForm(); }}
                    className="p-2 hover:bg-surface-elevated rounded-lg"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Click to upload DOCX template
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}

        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-surface rounded-xl border border-border-subtle flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Scanning template for fields...</span>
          </motion.div>
        )}

        {/* Fields Display */}
        {activeFields.length > 0 && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">
                  {version === "docx" ? "Detected Fields" : "Invoice Fields"}
                  <span className="text-muted-foreground ml-2">({activeFields.length} fields)</span>
                </label>
              </div>
              
              {/* Fields Grid - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeFields.map((field) => {
                  const fieldName = typeof field === "string" ? field : field.name;
                  const fieldLabel = typeof field === "string" ? field : (field as { label?: string }).label || field.name;
                  
                  return (
                    <div key={fieldName}>
                      <label className="block text-sm font-medium mb-2">
                        {fieldLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${fieldLabel}`}
                        value={activeFormData[fieldName] || ""}
                        onChange={(e) => {
                          if (version === "docx") {
                            handleFieldChange(fieldName, e.target.value);
                          } else {
                            handleClassicFieldChange(fieldName, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="p-6 bg-surface rounded-xl border border-border-subtle">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Options
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Filename</label>
                  <input
                    type="text"
                    placeholder="Output filename (optional)"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWatermark}
                    onChange={(e) => setUseWatermark(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Add Watermark</span>
                </label>

                {useWatermark && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (version === "docx" && !templateFile)}
              className="w-full py-4 bg-primary text-background font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate PDF
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* Generated PDF Preview */}
        {generatedPdf && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-surface rounded-2xl border border-border-subtle">
            <h3 className="font-display font-semibold text-lg mb-4">Document Generated!</h3>
            <iframe src={generatedPdf} className="w-full h-96 rounded-lg" />
            <a
              href={generatedPdf}
              download={`${filename || "document"}.pdf`}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-secondary text-background font-semibold rounded-xl hover:bg-secondary-hover"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
