import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getProducts, getCustomers, getStoreSettings, createInvoice, updateInvoicePaymentStatus } from "@/lib/db-service";
import { Product, Customer } from "@/lib/supabase";
import { Search, Plus, Minus, Trash2, X, UserPlus, Percent, QrCode, CreditCard, Banknote, Smartphone, Check, Printer, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { generateUPIString, generateTransactionRef, formatUPIAmount } from "@/lib/upi-service";
import PrintableInvoice from "@/components/PrintableInvoice";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaid, setShowPaid] = useState(false);
  const [upiQRCode, setUpiQRCode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        if (!user) return;

        const settings = await getStoreSettings(user.id);
        setStoreSettings(settings);

        // Use user.id as store_id for querying products and customers
        const productsData = await getProducts(user.id);
        const customersData = await getCustomers(user.id);

        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load billing data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
  }, [search, products]);

  const addItem = (product: Product) => {
    if (product.stock <= 0) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing && existing.quantity < product.stock) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      if (!existing) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev;
    });
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.product.id !== id) return i;
          const newQty = i.quantity + delta;
          return newQty > 0 && newQty <= i.product.stock ? { ...i, quantity: newQty } : i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const calculatedDiscount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : discount;
  const total = subtotal + tax - calculatedDiscount;

  const handlePayment = (method: string) => {
    setPaymentMethod(method);
    if (method === "upi" && storeSettings?.upi_id) {
      const transactionRef = generateTransactionRef(invoiceNumber || "INV-001");
      const upiString = generateUPIString({
        upiId: storeSettings.upi_id,
        payeeName: storeSettings.store_name,
        amount: formatUPIAmount(total),
        transactionRef: transactionRef,
        description: "BizFlow POS Payment",
      });
      setUpiQRCode(upiString);
    }
  };

  const completeSale = async () => {
    try {
      if (!storeSettings || items.length === 0 || !user) return;

      const newInvoiceNumber = `${storeSettings.invoice_prefix}-${Date.now().toString().slice(-6)}`;
      setInvoiceNumber(newInvoiceNumber);

      // Create invoice items
      const invoiceItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      // Create invoice using user.id as store_id
      const invoice = await createInvoice(user.id, {
        number: newInvoiceNumber,
        items: invoiceItems as any,
        subtotal,
        tax: storeSettings.gst_number ? tax : 0, // Use GST from settings
        discount: calculatedDiscount,
        total: storeSettings.gst_number ? total : (total - tax),
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cash" ? "completed" : "pending",
        customer_id: selectedCustomer?.id,
      } as any, invoiceItems as any);

      setLastInvoiceId(invoice.id);
      setShowPaid(true);

      setTimeout(() => {
        setShowPrintPreview(true);
      }, 1500);

      // Reset cart after 3 seconds
      setTimeout(() => {
        setShowPaid(false);
        setShowPayment(false);
        setItems([]);
        setDiscount(0);
        setDiscountPercent(0);
        setSelectedCustomer(null);
        setPaymentMethod("");
        setUpiQRCode("");
      }, 3000);
    } catch (error) {
      console.error("Error completing sale:", error);
      alert("Error creating invoice. Please try again.");
    }
  };

  if (loading) {
    return <PageLoadingScreen page="billing" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Billing Error"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
        }}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 min-h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)]">
        {/* Left: Product Search & Grid - Full on mobile, 65% on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:w-[65%] order-2 lg:order-1">
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 sm:h-12 text-pos-body bg-card text-sm"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  disabled={product.stock <= 0}
                  className={`pos-card text-left hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98] group ${
                    product.stock <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="w-full h-14 sm:h-16 bg-accent rounded-md mb-2 flex items-center justify-center">
                    <Package className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-pos-body text-xs sm:text-sm font-medium truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-pos-body font-bold text-primary text-sm sm:text-base">₹{product.price.toFixed(0)}</span>
                    <span className={`pos-label text-[10px] sm:text-xs ${product.stock < 5 ? "text-destructive" : ""}`}>
                      {product.stock > 0 ? `${product.stock}` : "OOS"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Invoice Panel - Bottom on mobile, 35% on desktop */}
        <div className="lg:w-[35%] bg-card rounded-lg border border-border flex flex-col order-1 lg:order-2 max-h-[50vh] lg:max-h-none">
          <div className="p-3 sm:p-4 border-b border-border shrink-0">
            <h2 className="text-pos-section font-semibold text-sm sm:text-base">Current Invoice</h2>
            {selectedCustomer && (
              <div className="flex items-center justify-between mt-2 bg-accent rounded-md px-3 py-2 text-xs sm:text-sm">
                <span className="text-pos-label truncate">{selectedCustomer.name}</span>
                <button onClick={() => setSelectedCustomer(null)} className="hover:text-destructive ml-2 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-3 sm:p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Receipt className="w-8 sm:w-12 h-8 sm:h-12 mb-2 opacity-30" />
                <p className="text-pos-body text-xs sm:text-sm">No items added</p>
                <p className="pos-label text-[10px] sm:text-xs">Add products above</p>
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 py-2 border-b border-border text-xs sm:text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-pos-body font-medium truncate">{item.product.name}</p>
                      <p className="pos-label text-[10px] sm:text-xs">₹{item.product.price.toFixed(0)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-6 h-6 sm:w-7 sm:h-7"
                        onClick={() => updateQty(item.product.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center text-pos-body font-medium text-xs sm:text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-6 h-6 sm:w-7 sm:h-7"
                        onClick={() => updateQty(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-pos-body font-medium w-12 sm:w-16 text-right text-xs sm:text-sm">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground hover:text-destructive ml-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-border p-3 sm:p-4 space-y-2 shrink-0">
            <div className="flex justify-between text-pos-body text-xs sm:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-pos-body text-xs sm:text-sm">
              <span className="text-muted-foreground">Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-pos-body text-success text-xs sm:text-sm">
                <span>Discount</span>
                <span>-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 sm:p-4 border-t border-border space-y-2 shrink-0">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  placeholder="Discount %"
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)));
                    setDiscount(0);
                  }}
                  className="w-full px-2 py-2 sm:py-1 h-11 sm:h-10 bg-card border border-border rounded text-xs"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(customers[0] || null)}
                className="text-pos-label text-xs w-full sm:w-auto"
              >
                <UserPlus className="w-3 h-3 mr-1" /> Customer
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-pos-label text-destructive hover:text-destructive text-xs"
              onClick={() => {
                setItems([]);
                setDiscount(0);
                setDiscountPercent(0);
                setSelectedCustomer(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Clear Cart
            </Button>
            <Button
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
              disabled={items.length === 0}
              onClick={() => setShowPayment(true)}
            >
              Checkout — ₹{total.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Payment — ₹{total.toFixed(2)}</DialogTitle>
          </DialogHeader>

          {showPaid ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-bounce">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="text-pos-section font-semibold">Payment Successful!</p>
              <p className="pos-label mt-1">Invoice {invoiceNumber} generated</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="pos-label">Select payment method</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "cash", label: "Cash", icon: Banknote },
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "split", label: "Split", icon: Percent },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handlePayment(m.id)}
                    className={`pos-card flex flex-col items-center py-6 cursor-pointer transition-all hover:border-primary/50 ${
                      paymentMethod === m.id ? "border-primary bg-primary/5 shadow-md" : ""
                    }`}
                  >
                    <m.icon
                      className={`w-8 h-8 mb-2 ${paymentMethod === m.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-pos-body font-medium">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "upi" && upiQRCode && (
                <div className="pos-card flex flex-col items-center py-4">
                  <p className="text-pos-body font-medium mb-3">Scan to pay ₹{total.toFixed(2)}</p>
                  <div className="w-48 h-48 bg-white rounded-lg p-2 border-2 border-dashed border-border mb-3 flex items-center justify-center">
                    <QRCodeSVG value={upiQRCode} size={180} level="H" includeMargin={true} />
                  </div>
                  <p className="pos-label">UPI ID: {storeSettings?.upi_id || "Not configured"}</p>
                  <p className="pos-label text-center text-xs mt-1">Amount: ₹{total.toFixed(2)}</p>
                </div>
              )}

              <Button className="w-full h-12 text-base" disabled={!paymentMethod} onClick={completeSale}>
                {paymentMethod === "upi" ? "Mark as Paid" : "Confirm Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview Modal */}
      {lastInvoiceId && (
        <PrintableInvoice invoiceId={lastInvoiceId} open={showPrintPreview} onOpenChange={setShowPrintPreview} />
      )}
    </DashboardLayout>
  );
}

function Receipt(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}

function Package(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
