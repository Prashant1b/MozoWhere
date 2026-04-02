import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { userApi } from "../api/user.api";
import {
  User, Mail, Calendar, Shield, Package, Heart, ShoppingCart,
  Truck, CheckCircle2, Clock, XCircle, ChevronRight, LogOut,
  Pencil, Save, X, Eye, EyeOff, AlertTriangle, RefreshCw,
  IndianRupee,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xl font-extrabold text-gray-900">{value}</div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200";
  if (s === "shipped") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "processing") return "bg-purple-50 text-purple-700 border-purple-200";
  if (s === "confirmed") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function Profile() {
  const { user, booting, logout, refreshProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstname: "", lastname: "", age: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Messages
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!booting && !user) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
    }
  }, [booting, user, navigate]);

  // Load stats
  useEffect(() => {
    if (!user) return;
    (async () => {
      setStatsLoading(true);
      try {
        const res = await userApi.profileStats();
        setStats(res.data?.stats || null);
        setRecentOrders(res.data?.recentOrders || []);
      } catch {
        // silently fail - stats are optional
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [user]);

  // Init edit form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        age: user.age ? String(user.age) : "",
      });
    }
  }, [user]);

  const clearMessages = () => { setMsg(""); setErr(""); };

  const onSaveProfile = async () => {
    clearMessages();
    if (!profileForm.firstname.trim() || profileForm.firstname.trim().length < 3) {
      setErr("First name must be at least 3 characters");
      return;
    }
    setProfileSaving(true);
    try {
      const data = {
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
      };
      if (profileForm.age) data.age = Number(profileForm.age);
      await userApi.updateProfile(data);
      await refreshProfile?.();
      setEditing(false);
      setMsg("Profile updated successfully");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const onUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!oldPassword || !newPassword) {
      setErr("Please fill both old and new password");
      return;
    }
    if (newPassword.length < 6) {
      setErr("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    setLoadingPass(true);
    try {
      const res = await userApi.updatePassword({
        oldPassword,
        password: oldPassword,
        newPassword,
      });
      setMsg(res.data?.message || "Password updated. Please login again.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update password");
    } finally {
      setLoadingPass(false);
    }
  };

  const onDeleteAccount = async () => {
    clearMessages();
    if (deleteText !== "DELETE") {
      setErr("Please type DELETE to confirm");
      return;
    }
    setDeleting(true);
    try {
      await userApi.deleteAccount();
      setMsg("Account deleted.");
      await logout?.();
      navigate("/", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (booting) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const name = [user.firstname, user.lastname].filter(Boolean).join(" ") || "User";
  const email = user.emailid || user.email || "-";
  const initials = (user.firstname?.[0] || "U").toUpperCase() + (user.lastname?.[0] || "").toUpperCase();
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "-";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10 space-y-6">

        {/* Messages */}
        {(msg || err) && (
          <div
            className={[
              "flex items-center gap-2 rounded-2xl border p-4 text-sm font-medium",
              err
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {err ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {err || msg}
            <button onClick={clearMessages} className="ml-auto text-current opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {/* Banner */}
          <div className="h-28 sm:h-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2240%22%20height=%2240%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d=%22M0%200h40v40H0z%22%20fill=%22none%22/%3E%3Ccircle%20cx=%2220%22%20cy=%2220%22%20r=%221%22%20fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-50" />
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                onClick={async () => {
                  clearMessages();
                  try { await refreshProfile?.(); setMsg("Profile refreshed"); } catch { setErr("Failed to refresh"); }
                }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={async () => { await logout?.(); navigate("/", { replace: true }); }}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-white/20 px-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          {/* Avatar + Info */}
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white grid place-items-center text-2xl sm:text-3xl font-extrabold border-4 border-white shadow-lg">
                {initials}
              </div>

              <div className="flex-1 min-w-0 sm:pb-1">
                {editing ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400">First Name</label>
                      <input
                        value={profileForm.firstname}
                        onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
                        className="block h-9 w-36 rounded-lg border border-gray-300 px-2 text-sm font-semibold outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400">Last Name</label>
                      <input
                        value={profileForm.lastname}
                        onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                        placeholder="Optional"
                        className="block h-9 w-36 rounded-lg border border-gray-300 px-2 text-sm font-semibold outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-gray-400">Age</label>
                      <input
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                        placeholder="--"
                        className="block h-9 w-16 rounded-lg border border-gray-300 px-2 text-sm font-semibold outline-none focus:border-indigo-400"
                      />
                    </div>
                    <button onClick={onSaveProfile} disabled={profileSaving}
                      className="flex h-9 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
                      <Save size={14} /> {profileSaving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditing(false); setProfileForm({ firstname: user.firstname || "", lastname: user.lastname || "", age: user.age ? String(user.age) : "" }); }}
                      className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{name}</h1>
                      <button onClick={() => setEditing(true)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition"
                        title="Edit profile">
                        <Pencil size={13} />
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Mail size={13} /> {email}</span>
                      {user.age && <span className="flex items-center gap-1"><Calendar size={13} /> {user.age} years</span>}
                      <span className="flex items-center gap-1"><Shield size={13} className={user.role === "admin" ? "text-indigo-500" : ""} /> {user.role === "admin" ? "Admin" : "Member"}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> Since {memberSince}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/orders"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition group">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition">
              <Package size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-gray-900">My Orders</div>
              <div className="text-xs text-gray-500">View & track orders</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition" />
          </Link>

          <Link to="/wishlist"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:border-rose-300 hover:shadow-sm transition group">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition">
              <Heart size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-gray-900">Wishlist</div>
              <div className="text-xs text-gray-500">Saved items</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-rose-400 transition" />
          </Link>

          <Link to="/cart"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition group">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <ShoppingCart size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-gray-900">Cart</div>
              <div className="text-xs text-gray-500">Continue shopping</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-400 transition" />
          </Link>
        </div>

        {/* Order Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Package} label="Total Orders" value={stats.totalOrders} color="indigo" />
            <StatCard icon={IndianRupee} label="Total Spent" value={`${stats.totalSpent.toLocaleString("en-IN")}`} color="slate" />
            <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} color="emerald" />
            <StatCard icon={Truck} label="Shipped" value={stats.shipped} color="blue" />
            <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
            <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} color="rose" />
          </div>
        ) : null}

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-extrabold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((o) => {
                const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
                return (
                  <Link key={o._id} to="/orders"
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-500">
                      <Package size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 font-mono">#{o._id?.slice(-8)}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {date} &middot; {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">Rs {o.totalAmount}</div>
                      {o.shippingCharge > 0 && (
                        <div className="text-[10px] text-gray-400">incl. Rs {o.shippingCharge} shipping</div>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Security Section */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => { setShowPasswordSection(!showPasswordSection); clearMessages(); }}
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Shield size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Password & Security</div>
                <div className="text-xs text-gray-500">Change your password</div>
              </div>
            </div>
            <ChevronRight size={16} className={`text-gray-300 transition-transform ${showPasswordSection ? "rotate-90" : ""}`} />
          </button>

          {showPasswordSection && (
            <div className="border-t border-gray-100 px-5 py-5">
              <form onSubmit={onUpdatePassword} className="max-w-md space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Current Password</label>
                  <div className="relative mt-1">
                    <input
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      type={showOldPass ? "text" : "password"}
                      placeholder="Enter current password"
                      className="h-11 w-full rounded-xl border border-gray-200 px-3 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">New Password</label>
                  <div className="relative mt-1">
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showNewPass ? "text" : "password"}
                      placeholder="Min 6 characters"
                      className="h-11 w-full rounded-xl border border-gray-200 px-3 pr-10 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Confirm New Password</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Re-enter new password"
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                  />
                  {confirmPassword && newPassword && confirmPassword !== newPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <button
                  disabled={loadingPass}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  <Shield size={16} />
                  {loadingPass ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-white overflow-hidden">
          <button
            onClick={() => { setShowDeleteConfirm(!showDeleteConfirm); setDeleteText(""); clearMessages(); }}
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-red-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-red-700">Danger Zone</div>
                <div className="text-xs text-red-500">Permanently delete your account</div>
              </div>
            </div>
            <ChevronRight size={16} className={`text-red-300 transition-transform ${showDeleteConfirm ? "rotate-90" : ""}`} />
          </button>

          {showDeleteConfirm && (
            <div className="border-t border-red-100 px-5 py-5">
              <div className="max-w-md">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">This action cannot be undone.</p>
                  <p className="mt-1 text-xs">All your data including orders, designs, wishlist, and cart will be permanently deleted.</p>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-gray-600">
                    Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
                  </label>
                  <input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Type DELETE"
                    className="mt-1 h-11 w-full rounded-xl border border-red-200 px-3 text-sm font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50"
                  />
                </div>

                <button
                  disabled={deleting || deleteText !== "DELETE"}
                  onClick={onDeleteAccount}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
                >
                  <AlertTriangle size={16} />
                  {deleting ? "Deleting..." : "Delete My Account"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
