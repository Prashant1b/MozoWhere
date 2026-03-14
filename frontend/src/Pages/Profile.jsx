import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { userApi } from "../api/user.api";

export default function Profile() {
  const { user, booting, logout, refreshProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!booting && !user) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
    }
  }, [booting, user, navigate]);

  const onUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!oldPassword || !newPassword) {
      setErr("Please fill both old and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErr("New password should be at least 6 characters.");
      return;
    }

    setLoadingPass(true);
    try {
      const res = await userApi.updatePassword({
        oldPassword,
        password: oldPassword,
        newPassword,
      });

      setMsg(res.data?.message || "Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update password.");
    } finally {
      setLoadingPass(false);
    }
  };

  const onDeleteAccount = async () => {
    setMsg("");
    setErr("");

    const ok = window.confirm(
      "Are you sure? Your account will be permanently deleted."
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await userApi.deleteAccount();
      setMsg(res.data?.message || "Account deleted.");
      // after delete, force logout on UI side
      await logout?.();
      navigate("/", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  const onRefresh = async () => {
    setMsg("");
    setErr("");
    try {
      await refreshProfile?.();
      setMsg("Profile refreshed.");
    } catch {
      setErr("Failed to refresh profile.");
    }
  };

  if (booting) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-gray-200 p-6">Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const name = user?.firstname || user?.name || "User";
  const email = user?.emailid || user?.email || "-";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={async () => {
                await logout?.();
                navigate("/", { replace: true });
              }}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>

        {(msg || err) && (
          <div
            className={[
              "mt-5 rounded-2xl border p-4 text-sm",
              err
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700",
            ].join(" ")}
          >
            {err || msg}
          </div>
        )}

        {/* Account Card */}
        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#FFD23D] text-black grid place-items-center font-extrabold">
              {name?.[0]?.toUpperCase?.()}
            </div>

            <div className="flex-1">
              <div className="text-lg font-bold text-gray-900">{name}</div>
              <div className="text-sm text-gray-600">{email}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/orders"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  View Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Cart
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Update Password */}
        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-extrabold text-gray-900">
            Update Password
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Change your password to keep your account secure.
          </p>

          <form onSubmit={onUpdatePassword} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Old Password
              </label>
              <input
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                New Password
              </label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="min 6 characters"
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-gray-400"
              />
            </div>

            <button
              disabled={loadingPass}
              className="h-11 w-full rounded-xl bg-black text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loadingPass ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-2xl border border-red-200 p-6">
          <h2 className="text-lg font-extrabold text-red-700">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-700/80">
            Deleting your account is permanent and cannot be undone.
          </p>

          <button
            disabled={deleting}
            onClick={onDeleteAccount}
            className="mt-4 h-11 w-full rounded-xl bg-red-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}