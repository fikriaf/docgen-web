"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Receipt, Download, Upload, Loader2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

const templates = [
  { id: "invoice", name: "Invoice", icon: FileText, description: "Professional invoice document" },
  { id: "receipt", name: "Receipt", icon: Receipt, description: "Payment receipt document" },
];

const invoiceFields = [
  { name: "invoice_number", label: "Invoice Number", required: true, type: "text" },
  { name: "issue_date", label: "Issue Date", required: true, type: "date" },
  { name: "due_date", label: "Due Date", required: true, type: "date" },
  { name: "client_name", label: "Client Name", required: true, type: "text" },
  { name: "client_address", label: "Client Address", required: false, type: "text" },
  { name: "company_name", label: "Company Name", required: false, type: "text" },
  { name: "company_address", label: "Company Address", required: false, type: "text" },
  { name: "company_email", label: "Company Email", required: false, type: "email" },
  { name: "subtotal", label: "Subtotal", required: true, type: "number" },
  { name: "tax", label: "Tax", required: false, type: "number" },
  { name: "discount", label: "Discount", required: false, type: "number" },
  { name: "total", label: "Total", required: true, type: "number" },
  { name: "notes", label: "Notes", required: false, type: "textarea" },
];

const receiptFields = [
  { name: "receipt_number", label: "Receipt Number", required: true, type: "text" },
  { name: "receipt_date", label: "Receipt Date", required: true, type: "date" },
  { name: "payer_name", label: "Payer Name", required: true, type: "text" },
  { name: "payer_address", label: "Payer Address", required: false, type: "text" },
  { name: "company_name", label: "Company Name", required: false, type: "text" },
  { name: "payment_method", label: "Payment Method", required: false, type: "text" },
  { name: "subtotal", label: "Subtotal", required: true, type: "number" },
  { name: "total", label: "Total", required: true, type: "number" },
  { name: "notes", label: "Notes", required: false, type: "textarea" },
];

interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
}

export default function GeneratePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("invoice");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, unit_price: 0 }]);
  const [useLLM, setUseLLM] = useState(false);
  const [watermark, setWatermark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);

  const fields = selectedTemplate === "invoice" ? invoiceFields : receiptFields;

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, key: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        templateId: selectedTemplate,
        data: {
          ...formData,
          items,
          subtotal: calculateTotal(),
          total: calculateTotal() + (parseFloat(formData.tax || "0") || 0) - (parseFloat(formData.discount || "0") || 0),
        },
        options: {
          useLLM,
          outputFormat: "pdf",
          watermark: { enabled: watermark },
        },
      };

      const response = await fetch("https://docgen-production-503d.up.railway.app/api/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Generate Document</h1>
          <p className="text-muted-foreground">Create professional PDF documents from template</p>
        </motion.div>

        {/* Template Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <label className="block text-sm font-medium mb-3">Select Template</label>
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={clsx(
                    "p-4 rounded-xl border transition-all text-left",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/10"
                      : "border-border-subtle bg-surface hover:border-border"
                  )}
                >
                  <Icon className={clsx("w-6 h-6 mb-2", selectedTemplate === template.id ? "text-primary" : "text-muted-foreground")} />
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.description}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.filter((f) => f.type !== "textarea").map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2">
                  {field.label}
                  {field.required && <span className="text-primary ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          {fields.find((f) => f.name === "notes") && (
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Line Items */}
          <div>
            <label className="block text-sm font-medium mb-3">Line Items</label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="flex-1 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-3 bg-surface border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="px-3 py-3 text-muted-foreground hover:text-red-500">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-3 text-sm text-primary hover:text-primary-hover">
              + Add Item
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLLM}
                onChange={(e) => setUseLLM(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">Use AI Field Mapping</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">Add Watermark</span>
            </label>
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
            disabled={loading}
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

        {/* Generated PDF Preview */}
        {generatedPdf && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-surface rounded-2xl border border-border-subtle">
            <h3 className="font-display font-semibold text-lg mb-4">Document Generated!</h3>
            <iframe src={generatedPdf} className="w-full h-96 rounded-lg" />
            <a
              href={generatedPdf}
              download={`${selectedTemplate}-${formData.invoice_number || formData.receipt_number || "document"}.pdf`}
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
