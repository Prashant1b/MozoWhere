import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Package,
  Settings,
} from "lucide-react";

export default function DesktopHeader({
  menuLinks,
  mobileShopIn,
  setMobileShopIn,
  user,
  booting,
  onLogout,
  cartCount = 0,
  wishlistCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const displayName =
    user?.firstname || user?.name || user?.emailid || "User";

  return (
    <div className="hidden md:block relative z-50 bg-white">
      {/* ================= TOP BAR ================= */}
      <div className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-9 items-center justify-between text-[12px] text-gray-600">
            <div className="flex items-center gap-5 whitespace-nowrap">
              <Link to="/offers" className="hover:text-black">
                Offers
              </Link>
              <Link to="/fanbook" className="hover:text-black">
                Fanbook
              </Link>
              <Link to="/stores" className="hover:text-black">
                Find a store near me
              </Link>
            </div>

            <div className="flex items-center gap-5 whitespace-nowrap">
              <Link to="/support" className="hover:text-black">
                Contact Us
              </Link>
              <Link to="/orders/track" className="hover:text-black">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-6">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <div className="text-2xl font-black tracking-tight text-black">
                MOZOWHERE{" "}
                <span className="align-super text-[10px] font-bold">®</span>
              </div>
            </Link>

            {/* Primary Nav */}
            <nav className="flex items-center gap-6 text-[14px] font-semibold tracking-wide text-gray-900 whitespace-nowrap">
              <Link to="/shop?cat=men" className="hover:text-black">
                MEN
              </Link>
              <Link to="/shop?cat=women" className="hover:text-black">
                WOMEN
              </Link>
              <Link to="/custom-tshirts" className="hover:text-black">
                CUSTOMIZE
              </Link>
            </nav>

            <div className="flex-1" />

            {/* Search */}
            <div className="w-full max-w-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by products"
                  className="h-10 w-full rounded-md bg-gray-100 pl-10 pr-3 text-[14px] text-gray-900 placeholder:text-gray-500 outline-none ring-1 ring-transparent focus:bg-white focus:ring-gray-200"
                />
              </div>
            </div>

            {/* ================= RIGHT SIDE ================= */}
            <div className="flex items-center gap-3 text-gray-900 whitespace-nowrap">
              <div className="h-6 w-px bg-gray-200" />

              {/* Account */}
              <div className="relative" ref={boxRef}>
                <button
                  className="p-2 hover:bg-gray-100 rounded-md inline-flex items-center gap-2"
                  onClick={() => setOpen((v) => !v)}
                >
                  <User className="h-5 w-5" />
                  <span className="text-[13px] font-semibold hidden lg:block">
                    {booting ? "..." : user ? displayName : "Account"}
                  </span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-[12px] text-gray-500">
                            Signed in as
                          </div>
                          <div className="text-[14px] font-semibold text-gray-900 truncate">
                            {displayName}
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-3 text-[14px] hover:bg-gray-50"
                          onClick={() => setOpen(false)}
                        >
                          <Settings className="h-4 w-4" /> Profile
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-3 text-[14px] hover:bg-gray-50"
                          onClick={() => setOpen(false)}
                        >
                          <Package className="h-4 w-4" /> My Orders
                        </Link>

                        <button
                          className="w-full text-left flex items-center gap-2 px-4 py-3 text-[14px] hover:bg-gray-50"
                          onClick={() => {
                            setOpen(false);
                            onLogout?.();
                          }}
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-[14px] font-semibold text-gray-900">
                            Welcome
                          </div>
                          <div className="text-[12px] text-gray-500">
                            Login to continue
                          </div>
                        </div>

                        <Link
                          to="/login"
                          className="block px-4 py-3 text-[14px] hover:bg-gray-50"
                          onClick={() => setOpen(false)}
                        >
                          Login
                        </Link>

                        <Link
                          to="/signup"
                          className="block px-4 py-3 text-[14px] hover:bg-gray-50"
                          onClick={() => setOpen(false)}
                        >
                          Signup
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 hover:bg-gray-100 rounded-md"
              >
                <Heart className="h-5 w-5" />
                {!!wishlistCount && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[11px] grid place-items-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-md"
              >
                <ShoppingBag className="h-5 w-5" />
                {!!cartCount && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[11px] grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORY ROW ================= */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4 p-1">
            <div className="grid grid-cols-2 shrink-0">
              <button
                onClick={() => setMobileShopIn("Men")}
                className={`rounded-full py-3 px-8 text-[15px] font-bold transition ${
                  mobileShopIn === "Men"
                    ? "bg-[#FFD23D] text-gray-900 shadow"
                    : "bg-transparent text-gray-700"
                }`}
              >
                MEN
              </button>

              <button
                onClick={() => setMobileShopIn("Women")}
                className={`rounded-full py-3 px-8 text-[15px] font-bold transition ${
                  mobileShopIn === "Women"
                    ? "bg-[#FFD23D] text-gray-900 shadow"
                    : "bg-transparent text-gray-700"
                }`}
              >
                WOMEN
              </button>
            </div>

            <nav className="flex items-center gap-10 text-[16px] font-semibold text-gray-900 min-w-max">
              {menuLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}