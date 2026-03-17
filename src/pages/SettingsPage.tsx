import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getStoreSettings, updateStoreSettings } from "@/lib/db-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { StoreSettings } from "@/lib/supabase";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load store settings from database
  const loadSettings = async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getStoreSettings(user.id);
      setSettings(data || {
        id: "",
        user_id: user.id,
        store_name: "My Store",
        store_address: "",
        store_phone: "",
        gst_number: "5",
        upi_id: "",
        invoice_prefix: "INV",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      setError("Failed to load store settings. Please try again.");
      toast.error("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  // Update a setting field
  const updateField = (field: keyof StoreSettings, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  // Save settings to database
  const handleSave = async () => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      await updateStoreSettings(user.id, {
        store_name: settings.store_name,
        store_address: settings.store_address,
        store_phone: settings.store_phone,
        gst_number: settings.gst_number,
        upi_id: settings.upi_id,
        invoice_prefix: settings.invoice_prefix,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoadingScreen page="settings" />;
  }

  // Show error screen
  if (error && !settings) {
    return (
      <ErrorScreen
        title="Settings Error"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          loadSettings();
        }}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-pos-title">Store Settings</h1>

        {/* Store Information */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-pos-section font-semibold">Store Information</h2>

          <div>
            <label className="text-pos-label font-medium block mb-2">Store Name *</label>
            <Input
              value={settings.store_name}
              onChange={(e) => updateField("store_name", e.target.value)}
              placeholder="e.g., QuickMart Store"
            />
          </div>

          <div>
            <label className="text-pos-label font-medium block mb-2">Store Address</label>
            <Textarea
              value={settings.store_address}
              onChange={(e) => updateField("store_address", e.target.value)}
              placeholder="e.g., 123 Market Road, New Delhi - 110001"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-pos-label font-medium block mb-2">Phone Number</label>
              <Input
                value={settings.store_phone}
                onChange={(e) => updateField("store_phone", e.target.value)}
                placeholder="e.g., 9876543210"
              />
            </div>
            <div>
              <label className="text-pos-label font-medium block mb-2">GST Number</label>
              <Input
                value={settings.gst_number}
                onChange={(e) => updateField("gst_number", e.target.value)}
                placeholder="e.g., 07AAACR5055K1Z5"
              />
            </div>
          </div>
        </div>

        {/* Payment & Invoice Settings */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-pos-section font-semibold">Payment & Invoice Settings</h2>

          <div>
            <label className="text-pos-label font-medium block mb-2">UPI ID for Payments</label>
            <Input
              value={settings.upi_id}
              onChange={(e) => updateField("upi_id", e.target.value)}
              placeholder="e.g., yourname@upi"
              type="text"
            />
            <p className="text-pos-label text-xs mt-1">
              Used for generating QR codes on invoices
            </p>
          </div>

          <div>
            <label className="text-pos-label font-medium block mb-2">Invoice Prefix</label>
            <Input
              value={settings.invoice_prefix}
              onChange={(e) => updateField("invoice_prefix", e.target.value)}
              placeholder="e.g., INV"
            />
            <p className="text-pos-label text-xs mt-1">
              Invoice numbers will be: {settings.invoice_prefix || "INV"}-XXXXXX
            </p>
          </div>

          <div>
            <label className="text-pos-label font-medium block mb-2">GST Rate (%)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={settings.gst_number ? parseFloat(settings.gst_number) || 5 : 5}
                onChange={(e) => updateField("gst_number", e.target.value)}
                placeholder="e.g., 5"
                step="0.1"
                min="0"
                max="100"
              />
              <span className="flex items-center text-pos-body font-semibold">%</span>
            </div>
            <p className="text-pos-label text-xs mt-1">
              Default tax rate applied to all invoices
            </p>
          </div>

          <div className="bg-muted/50 rounded p-4 border border-border">
            <p className="text-pos-label text-sm font-medium mb-2">Sample Invoice Number:</p>
            <p className="text-pos-body font-mono text-lg">
              {settings.invoice_prefix || "INV"}-{Math.random().toString().slice(-6)}
            </p>
          </div>
        </div>

        {/* Printer Configuration */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-pos-section font-semibold">Printer Configuration</h2>

          <p className="text-pos-label text-sm mb-4">
            Configure your printers for invoice printing and thermal printer support
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded border border-border">
              <div>
                <p className="text-pos-body font-medium text-sm">Thermal Printer (80mm)</p>
                <p className="text-pos-label text-xs">USB / Bluetooth connected</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Test Print
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded border border-border">
              <div>
                <p className="text-pos-body font-medium text-sm">A4 Printer</p>
                <p className="text-pos-label text-xs">Network / USB connected</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Test Print
              </Button>
            </div>
          </div>

          <div className="bg-success/10 border border-success/20 rounded p-3 sm:p-4">
            <p className="text-success text-xs sm:text-sm font-medium">
              ✓ Thermal printer support is enabled for 80mm receipt paper
            </p>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-pos-section font-semibold">System Information</h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded">
              <span className="text-pos-label">Store ID:</span>
              <span className="font-mono text-pos-body text-[10px] sm:text-xs">{settings.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded">
              <span className="text-pos-label">Created:</span>
              <span className="text-pos-body">
                {new Date(settings.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded">
              <span className="text-pos-label">Last Updated:</span>
              <span className="text-pos-body">
                {new Date(settings.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            variant="outline"
            onClick={loadSettings}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
