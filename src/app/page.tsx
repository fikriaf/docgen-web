"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, Download, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { clsx } from "clsx";

interface DetectedField {
  name: string;
  value: string;
}

export default function GeneratePage() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [useWatermark, setUseWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("LUNAS");
  const [smartReplace, setSmartReplace] = useState(false);
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const fields: DetectedField[] = data.fields.map((field: string) => ({
          name: field,
          value: "",
        }));
        setDetectedFields(fields);
        // Initialize formData with empty values
        const initialData: Record<string, string> = {};
        fields.forEach((f) => {
          initialData[f.name] = "";
        });
        setFormData(initialData);
      }
    } catch (err) {
      // If scan fails, allow manual field entry
      setDetectedFields([
        { name: "invoice_no", value: "" },
        { name: "client_name", value: "" },
        { name: "total_amount", value: "" },
      ]);
    } finally {
      setScanning(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomField = () => {
    setDetectedFields([...detectedFields, { name: "", value: "" }]);
  };

  const removeField = (index: number) => {
    const newFields = detectedFields.filter((_, i) => i !== index);
    setDetectedFields(newFields);
  };

  const updateFieldName = (index: number, name: string) => {
    const newFields = [...detectedFields];
    newFields[index].name = name;
    setDetectedFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) {
      setError("Please upload a DOCX template");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("file", templateFile);
      
      // Build payload from formData
      const payloadJson: Record<string, string> = {};
      detectedFields.forEach((field) => {
        if (field.name) {
          payloadJson[field.name] = formData[field.name] || "";
        }
      });
      payload.append("payload", JSON.stringify(payloadJson));

      // Build options
      const options: Record<string, any> = {
        smartReplace: smartReplace,
        filename: filename || undefined,
      };
      
      if (useWatermark) {
        options.watermark = {
          enabled: true,
          text: watermarkText,
        };
      }
      
      payload.append("options", JSON.stringify(options));

      const response = await fetch("https://docgen-production-503d.up.railway.app/api/v1/docx/generate", {
        method: "POST",
        body: payload,
      });

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
    setGeneratedPdf(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Generate Document</h1>
          <p className="text-muted-foreground">Upload DOCX template and generate PDF</p>
        </motion.div>

        {/* Template Upload */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
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

        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 bg-surface rounded-xl border border-border-subtle flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Scanning template for fields...</span>
          </motion.div>
        )}

        {/* Detected Fields */}
        {detectedFields.length > 0 && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Detected Fields</label>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  + Add Field
                </button>
              </div>
              <div className="space-y-3">
                {detectedFields.map((field, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateFieldName(index, e.target.value)}
                      className="w-1/3 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="flex-1 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    {detectedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="px-3 py-3 text-muted-foreground hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="p-6 bg-surface rounded-xl border border-border-subtle">
              <h3 className="font-semibold mb-4">Options</h3>
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

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smartReplace}
                    onChange={(e) => setSmartReplace(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Smart Replace (AI field detection)</span>
                </label>
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
              disabled={loading || detectedFields.length === 0}
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
