import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { getInvoices } from "@/lib/db-service";
import { useAuth } from "@/lib/auth-context";

interface PrintableInvoiceProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrintableInvoice({ invoiceId, open, onOpenChange }: PrintableInvoiceProps) {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        if (!user || !open) return;

        // In real scenario, fetch single invoice
        // For now, we'll need to load from store settings
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (response.ok) {
          setInvoice(await response.json());
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      }
    };

    loadInvoice();
  }, [invoiceId, open, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById("printable-invoice");
    if (element) {
      const printWindow = window.open("", "", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!invoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading invoice...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Invoice Preview</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice */}
        <div
          id="printable-invoice"
          className="bg-white text-black p-6 rounded-lg font-mono text-sm"
          style={{ width: "80mm", margin: "0 auto" }}
        >
          {/* Header */}
          <div className="text-center mb-4 border-b pb-4">
            <h1 className="text-lg font-bold">{storeSettings?.store_name || "BizFlow Store"}</h1>
            <p className="text-xs">{storeSettings?.store_address || "Address"}</p>
            <p className="text-xs">{storeSettings?.store_phone || "Phone"}</p>
            {storeSettings?.gst_number && <p className="text-xs">GST: {storeSettings.gst_number}</p>}
          </div>

          {/* Invoice Number & Date */}
          <div className="mb-4 text-xs">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-bold">{invoice.number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date(invoice.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Items Header */}
          <div className="border-t border-b py-2 text-xs font-bold mb-2">
            <div className="flex justify-between">
              <span className="flex-1">Item</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>
          </div>

          {/* Items */}
          {invoice.items &&
            invoice.items.map((item: any, i: number) => (
              <div key={i} className="text-xs mb-1">
                <div className="flex justify-between mb-1">
                  <span className="flex-1 truncate">{item.product?.name || "Product"}</span>
                  <span className="w-12 text-right">{item.quantity}</span>
                  <span className="w-16 text-right">₹{item.unit_price.toFixed(0)}</span>
                  <span className="w-16 text-right">₹{item.subtotal.toFixed(0)}</span>
                </div>
              </div>
            ))}

          {/* Totals */}
          <div className="border-t pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%):</span>
              <span className="font-bold">₹{invoice.tax.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-bold">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-sm font-bold">
              <span>TOTAL:</span>
              <span>₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 text-xs border-t pt-2">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold">{invoice.payment_method || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold">{invoice.payment_status}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 text-xs border-t pt-2 text-gray-600">
            <p>Thank you for your purchase!</p>
            <p>Powered by BizFlow POS</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 print:hidden">
          <Button onClick={handlePrint} className="flex-1" size="sm">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1" size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
