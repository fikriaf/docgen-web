"use client";

import { motion } from "framer-motion";
import { Settings, Link, Key, Bell, Palette } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("https://docgen-production-503d.up.railway.app");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("stepfun/step-3.5-flash:free");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your DocGen preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* API Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-surface rounded-2xl border border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <Link className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">API Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-xl text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">OpenRouter API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated border border-border-subtle rounded-xl text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="stepfun/step-3.5-flash:free">Step-3.5 Flash (Free)</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-surface rounded-2xl border border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Notifications</h2>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Enable notifications for document generation</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
            </label>
          </motion.div>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button className="w-full py-4 bg-primary text-background font-semibold rounded-xl hover:bg-primary-hover transition-colors">
              Save Settings
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
