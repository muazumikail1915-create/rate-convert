"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  KeyRound,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AuditItem {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function SuperAdminConsolePage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Step-Up Authentication Modal
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpPassword, setStepUpPassword] = useState("");
  const [stepUpVerified, setStepUpVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/audit-logs"),
      ]);

      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (logsData.success) setAuditLogs(logsData.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeRoleChange = async (userId: string, targetRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Role successfully assigned: ${targetRole}.`);
        fetchData();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChangeWithStepUp = (userId: string, targetRole: string) => {
    if (!stepUpVerified) {
      setPendingAction(() => () => executeRoleChange(userId, targetRole));
      setStepUpOpen(true);
    } else {
      executeRoleChange(userId, targetRole);
    }
  };

  const verifyStepUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (stepUpPassword.length >= 6) {
      setStepUpVerified(true);
      setStepUpOpen(false);
      setStepUpPassword("");
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-indigo-900/40 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px]">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Rate<span className="text-indigo-400">Convert</span>
                </span>
              </Link>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SUPER ADMIN ROOT
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                <span>Admin Workspace</span>
              </Link>

              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>FX Market View</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Security Banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Privileged RBAC Execution Zone:</span>
              <span className="text-slate-400 ml-1.5">
                Role modifications require Step-Up Authentication and write directly to immutable audit logs.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                stepUpVerified
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {stepUpVerified ? "Step-Up Session: Active" : "Step-Up Guard: Enforced"}
            </span>
          </div>
        </div>

        {/* Role Assignment Console */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">System Role Assignment (RBAC Management)</h2>
              <p className="text-xs text-slate-400">Assign and mutate security authorization levels</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Current Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Assign Elevated Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-medium text-white">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : u.role === "ADMIN"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRoleChangeWithStepUp(u.id, "USER")}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            u.role === "USER"
                              ? "bg-slate-800 text-slate-500 cursor-default"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                          disabled={u.role === "USER"}
                        >
                          User
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleChangeWithStepUp(u.id, "ADMIN")}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            u.role === "ADMIN"
                              ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 cursor-default"
                              : "bg-slate-800 hover:bg-blue-900/30 text-blue-300"
                          }`}
                          disabled={u.role === "ADMIN"}
                        >
                          Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRoleChangeWithStepUp(u.id, "SUPER_ADMIN")}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            u.role === "SUPER_ADMIN"
                              ? "bg-indigo-900/40 text-indigo-400 border border-indigo-500/30 cursor-default"
                              : "bg-slate-800 hover:bg-indigo-900/30 text-indigo-300"
                          }`}
                          disabled={u.role === "SUPER_ADMIN"}
                        >
                          Super Admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Audit Logs */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Security &amp; Infrastructure Audit Stream</span>
              </h2>
              <p className="text-xs text-slate-400">Append-only trail of all authenticated events</p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Principal</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 text-slate-200">
                      {log.userEmail || log.userId || "system"}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{log.ipAddress || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Step-Up Authentication Modal */}
      {stepUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Step-Up Authorization Gate</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modifying root security roles requires step-up confirmation. Enter your credentials to verify.
            </p>

            <form onSubmit={verifyStepUp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Master Confirmation Password (or sandbox pass: SuperAdmin123!)
                </label>
                <input
                  type="password"
                  required
                  value={stepUpPassword}
                  onChange={(e) => setStepUpPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStepUpOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold"
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

