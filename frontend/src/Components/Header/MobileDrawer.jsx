import React from "react";
import { X, User, Truck, Wallet, Heart, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function MobileDrawer({ open, onClose, user, booting, onLogout }) {
  const navigate = useNavigate();
  const name = user?.firstname || user?.name || user?.emailid || "User";
  const first = name?.[0]?.toUpperCase?.() || "U";

  const go = (to) => {
    onClose?.();
    navigate(to);
  };

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[86%] max-w-[360px] bg-white shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FFD23D] flex items-center justify-center font-bold text-black">
              {booting ? "…" : first}
            </div>
            <div className="text-[18px] font-semibold text-gray-900">
              {booting ? "Loading..." : user ? `Hey ${name}` : "Welcome"}
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-md" aria-label="Close">
            <X className="h-6 w-6 text-gray-800" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-6 overflow-y-auto h-[calc(100%-76px)]">
          {/* AUTH */}
          {!booting && !user && (
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl px-4 py-3 font-semibold bg-gray-100"
                onClick={() => go("/login")}
              >
                Login
              </button>
              <button
                className="flex-1 rounded-xl px-4 py-3 font-semibold bg-black text-white"
                onClick={() => go("/signup")}
              >
                Signup
              </button>
            </div>
          )}

          <hr className="my-4 border-gray-200" />

          <div className="text-[12px] tracking-wide text-gray-500 font-semibold">MY PROFILE</div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <ProfileCard icon={<User className="h-6 w-6" />} label="My Account" onClick={() => go("/profile")} />
            <ProfileCard icon={<Truck className="h-6 w-6" />} label="My Orders" onClick={() => go("/orders")} />
            <ProfileCard icon={<Wallet className="h-6 w-6" />} label="Wallet" onClick={() => go("/wallet")} />
          </div>

          <div className="mt-3">
            <div className="w-[104px]">
              <ProfileCard icon={<Heart className="h-6 w-6" />} label="Wishlist" onClick={() => go("/wishlist")} />
            </div>
          </div>

          {user && (
            <>
              <hr className="my-4 border-gray-200" />
              <button
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"
                onClick={() => {
                  onClose?.();
                  onLogout?.();
                }}
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  <LogOut className="h-6 w-6" />
                </div>
                <div className="text-[15px] text-gray-900">Logout</div>
              </button>
            </>
          )}

          <hr className="my-4 border-gray-200" />

          <div className="text-[12px] tracking-wide text-gray-500 font-semibold">CONTACT US</div>
          <div className="mt-2 space-y-1">
            <Link to="/support" onClick={onClose} className="block rounded-xl px-3 py-3 text-[15px] text-gray-900 hover:bg-gray-50">
              Help & Support
            </Link>
            <Link to="/feedback" onClick={onClose} className="block rounded-xl px-3 py-3 text-[15px] text-gray-900 hover:bg-gray-50">
              Feedback & Suggestions
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function ProfileCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-gray-200 bg-white p-3 text-left hover:shadow-sm transition"
    >
      <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100">
        {icon}
      </div>
      <div className="mt-2 text-[13px] font-medium text-gray-900 leading-snug">{label}</div>
    </button>
  );
}