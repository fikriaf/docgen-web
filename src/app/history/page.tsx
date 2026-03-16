"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Download, Trash2, FileX, Archive, Lock, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import { verifyPassword, isAuthenticated, setAuthenticated } from "@/lib/auth";
import { getPdf, deletePdf } from "@/lib/pdfStorage";

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const auth = isAuthenticated();
    setIsUnlocked(auth);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
    setLoading(false);
  }, [isUnlocked]);

  const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setHistory(items);
  };

  const deleteItem = async (id: string) => {
    await deletePdf(id);
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const clearAll = () => {
    if (confirm("Clear all history?")) {
      saveHistory([]);
    }
  };

  const downloadFile = async (item: HistoryItem) => {
    try {
      const blob = await getPdf(item.id);
      if (!blob) {
        alert("PDF file not found. The document may have been cleared from storage.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.filename || `${item.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF");
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }

    setVerifying(true);
    setError("");

    const valid = await verifyPassword(password);

    if (valid) {
      setAuthenticated(true);
      setIsUnlocked(true);
      setPassword("");
    } else {
      setError("Incorrect password");
    }

    setVerifying(false);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative">
        <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="noise" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md mx-auto px-6"
        >
          <div className="p-8 bg-surface rounded-2xl border border-border shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-medium mb-2">
                <span className="gradient-text">History Protected</span>
              </h2>
              <p className="text-muted-foreground">
                Enter password to view document history
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 text-center text-lg"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-4 bg-primary text-background font-medium rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {verifying ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Unlock History
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

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
