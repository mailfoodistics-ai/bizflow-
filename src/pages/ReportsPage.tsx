import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getInvoices } from "@/lib/db-service";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Invoice } from "@/lib/supabase";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

export default function ReportsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30"); // days

  // Load invoices from database
  const loadData = async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Calculate daily revenue data
  const getDailyRevenueData = () => {
    const days = parseInt(dateRange);
    const dataMap: Record<string, number> = {};

    invoices.forEach((inv) => {
      const date = new Date(inv.created_at);
      const isWithinRange =
        date.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
      if (!isWithinRange) return;

      const dayKey = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      dataMap[dayKey] = (dataMap[dayKey] || 0) + inv.total;
    });

    return Object.entries(dataMap)
      .map(([day, revenue]) => ({
        day,
        revenue: Math.round(revenue * 100) / 100,
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  };

  // Calculate monthly sales data
  const getMonthlyData = () => {
    const dataMap: Record<string, number> = {};

    invoices.forEach((inv) => {
      const date = new Date(inv.created_at);
      const monthKey = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      dataMap[monthKey] = (dataMap[monthKey] || 0) + inv.total;
    });

    return Object.entries(dataMap)
      .map(([month, sales]) => ({
        month,
        sales: Math.round(sales * 100) / 100,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Calculate top selling products
  const getTopProducts = () => {
    const productMap: Record<
      string,
      { name: string; units: number; revenue: number }
    > = {};

    invoices.forEach((inv) => {
      inv.items?.forEach((item) => {
        const prodName = item.product?.name || "Unknown";
        if (!productMap[prodName]) {
          productMap[prodName] = { name: prodName, units: 0, revenue: 0 };
        }
        productMap[prodName].units += item.quantity;
        productMap[prodName].revenue += item.unit_price * item.quantity;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate summary stats
  const calculateStats = () => {
    const days = parseInt(dateRange);
    const recentInvoices = invoices.filter(
      (inv) =>
        new Date(inv.created_at).getTime() >=
        Date.now() - days * 24 * 60 * 60 * 1000
    );

    const totalRevenue = recentInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = recentInvoices.length;
    const avgOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = recentInvoices.filter(
      (inv) => inv.payment_status === "completed"
    ).length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completedOrders,
      completionRate:
        totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
  };

  const dailyData = getDailyRevenueData();
  const monthlyData = getMonthlyData();
  const topProducts = getTopProducts();
  const stats = calculateStats();

  // Show loading screen
  if (loading) {
    return <PageLoadingScreen page="reports" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Reports Error"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          loadData();
        }}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-pos-title">Reports & Analytics</h1>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1 h-11 sm:h-10 border border-border rounded-lg bg-background text-pos-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <p className="text-pos-label text-xs sm:text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                ₹{stats.totalRevenue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-pos-label text-xs mt-2">
                {parseInt(dateRange)} days
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <p className="text-pos-label text-xs sm:text-sm font-medium mb-1">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.totalOrders}</p>
              <p className="text-pos-label text-xs mt-2">
                Avg: ₹{stats.avgOrderValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <p className="text-pos-label text-xs sm:text-sm font-medium mb-1">
                Completed Orders
              </p>
              <p className="text-xl sm:text-2xl font-bold text-success">
                {stats.completedOrders}
              </p>
              <p className="text-success text-xs mt-2">
                {stats.completionRate.toFixed(1)}% completion
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
              <p className="text-pos-label text-xs sm:text-sm font-medium mb-1">
                Top Product
              </p>
              <p className="text-lg sm:text-lg font-bold truncate">
                {topProducts[0]?.name || "N/A"}
              </p>
              <p className="text-pos-label text-xs mt-2">
                {topProducts[0]?.units || 0} units sold
              </p>
            </div>
          </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-pos-section font-semibold mb-4">
              Daily Revenue
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(218,11%,46%)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(218,11%,46%)"
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [
                      `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(230,90%,64%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(230,90%,64%)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-pos-section font-semibold mb-4">
              Monthly Sales Trend
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(218,11%,46%)"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(218,11%,46%)"
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [
                      `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                      "Sales",
                    ]}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(196,65%,66%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        {topProducts.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="text-pos-section font-semibold mb-4">
              Top Selling Products
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-pos-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-pos-label font-medium">#</th>
                    <th className="text-left py-3 px-4 text-pos-label font-medium">
                      Product
                    </th>
                    <th className="text-right py-3 px-4 text-pos-label font-medium">
                      Units Sold
                    </th>
                    <th className="text-right py-3 px-4 text-pos-label font-medium">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{i + 1}</td>
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-right">{p.units}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">
                        ₹
                        {p.revenue.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dailyData.length === 0 && (
          <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              No data available for the selected period
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
