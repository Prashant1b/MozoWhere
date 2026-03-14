import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function Signup() {
  const ctx = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const signup = ctx?.signup;

  const [firstname, setFirstname] = useState("");
  const [emailid, setEmailid] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const after = location.state?.from || "/";

  const close = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!signup) throw new Error("AuthProvider missing. Wrap app with AuthProvider.");
      await signup(firstname, emailid, password);
      navigate(after, { replace: true });
    } catch (e2) {
      console.log("SIGNUP ERROR:", e2?.response?.data || e2);
      setErr(e2?.response?.data?.message || e2?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,#dcfce7_0%,transparent_30%),radial-gradient(circle_at_85%_20%,#fde68a_0%,transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <section className="relative hidden bg-slate-900 p-10 text-slate-100 md:block">
          <button
            onClick={close}
            className="absolute right-5 top-5 rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            aria-label="Close"
          >
            Close
          </button>

          <div className="max-w-sm space-y-6">
            <p className="inline-flex rounded-full border border-emerald-300/50 bg-emerald-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200">
              MOZOWHERE
            </p>
            <h1 className="text-4xl font-extrabold leading-tight">Create your account and start shopping smarter</h1>
            <p className="text-sm leading-6 text-slate-300">
              Join Mozowhere to save favourites, track every order in one place, and unlock a faster personalized checkout experience.
            </p>

            <div className="space-y-3 pt-2 text-sm text-slate-200">
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">Single account for cart, wishlist, and order history</div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">Custom product progress saved with your profile</div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">Secure session-based authentication</div>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <p className="text-xs font-bold tracking-wide text-slate-500">MOZOWHERE</p>
            <button
              onClick={close}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900">Create account</h2>
            <p className="mt-1 text-sm text-slate-600">Fill in your details to get started.</p>
          </div>

          {err && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Prashant"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                value={emailid}
                onChange={(e) => setEmailid(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <button
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" state={{ from: after }} className="font-semibold text-slate-900 underline underline-offset-2">
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
