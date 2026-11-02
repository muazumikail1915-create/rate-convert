"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Settings,
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
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

export default function AdminWorkspacePage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [marketStatus, setMarketStatus] = useState("OPEN");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCurrentUser(data.user);
      });

    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: UserItem) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`User ${user.email} status updated to ${nextStatus}.`);
        loadUsers();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px]">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  Rate<span className="text-emerald-400">Convert</span>
                </span>
              </Link>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ADMIN CONSOLE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>FX Market View</span>
              </Link>

              {currentUser?.role === "SUPER_ADMIN" && (
                <Link
                  href="/super-admin"
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300 hover:bg-indigo-500/30 font-semibold transition"
                >
                  Super Admin Console →
                </Link>
              )}

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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>NFEM Session Window</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xl font-bold text-white">{marketStatus}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMarketStatus("OPEN")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  marketStatus === "OPEN"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setMarketStatus("CLOSED")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  marketStatus === "CLOSED"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Registered Accounts</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{users.length}</div>
            <p className="text-[11px] text-slate-500">Total verified &amp; privileged users</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Security RBAC Policy</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400">Strict Dual-Token JWT</div>
            <p className="text-[11px] text-slate-500">MFA Enforced on Staff Roles</p>
          </div>
        </div>

        {/* User Moderation Table */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Platform User Moderation</h2>
              <p className="text-xs text-slate-400">Manage user access states and accounts</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading user directory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Assigned Role</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Registered</th>
                    <th className="pb-3 font-semibold text-right">Moderation Action</th>
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
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {u.role !== "SUPER_ADMIN" ? (
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                              u.status === "ACTIVE"
                                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Suspend Access" : "Reactivate"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

