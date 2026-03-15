"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Download, Trash2, FileX, Archive } from "lucide-react";
import { useState, useEffect } from "react";

type HistoryItem = {
  id: string;
  template: string;
  name: string;
  date: string;
  status: "completed" | "failed";
  filename?: string;
};

const STORAGE_KEY = "docgen_history";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage
  const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setHistory(items);
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const clearAll = () => {
    if (confirm("Clear all history?")) {
      saveHistory([]);
    }
  };

  const downloadFile = (item: HistoryItem) => {
    // In real app, would fetch from storage or API
    alert(`Download: ${item.filename || item.name}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="noise" />
      
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-medium mb-2">
                <span className="gradient-text">History</span>
              </h1>
              <p className="text-muted-foreground">Your previously generated documents</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-surface border border-border mx-auto mb-6 flex items-center justify-center">
              <Archive className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-medium mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first document to see it here
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-medium rounded-xl hover:bg-primary-hover transition-colors"
            >
              Generate Document
            </a>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-border-default transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    item.template === "invoice" ? "bg-primary/10" : "bg-secondary/10"
                  }`}>
                    <FileText className={`w-5 h-5 ${item.template === "invoice" ? "text-primary" : "text-secondary"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === "completed" 
                      ? "bg-secondary/10 text-secondary" 
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {item.status}
                  </span>
                  {item.status === "completed" ? (
                    <button 
                      onClick={() => downloadFile(item)}
                      className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ) : (
                    <FileX className="w-4 h-4 text-red-400" />
                  )}
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
