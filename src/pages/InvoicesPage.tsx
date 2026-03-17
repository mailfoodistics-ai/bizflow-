import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getInvoices } from "@/lib/db-service";
import { Search, Eye, Download, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Invoice } from "@/lib/supabase";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("all");

  // Load invoices from database
  const loadData = async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getInvoices(user.id);
      setInvoices(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setFilteredInvoices(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Filter invoices on search and status
  useEffect(() => {
    const filtered = invoices.filter(
      (inv) =>
        (statusFilter === "all" || inv.payment_status === statusFilter) &&
        (!search ||
          inv.number.toLowerCase().includes(search.toLowerCase()) ||
          inv.customer?.name.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredInvoices(filtered);
  }, [search, statusFilter, invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-0";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-0";
      case "failed":
        return "bg-destructive/10 text-destructive border-0";
      default:
        return "bg-accent";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Show loading screen
  if (loading) {
    return <PageLoadingScreen page="invoices" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Invoices Error"
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
        <h1 className="text-pos-title">Invoices</h1>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by invoice # or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "completed", "pending", "failed"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs sm:text-sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-pos-label font-semibold">Invoice #</th>
                    <th className="px-4 py-3 text-left text-pos-label font-semibold">Customer</th>
                    <th className="px-4 py-3 text-right text-pos-label font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-pos-label font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-pos-label font-semibold">Payment Method</th>
                    <th className="px-4 py-3 text-center text-pos-label font-semibold">Status</th>
                    <th className="px-4 py-3 text-center text-pos-label font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-pos-body font-medium text-primary">{inv.number}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-pos-label">{inv.customer?.name || "Walk-in"}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-pos-body font-semibold">₹{inv.total.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-pos-label text-sm">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[11px]">
                          {inv.payment_method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-[11px] ${getStatusColor(inv.payment_status)}`}>
                          {inv.payment_status.charAt(0).toUpperCase() + inv.payment_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewInvoice(inv)}
                          className="text-primary hover:text-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice {viewInvoice?.number}</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-4 text-pos-body">
              {/* Header */}
              <div className="text-center border-b border-border pb-4">
                <p className="text-pos-section font-bold">Your Store Name</p>
                <p className="text-pos-label text-sm">Store Address Here</p>
                <p className="text-pos-label text-sm">GST Number</p>
                <p className="text-pos-label text-sm mt-2">
                  Invoice Date: {new Date(viewInvoice.created_at).toLocaleString()}
                </p>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-pos-label font-medium">Item</th>
                      <th className="text-center py-2 px-2 text-pos-label font-medium">Qty</th>
                      <th className="text-right py-2 px-2 text-pos-label font-medium">Price</th>
                      <th className="text-right py-2 px-2 text-pos-label font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items?.map((item) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="py-2 px-2">{item.product?.name || "Item"}</td>
                        <td className="py-2 px-2 text-center">{item.quantity}</td>
                        <td className="py-2 px-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-medium">
                          ₹{(item.unit_price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-pos-label">Subtotal:</span>
                  <span className="font-medium">₹{viewInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pos-label">Tax (GST):</span>
                  <span className="font-medium">₹{viewInvoice.tax.toFixed(2)}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span className="text-pos-label">Discount:</span>
                    <span className="font-medium">-₹{viewInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total:</span>
                  <span>₹{viewInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-muted/50 rounded p-3 space-y-1">
                <p className="text-sm text-pos-label">
                  Payment Method: <span className="font-medium">{viewInvoice.payment_method}</span>
                </p>
                <p className="text-sm text-pos-label">
                  Status: <span className={`font-medium ${viewInvoice.payment_status === "completed" ? "text-success" : viewInvoice.payment_status === "pending" ? "text-yellow-600" : "text-destructive"}`}>
                    {viewInvoice.payment_status.charAt(0).toUpperCase() + viewInvoice.payment_status.slice(1)}
                  </span>
                </p>
                {viewInvoice.upi_reference && (
                  <p className="text-sm text-pos-label">
                    UPI Reference: <span className="font-mono text-xs">{viewInvoice.upi_reference}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" /> Send WhatsApp
                </Button>
                <Button className="flex-1" onClick={handlePrint}>
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
