import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getCustomers, addCustomer, updateCustomer } from "@/lib/db-service";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Customer } from "@/lib/supabase";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Load customers from database
  const loadData = async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getCustomers(user.id);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Filter customers on search
  useEffect(() => {
    const filtered = customers.filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    );
    setFilteredCustomers(filtered);
  }, [search, customers]);

  // Handle add new customer
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "" });
    setShowDialog(true);
  };

  // Handle edit customer
  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
    });
    setShowDialog(true);
  };

  // Handle save customer
  const handleSave = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      if (editingId) {
        await updateCustomer(editingId, {
          name: formData.name,
          phone: formData.phone,
          email: "",
          total_purchases: 0,
        });
      } else {
        await addCustomer(user.id, {
          name: formData.name,
          phone: formData.phone,
          email: "",
          total_purchases: 0,
        });
      }
      setShowDialog(false);
      await loadData();
    } catch (error) {
      console.error("Failed to save customer:", error);
    }
  };

  // Handle delete customer
  const handleDelete = async (customerId: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      // Note: You may want to implement soft delete or check for related invoices
      await updateCustomer(customerId, { name: "", phone: "", email: "", total_purchases: 0 });
      await loadData();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  // Show loading screen
  if (loading) {
    return <PageLoadingScreen page="customers" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Customers Error"
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h1 className="text-pos-title text-2xl">Customer Management</h1>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 sm:h-10 text-sm"
          />
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-pos-label font-semibold text-xs sm:text-sm">Customer Name</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-pos-label font-semibold">Phone</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-pos-label font-semibold text-xs sm:text-sm">Purchases</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-pos-label font-semibold text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div>
                          <p className="text-pos-body font-medium text-xs sm:text-sm">{customer.name}</p>
                          <p className="sm:hidden text-pos-label text-xs">{customer.phone || "-"}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <p className="text-pos-label">{customer.phone || "-"}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <p className="text-pos-body font-semibold text-primary text-xs sm:text-sm">
                          {customer.total_purchases || 0}
                        </p>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            className="text-primary hover:text-primary p-1 sm:p-2"
                          >
                            <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            className="text-destructive hover:text-destructive p-1 sm:p-2"
                          >
                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editingId ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-pos-label font-medium mb-2 block text-xs sm:text-sm">Customer Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                className="h-11 sm:h-10"
              />
            </div>

            <div>
              <label className="text-pos-label font-medium mb-2 block text-xs sm:text-sm">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., 9876543210"
                className="h-11 sm:h-10"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingId ? "Update" : "Add"} Customer
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
