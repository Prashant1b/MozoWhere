import React, { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/admin.api";
import {
  Users, Search, RefreshCw, Trash2, ShieldCheck, ShieldOff,
  CreditCard, Ban, Package, CheckCircle2, XCircle, Clock,
  IndianRupee, ChevronDown, ChevronUp,
} from "lucide-react";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.data?.users || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter) list = list.filter((u) => u.role === roleFilter);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((u) =>
        (u.firstname || "").toLowerCase().includes(term) ||
        (u.emailid || "").toLowerCase().includes(term) ||
        (u._id || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [users, q, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const codBlocked = users.filter((u) => u.codBlocked).length;
    const totalOrders = users.reduce((s, u) => s + (u.orderStats?.totalOrders || 0), 0);
    return { total, admins, users: total - admins, codBlocked, totalOrders };
  }, [users]);

  const onChangeRole = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: res.data?.user?.role || newRole } : u));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update role");
    } finally { setActionLoading(null); }
  };

  const onToggleCod = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await adminApi.toggleCodBlock(userId);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, codBlocked: res.data?.user?.codBlocked } : u));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to toggle COD");
    } finally { setActionLoading(null); }
  };

  const onDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.firstname}" (${user.emailid})?\nThis cannot be undone.`)) return;
    setActionLoading(user._id);
    try {
      await adminApi.deleteUser(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete user");
    } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Users</h1>
              <p className="text-xs text-slate-500">{users.length} registered users</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, ID..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 sm:w-[240px]" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        {err && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.total} icon={Users} color="bg-violet-50 text-violet-600" />
        <StatCard label="Admins" value={stats.admins} icon={ShieldCheck} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Regular Users" value={stats.users} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="COD Blocked" value={stats.codBlocked} icon={Ban} color="bg-red-50 text-red-600" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={Package} color="bg-emerald-50 text-emerald-600" className="col-span-2 sm:col-span-1" />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Delivered</th>
                <th className="px-4 py-3">Cancelled</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">COD / Online</th>
                <th className="px-4 py-3">COD Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">No users found.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u._id} className="text-sm hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white shrink-0 ${u.role === "admin" ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-slate-400"}`}>
                        {(u.firstname?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{u.firstname} {u.lastname || ""}</div>
                        <div className="text-[11px] text-slate-500 truncate">{u.emailid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => onChangeRole(u._id, e.target.value)} disabled={actionLoading === u._id}
                      className={`h-8 rounded-lg border px-2 text-xs font-bold outline-none transition ${u.role === "admin" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">{u.orderStats?.totalOrders || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={13} /> {u.orderStats?.delivered || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <XCircle size={13} /> {u.orderStats?.cancelled || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <IndianRupee size={12} />{(u.orderStats?.totalSpent || 0).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">{u.orderStats?.codOrders || 0} COD</span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700">{u.orderStats?.onlineOrders || 0} Online</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onToggleCod(u._id)} disabled={actionLoading === u._id}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        u.codBlocked ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}>
                      {u.codBlocked ? <><Ban size={12} /> Blocked</> : <><CreditCard size={12} /> Allowed</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onDelete(u)} disabled={actionLoading === u._id}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet cards */}
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">No users found.</div>
        ) : filtered.map((u) => (
          <MobileUserCard key={u._id} user={u} loading={actionLoading === u._id}
            onChangeRole={onChangeRole} onToggleCod={onToggleCod} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3.5 ${className}`}>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-xl font-black text-slate-900">{value}</div>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function MobileUserCard({ user: u, loading: busy, onChangeRole, onToggleCod, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const os = u.orderStats || {};

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left hover:bg-slate-50 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white shrink-0 ${u.role === "admin" ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-slate-400"}`}>
              {(u.firstname?.[0] || "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-slate-900 truncate">{u.firstname} {u.lastname || ""}</div>
              <div className="text-[11px] text-slate-500 truncate">{u.emailid}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${u.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
              {u.role}
            </span>
            {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            <Package size={10} /> {os.totalOrders || 0} orders
          </span>
          <span className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 size={10} /> {os.delivered || 0}
          </span>
          <span className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
            <XCircle size={10} /> {os.cancelled || 0}
          </span>
          <span className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
            Rs {(os.totalSpent || 0).toLocaleString("en-IN")}
          </span>
          {u.codBlocked && (
            <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
              <Ban size={10} /> COD Blocked
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Order stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Total Orders" value={os.totalOrders || 0} color="text-slate-900" />
            <MiniStat label="Delivered" value={os.delivered || 0} color="text-emerald-600" />
            <MiniStat label="Cancelled" value={os.cancelled || 0} color="text-red-500" />
            <MiniStat label="Pending" value={os.pending || 0} color="text-amber-600" />
            <MiniStat label="COD Orders" value={os.codOrders || 0} color="text-orange-600" />
            <MiniStat label="Online Orders" value={os.onlineOrders || 0} color="text-blue-600" />
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Spent</span>
              <span className="font-bold text-slate-900">Rs {(os.totalSpent || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Joined</span>
              <span className="font-semibold text-slate-700">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "-"}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">User ID</span>
              <span className="font-mono text-[10px] text-slate-500">{u._id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Role change */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">Role</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onChangeRole(u._id, "user")} disabled={busy || u.role === "user"}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${u.role === "user" ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                  <ShieldOff size={12} /> User
                </button>
                <button onClick={() => onChangeRole(u._id, "admin")} disabled={busy || u.role === "admin"}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${u.role === "admin" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50"}`}>
                  <ShieldCheck size={12} /> Admin
                </button>
              </div>
            </div>

            {/* COD toggle */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-700">COD Payment</span>
              <button onClick={() => onToggleCod(u._id)} disabled={busy}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  u.codBlocked ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}>
                {u.codBlocked ? <><Ban size={12} /> Blocked — Click to Allow</> : <><CreditCard size={12} /> Allowed — Click to Block</>}
              </button>
            </div>

            {/* Delete */}
            <button onClick={() => onDelete(u)} disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50">
              <Trash2 size={13} /> Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2 text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}
