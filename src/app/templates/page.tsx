"use client";

import { motion } from "framer-motion";
import { FileText, Upload, Scan, FileOutput } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Templates</h1>
          <p className="text-muted-foreground">How to use DOCX templates with DocGen</p>
        </motion.div>

        <div className="space-y-6">
          {/* Step 1: Prepare DOCX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-surface rounded-2xl border border-border-subtle"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-2">1. Prepare DOCX Template</h3>
                <p className="text-muted-foreground mb-4">
                  Create a DOCX file with variables using curly braces. For example:
                </p>
                <div className="p-4 bg-surface-elevated rounded-lg font-mono text-sm">
                  <p>Invoice No: {"{{invoice_no}}"}</p>
                  <p>Client: {"{{client_name}}"}</p>
                  <p>Total: {"{{total_amount}}"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Upload & Scan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-surface rounded-2xl border border-border-subtle"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Scan className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-2">2. Upload & Scan</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your DOCX template. DocGen will automatically detect all fields/variables.
                </p>
                <p className="text-sm text-muted-foreground">
                  Alternatively, enable Smart Replace to use AI for field detection.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Fill & Generate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-surface rounded-2xl border border-border-subtle"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <FileOutput className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-2">3. Fill Data & Generate</h3>
                <p className="text-muted-foreground mb-4">
                  Fill in the detected fields with your data, configure options like watermark, and generate your PDF.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Example Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-surface rounded-2xl border border-border-subtle"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl mb-4">Common Field Examples</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "invoice_no",
                    "invoice_date",
                    "due_date",
                    "client_name",
                    "client_address",
                    "client_number",
                    "item_name",
                    "item_quantity",
                    "item_price_per_unit",
                    "item_amount",
                    "payment_bank",
                    "summary_subtotal",
                    "summary_vat",
                    "total_due",
                  ].map((field) => (
                    <div
                      key={field}
                      className="px-3 py-2 bg-surface-elevated rounded-lg text-sm font-mono"
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
