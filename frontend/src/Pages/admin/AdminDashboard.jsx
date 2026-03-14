import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { adminApi } from "../../api/admin.api";
import { productApi } from "../../api/product.api";
import { categoryApi } from "../../api/category.api";
import {
  Package, ShoppingBag, Folder, ClipboardList, Shirt,
  BadgePercent, Layers, ArrowRight, TrendingUp, Clock,
  CheckCircle2, Truck, AlertCircle, Sparkles, Users,
} from "lucide-react";

const quickLinks = [
  { to: "/admin/orders", icon: Package, label: "Orders", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
  { to: "/admin/products", icon: ShoppingBag, label: "Products", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
  { to: "/admin/categories", icon: Folder, label: "Categories", color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-600" },
  { to: "/admin/customize-templates", icon: Shirt, label: "Templates", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600" },
  { to: "/admin/variants", icon: Layers, label: "Variants", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-600" },
  { to: "/admin/coupons", icon: BadgePercent, label: "Coupons", color: "from-pink-500 to-pink-600", bg: "bg-pink-50", text: "text-pink-600" },
  { to: "/admin/bulk-orders", icon: ClipboardList, label: "Bulk Orders", color: "from-orange-500 to-orange-600", bg: "bg-orange-50", text: "text-orange-600" },
  { to: "/admin/services", icon: Sparkles, label: "Services", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", text: "text-cyan-600" },
  { to: "/admin/users", icon: Users, label: "Users", color: "from-violet-500 to-violet-600", bg: "bg-violet-50", text: "text-violet-600" },
];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ orders: 0, products: 0, categories: 0, bulk: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, categoriesRes, bulkRes] = await Promise.allSettled([
          adminApi.listOrders(),
          productApi.list({ limit: 1 }),
          categoryApi.list(),
          adminApi.listBulkOrders(),
        ]);

        const orders = ordersRes.status === "fulfilled" ? ordersRes.value.data?.orders || [] : [];
        const products = productsRes.status === "fulfilled" ? productsRes.value.data?.products || [] : [];
        const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value.data?.categories || [] : [];
        const bulk = bulkRes.status === "fulfilled" ? bulkRes.value.data?.bulkOrders || [] : [];

        // Count orders by status
        const counts = {};
        orders.forEach((o) => {
          const s = o.orderStatus || "pending";
          counts[s] = (counts[s] || 0) + 1;
        });
        setOrderCounts(counts);

        setStats({
          orders: orders.length,
          products: productsRes.status === "fulfilled" ? (productsRes.value.data?.total || products.length) : 0,
          categories: categories.length,
          bulk: bulk.length,
        });

        // Recent 5 orders
        setRecentOrders(orders.slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statCards = [
    { label: "Total Orders", value: stats.orders, icon: Package, color: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-600" },
    { label: "Products", value: stats.products, icon: ShoppingBag, color: "from-emerald-500 to-teal-600", light: "bg-emerald-50 text-emerald-600" },
    { label: "Categories", value: stats.categories, icon: Folder, color: "from-amber-500 to-orange-600", light: "bg-amber-50 text-amber-600" },
    { label: "Bulk Requests", value: stats.bulk, icon: ClipboardList, color: "from-purple-500 to-pink-600", light: "bg-purple-50 text-purple-600" },
  ];

  const statusIcon = (s) => {
    if (s === "delivered") return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (s === "shipped") return <Truck size={14} className="text-amber-500" />;
    if (s === "cancelled") return <AlertCircle size={14} className="text-red-500" />;
    return <Clock size={14} className="text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-5 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-black">
          {greeting()}, {user?.firstname || "Admin"}
        </h1>
        <p className="mt-1 text-sm text-indigo-100">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.light}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {loading ? "–" : s.value}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order status breakdown + Recent orders */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Order status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Order Status</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <div key={s} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {statusIcon(s)}
                    <span className="text-xs font-semibold text-slate-600 capitalize">{s}</span>
                  </div>
                  <div className="mt-1 text-lg font-black text-slate-900">{orderCounts[s] || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-semibold text-slate-700 truncate">
                      #{o._id?.slice(-8)}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {o.user?.emailid || o.user?.email || "-"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-800">Rs {Number(o.totalAmount || 0)}</div>
                    <StatusBadge status={o.orderStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links grid */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {quickLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${l.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                <l.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-slate-100 text-slate-600",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-amber-100 text-amber-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${colors[status] || colors.pending}`}>
      {(status || "pending").toUpperCase()}
    </span>
  );
}
