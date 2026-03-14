import React, { useState } from "react";
import { adminUsersApi } from "../../api/adminUsers.api";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminCreateAdminPage() {
  const [firstname, setFirstname] = useState("");
  const [emailid, setEmailid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(""); setMsg(""); setLoading(true);
    try {
      const res = await adminUsersApi.createAdmin({ firstname, emailid, password });
      setMsg(res.data?.message || (typeof res.data === "string" ? res.data : "Admin created"));
      setFirstname(""); setEmailid(""); setPassword("");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create admin");
    } finally { setLoading(false); }
  };

  const inputCls = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50";

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Create Admin</h1>
            <p className="text-xs text-slate-500">Add a new admin account</p>
          </div>
        </div>

        {err && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" /> {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" /> {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name</label>
            <input value={firstname} onChange={(e) => setFirstname(e.target.value)} className={inputCls} placeholder="Admin name" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
            <input value={emailid} onChange={(e) => setEmailid(e.target.value)} type="email" className={inputCls} placeholder="admin@example.com" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={inputCls} placeholder="Min 6 characters" required />
          </div>
          <button disabled={loading}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-md shadow-indigo-200">
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
