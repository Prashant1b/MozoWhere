import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Folder, Shirt,
  Layers, BadgePercent, ClipboardList, Sparkles, X, Users,
} from "lucide-react";

const links = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/orders", icon: Package, label: "Orders" },
  { to: "/admin/products", icon: ShoppingBag, label: "Products" },
  { to: "/admin/categories", icon: Folder, label: "Categories" },
  { to: "/admin/customize-templates", icon: Shirt, label: "Templates" },
  { to: "/admin/variants", icon: Layers, label: "Variants" },
  { to: "/admin/coupons", icon: BadgePercent, label: "Coupons" },
  { to: "/admin/bulk-orders", icon: ClipboardList, label: "Bulk Orders" },
  { to: "/admin/services", icon: Sparkles, label: "Services" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-300 ease-in-out",
        "md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* Brand header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            Mozo<span className="text-indigo-600">Admin</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            <l.icon className="h-[18px] w-[18px] shrink-0" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2.5">
          <p className="text-[11px] font-bold text-indigo-600">MozoWhere Admin</p>
          <p className="text-[10px] text-slate-500">Manage your store</p>
        </div>
      </div>
    </aside>
  );
}
