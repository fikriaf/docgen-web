"use client";

import { motion } from "framer-motion";
import { Settings, Link, Key, Bell, Palette, Info, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("stepfun/step-3.5-flash:free");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="noise" />
      
      <div className="max-w-2xl mx-auto px-6 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-3">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted-foreground">Configure your DocGen preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* API Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-surface border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Link className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-medium">API Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">API URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  OpenRouter API Key
                  <span className="ml-2 text-xs text-muted-foreground">(for Smart Replace)</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                >
                  <option value="stepfun/step-3.5-flash:free">Step-3.5 Flash (Free)</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-surface border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-medium">Notifications</h2>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span>Enable notifications</span>
                <p className="text-sm text-muted-foreground">Receive alerts when document generation completes</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
              />
            </label>
          </motion.div>

          {/* Info Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Settings Preview</p>
                <p className="text-muted-foreground">
                  This is a UI/UX demonstration. Settings are not persisted. In a production environment, these would connect to your backend API and user preferences would be saved.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-primary text-background font-medium rounded-xl hover:bg-primary-hover transition-all"
            >
              {saved ? "Settings Saved!" : "Save Settings"}
            </button>
          </motion.div>

          {/* Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://github.com/fikriaf/DocGen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Backend Repository
              </a>
              <a 
                href="https://github.com/fikriaf/docgen-web" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Frontend Repository
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
