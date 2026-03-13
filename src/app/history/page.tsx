"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Download, Trash2 } from "lucide-react";

const mockHistory = [
  { id: 1, template: "invoice", name: "INV-2026-001", date: "2026-03-13", status: "completed" },
  { id: 2, template: "receipt", name: "RCP-2026-045", date: "2026-03-12", status: "completed" },
  { id: 3, template: "invoice", name: "INV-2026-002", date: "2026-03-11", status: "completed" },
  { id: 4, template: "invoice", name: "INV-2026-003", date: "2026-03-10", status: "failed" },
  { id: 5, template: "receipt", name: "RCP-2026-044", date: "2026-03-09", status: "completed" },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">Your previously generated documents</p>
        </motion.div>

        <div className="space-y-3">
          {mockHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-subtle hover:border-border transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.template === "invoice" ? "bg-primary/10" : "bg-secondary/10"
                }`}>
                  <FileText className={`w-5 h-5 ${item.template === "invoice" ? "text-primary" : "text-secondary"}`} />
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === "completed" 
                    ? "bg-secondary/10 text-secondary" 
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {item.status}
                </span>
                {item.status === "completed" && (
                  <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents generated yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
