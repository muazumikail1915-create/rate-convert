"use client";

import React, { useState } from "react";
import {
  Code,
  X,
  Copy,
  Check,
  Zap,
  Shield,
  Key,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export interface DeveloperPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeveloperPortalModal({ isOpen, onClose }: DeveloperPortalModalProps) {
  const [email, setEmail] = useState<string>("");
  const [appName, setAppName] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "PRO" | "ENTERPRISE">("FREE");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"generate" | "docs" | "limits">("generate");

  if (!isOpen) return null;

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: email,
          name: appName || "My Fintech App",
          plan: selectedPlan,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.key) {
        setGeneratedKey(data.data.key);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSnippet(type);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  const activeKeyStr = generatedKey || "rc_live_your_api_key_here";

  const curlSnippet = `curl -X GET "http://localhost:3000/api/v1/rates/latest?base=USD&target=NGN" \\
  -H "X-API-Key: ${activeKeyStr}"`;

  const jsSnippet = `const res = await fetch("http://localhost:3000/api/v1/rates/convert?amount=1000&from=USD&to=NGN", {
  headers: {
    "X-API-Key": "${activeKeyStr}"
  }
});
const { data } = await res.json();
console.log("Net NGN Received:", data.netAmount);`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 id="developer-modal-title" className="text-lg font-black text-white">
                Developer API Portal &amp; Keys
              </h2>
              <p className="text-xs text-slate-400">
                Institutional FX Feeds, Rate Limiting &amp; Webhooks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "generate"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Generate API Key
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "docs"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Code Snippets &amp; Quickstart
          </button>
          <button
            onClick={() => setActiveTab("limits")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "limits"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Rate Limit Tiers
          </button>
        </div>

        {/* Tab 1: Generate Key */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "generate" && (
            <div>
              {generatedKey ? (
                <div className="space-y-4 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>API Key Generated &amp; Activated!</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">
                      Your Secret API Key (Keep safe, attached to {email}):
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white break-all">
                      <span className="flex-1 select-all">{generatedKey}</span>
                      <button
                        onClick={() => copyToClipboard(generatedKey, "key")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Include this key via header: <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">X-API-Key: {generatedKey.slice(0, 12)}...</code></span>
                  </div>

                  <button
                    onClick={() => setActiveTab("docs")}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Quickstart Code Snippets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGenerateKey} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Developer Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@fintech.ng"
                      required
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="e.g. Cross-Border Remittance Engine"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  {/* Plan Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Select Quota Tier
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { id: "FREE", name: "Free Tier", quota: "60 req/min", price: "Free" },
                          { id: "PRO", name: "Pro Tier", quota: "1,000 req/min", price: "$49/mo" },
                          { id: "ENTERPRISE", name: "Enterprise", quota: "10,000 req/min", price: "Custom" },
                        ] as const
                      ).map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedPlan(tier.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            selectedPlan === tier.id
                              ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30"
                              : "bg-slate-950 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="text-xs font-black text-white">{tier.name}</div>
                          <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{tier.quota}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{tier.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? "Provisioning API Key..." : "Generate Developer Key"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Code Snippets */}
          {activeTab === "docs" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>cURL Request (Spot Rates)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(curlSnippet, "curl")}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedSnippet === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === "curl" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 text-xs font-mono overflow-x-auto">
                  {curlSnippet}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    <span>Node.js / JavaScript Conversion</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(jsSnippet, "js")}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedSnippet === "js" ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === "js" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-blue-300 text-xs font-mono overflow-x-auto">
                  {jsSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Rate Limits */}
          {activeTab === "limits" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  HTTP Rate Limit Headers Attached to Every Response
                </h4>
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-emerald-400">X-RateLimit-Limit:</span>
                    <span>Max quota allowed per 60-second window</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-emerald-400">X-RateLimit-Remaining:</span>
                    <span>Remaining requests in current window</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-emerald-400">X-RateLimit-Reset:</span>
                    <span>Seconds until sliding window resets</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900">
                    <span className="text-amber-400">HTTP 429:</span>
                    <span>Returned if request threshold is exceeded</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
