import React, { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { Menu, Bell, User } from "lucide-react";

export default function AdminTopbar({ onMenuClick }) {
  const { user } = useContext(AuthContext);
  const name = user?.firstname || user?.emailid || "Admin";
  const initial = (name[0] || "A").toUpperCase();

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold text-slate-800 sm:text-base">Admin Console</h1>
        </div>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-2">
          <button className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 py-1.5 pl-1.5 pr-3">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white">
              {initial}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block max-w-[120px] truncate">
              {name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
