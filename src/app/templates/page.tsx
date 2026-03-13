"use client";

import { motion } from "framer-motion";
import { FileText, Receipt, CheckCircle, Circle } from "lucide-react";

const templates = [
  {
    id: "invoice",
    name: "Invoice",
    icon: FileText,
    description: "Professional invoice document for billing clients",
    fields: [
      { name: "invoice_number", required: true },
      { name: "issue_date", required: true },
      { name: "due_date", required: true },
      { name: "client_name", required: true },
      { name: "client_address", required: false },
      { name: "company_name", required: false },
      { name: "company_address", required: false },
      { name: "company_email", required: false },
      { name: "items", required: true },
      { name: "subtotal", required: true },
      { name: "tax", required: false },
      { name: "discount", required: false },
      { name: "total", required: true },
      { name: "notes", required: false },
    ],
  },
  {
    id: "receipt",
    name: "Receipt",
    icon: Receipt,
    description: "Payment receipt for completed transactions",
    fields: [
      { name: "receipt_number", required: true },
      { name: "receipt_date", required: true },
      { name: "payer_name", required: true },
      { name: "payer_address", required: false },
      { name: "company_name", required: false },
      { name: "payment_method", required: false },
      { name: "items", required: true },
      { name: "subtotal", required: true },
      { name: "total", required: true },
      { name: "notes", required: false },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Templates</h1>
          <p className="text-muted-foreground">Available document templates and their field schemas</p>
        </motion.div>

        <div className="space-y-6">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-surface rounded-2xl border border-border-subtle"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl">{template.name}</h3>
                    <p className="text-muted-foreground">{template.description}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">Fields</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {template.fields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center gap-2 px-3 py-2 bg-surface-elevated rounded-lg text-sm"
                      >
                        {field.required ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={field.required ? "" : "text-muted-foreground"}>
                          {field.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
