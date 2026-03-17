import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IndianRupee, FileText, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { getInvoices, getProducts, getStoreSettings } from "@/lib/db-service";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    salesToday: "₹0",
    invoicesToday: "0",
    totalProducts: "0",
    lowStockCount: "0",
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null);
        if (!user) return;

        // Get store settings
        const storeSettings = await getStoreSettings(user.id);
        if (!storeSettings) {
          setError("Store settings not found");
          setLoading(false);
          return;
        }

        const storeId = storeSettings.id;

        // Get invoices for today
        const invoices = await getInvoices(storeId);
        const today = new Date().toDateString();
        const todayInvoices = invoices.filter((inv) => new Date(inv.created_at).toDateString() === today);
        const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

        // Get products
        const products = await getProducts(storeId);
        const lowStockProducts = products.filter((p) => p.stock < 10);

        // Calculate sales data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toDateString();
        });

        const salesByDay = last7Days.map((day) => {
          const dayInvoices = invoices.filter((inv) => new Date(inv.created_at).toDateString() === day);
          return {
            day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
            sales: dayInvoices.reduce((sum, inv) => sum + inv.total, 0),
          };
        });

        // Get top products
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        invoices.forEach((inv) => {
          inv.items?.forEach((item: any) => {
            if (!productSales[item.product_id]) {
              productSales[item.product_id] = {
                name: item.product?.name || "Unknown",
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[item.product_id].quantity += item.quantity;
            productSales[item.product_id].revenue += item.subtotal;
          });
        });

        const topProductsList = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Update state
        setStats({
          salesToday: `₹${todaySales.toFixed(0)}`,
          invoicesToday: todayInvoices.length.toString(),
          totalProducts: products.length.toString(),
          lowStockCount: lowStockProducts.length.toString(),
        });
        setSalesData(salesByDay);
        setTopProducts(topProductsList);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Show loading screen
  if (loading) {
    return <PageLoadingScreen page="dashboard" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Dashboard Error"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
        }}
      />
    );
  }

  const statsList = [
    { label: "Sales Today", value: stats.salesToday, icon: IndianRupee, change: "+12%" },
    { label: "Invoices Today", value: stats.invoicesToday, icon: FileText, change: "+5%" },
    { label: "Products", value: stats.totalProducts, icon: Package, change: "" },
    { label: "Low Stock Alerts", value: stats.lowStockCount, icon: AlertTriangle, change: "", alert: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-pos-title">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="pos-card h-24 bg-gradient-to-r from-slate-800 to-slate-700 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {statsList.map((s) => (
              <div key={s.label} className="pos-card flex flex-col items-start justify-between">
                <div className="w-full">
                  <p className="pos-label text-xs sm:text-sm">{s.label}</p>
                  <p className={`pos-stat mt-1 text-lg sm:text-2xl ${s.alert ? "text-destructive" : ""}`}>{s.value}</p>
                  {s.change && (
                    <span className="text-pos-label text-success flex items-center gap-1 mt-1 text-xs">
                      <TrendingUp className="w-3 h-3" /> {s.change}
                    </span>
                  )}
                </div>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mt-2 shrink-0 ${s.alert ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.alert ? "text-destructive" : "text-primary"}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="pos-card lg:col-span-2">
            <h2 className="text-pos-section mb-4 text-sm sm:text-base">Weekly Sales</h2>
            <div className="h-48 sm:h-64">
              {loading ? (
                <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-700 rounded animate-pulse"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 13 }} stroke="hsl(218,11%,46%)" />
                    <YAxis tick={{ fontSize: 13 }} stroke="hsl(218,11%,46%)" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,13%,91%)", fontSize: 13 }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
                    />
                    <Line type="monotone" dataKey="sales" stroke="hsl(230,90%,64%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(230,90%,64%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pos-card">
            <h2 className="text-pos-section mb-4 text-sm sm:text-base">Top Selling Products</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gradient-to-r from-slate-800 to-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-pos-label flex items-center justify-center font-medium text-xs">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-pos-body font-medium truncate text-xs sm:text-sm">{p.name}</p>
                        <p className="pos-label text-xs">{p.quantity} units sold</p>
                      </div>
                    </div>
                    <span className="text-pos-body font-medium text-xs sm:text-sm">₹{p.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p className="text-center">No sales data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
