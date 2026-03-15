"use client";

import { motion } from "framer-motion";
import { FileText, Upload, Scan, FileOutput, Copy, Check } from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    icon: Upload,
    title: "Prepare DOCX Template",
    description: "Create a DOCX file with variables using curly braces syntax",
    color: "bg-primary/10 text-primary",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground">Use double curly braces for variables:</p>
        <div className="p-4 bg-background border border-border rounded-lg font-mono text-sm space-y-2">
          <p><span className="text-primary">{"{{invoice_no}}"}</span> → Invoice Number</p>
          <p><span className="text-primary">{"{{client_name}}"}</span> → Client Name</p>
          <p><span className="text-primary">{"{{total_amount}}"}</span> → Total Amount</p>
        </div>
      </div>
    )
  },
  {
    icon: Scan,
    title: "Upload & Scan",
    description: "Upload your DOCX template for automatic field detection",
    color: "bg-secondary/10 text-secondary",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground">DocGen will automatically detect all variables in your template.</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">Smart Replace</span>
          <span className="text-muted-foreground">for AI-powered field detection</span>
        </div>
      </div>
    )
  },
  {
    icon: FileOutput,
    title: "Fill & Generate",
    description: "Enter your data and generate professional PDF documents",
    color: "bg-accent/10 text-accent",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground">Configure options:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Custom filename</li>
          <li>• Watermark (LUNAS, DRAFT, CONFIDENTIAL)</li>
          <li>• Smart field mapping</li>
        </ul>
      </div>
    )
  }
];

const EXAMPLE_FIELDS = [
  "invoice_no", "invoice_date", "due_date", "client_name", "client_address",
  "client_number", "item_name", "item_quantity", "item_price_per_unit", "item_amount",
  "payment_bank", "summary_subtotal", "payment_name_bank", "summary_vat", "number_bank", "total_due"
];

export default function TemplatesPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="noise" />
      
      <div className="max-w-5xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-3">
            How It <span className="gradient-text">Works</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Three simple steps to generate professional PDF documents from DOCX templates
          </p>
        </motion.div>

        {/* Steps - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-mono text-sm font-medium">
                  {index + 1}
                </div>
                <div className="p-6 bg-surface border border-border rounded-xl h-full">
                  <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                  {step.content}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Example Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-surface border border-border rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-medium mb-1">Available Fields</h3>
              <p className="text-muted-foreground text-sm">Master Caesar template field variables</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono">
              {EXAMPLE_FIELDS.length} fields
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {EXAMPLE_FIELDS.map((field) => (
              <button
                key={field}
                onClick={() => copyToClipboard(`{{${field}}}`)}
                className="flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono hover:border-primary hover:text-primary transition-colors group"
              >
                <span className="truncate">{field}</span>
                {copied === `{{${field}}}` ? (
                  <Check className="w-4 h-4 text-secondary shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Pro Tip:</span> Copy any field variable above and paste directly into your DOCX template. 
            Use <span className="font-mono">{"{{field_name}}"}</span> format for best results.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
