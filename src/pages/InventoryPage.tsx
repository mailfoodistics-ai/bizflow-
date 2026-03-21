import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { getProducts, getStoreSettings, addProduct, updateProduct, deleteProduct } from "@/lib/db-service";
import { Product } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Search, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageLoadingScreen from "@/components/PageLoadingScreen";
import ErrorScreen from "@/components/ErrorScreen";

// Common product variants/units
const COMMON_UNITS = [
  "100gm",
  "250gm",
  "500gm",
  "1kg",
  "1L",
  "500ml",
  "1L",
  "2L",
  "5L",
  "10 piece",
  "20 piece",
  "30 piece",
  "1 pack",
  "1 box",
  "1 bottle",
  "1 dozen"
];

interface FormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  barcode: string;
  variant?: string;
}

interface Category {
  name: string;
  count: number;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    price: "",
    stock: "",
    barcode: "",
    variant: "",
  });
  const [storeSettings, setStoreSettings] = useState<any>(null);

  // Load products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const settings = await getStoreSettings(user.id);
          setStoreSettings(settings);
        } catch (settingsError) {
          console.warn("Warning: Failed to load store settings:", settingsError);
          // Don't fail completely if settings fail
        }
        
        // Use user.id as store_id
        try {
          const productsData = await getProducts(user.id);
          setProducts(productsData);
          setFilteredProducts(productsData);
          
          // Extract unique categories from products
          const cats = [...new Set(productsData.map(p => p.category).filter(Boolean))];
          setCategories(cats);
        } catch (productsError: any) {
          console.error("Error loading products:", productsError);
          const errorMessage = productsError?.message || JSON.stringify(productsError);
          
          // If it's a 403 error, it's likely an RLS policy issue
          if (errorMessage.includes("403") || errorMessage.includes("row-level")) {
            setError("Permission denied: Check Supabase RLS policies. You may need to allow access to your own products.");
          } else {
            setError(`Failed to load products: ${errorMessage}`);
          }
        }
      } catch (error) {
        console.error("Unexpected error loading data:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter products
  useEffect(() => {
    const q = search.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      barcode: "",
      variant: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      variant: product.image_url || "", // Using image_url field for variant temporarily
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price || !user) {
        alert("Please fill required fields: Name, Category, Price");
        return;
      }

      const productName = formData.variant 
        ? `${formData.name} - ${formData.variant}`
        : formData.name;

      if (editingId) {
        // Update existing
        await updateProduct(editingId, {
          name: productName,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock || "0"),
          barcode: formData.barcode || "", // Make barcode optional
        } as any);

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  name: productName,
                  category: formData.category,
                  price: parseFloat(formData.price),
                  stock: parseInt(formData.stock || "0"),
                  barcode: formData.barcode || "",
                }
              : p
          )
        );
      } else {
        // Add new
        const newProduct = await addProduct(user.id, {
          name: productName,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock || "0"),
          barcode: formData.barcode || "", // Make barcode optional
        } as any);

        setProducts((prev) => [newProduct, ...prev]);
        
        // Add category if it's new
        if (formData.category && !categories.includes(formData.category)) {
          setCategories([...categories, formData.category]);
        }
      }

      setShowDialog(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const handleDeleteCategory = () => {
    if (newCategory && categories.includes(newCategory)) {
      setCategories(categories.filter(c => c !== newCategory));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  // Show loading screen
  if (loading) {
    return <PageLoadingScreen page="inventory" />;
  }

  // Show error screen
  if (error) {
    return (
      <ErrorScreen
        title="Inventory Error"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          // Reload data
          const loadData = async () => {
            try {
              if (!user) {
                setLoading(false);
                return;
              }
              const productsData = await getProducts(user.id);
              setProducts(productsData);
              setFilteredProducts(productsData);
              const cats = [...new Set(productsData.map(p => p.category).filter(Boolean))];
              setCategories(cats);
              setError(null);
            } catch (error: any) {
              console.error("Retry failed:", error);
              setError(`Retry failed: ${error?.message || "Unknown error"}`);
            } finally {
              setLoading(false);
            }
          };
          loadData();
        }}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h1 className="text-pos-title text-2xl">Inventory</h1>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-10 sm:h-11 text-sm"
          />
        </div>

        {/* Products Table */}
        {filteredProducts.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-pos-label font-semibold text-xs sm:text-sm">Product</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-pos-label font-semibold">Category</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-pos-label font-semibold">Barcode</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-pos-label font-semibold text-xs sm:text-sm">Price</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-pos-label font-semibold text-xs sm:text-sm">Stock</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-pos-label font-semibold text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div>
                          <p className="text-pos-body font-medium text-xs sm:text-sm">{product.name}</p>
                          <p className="sm:hidden text-pos-label text-xs">{product.category}</p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className="text-pos-label bg-accent px-3 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <p className="text-pos-label font-mono text-sm">{product.barcode}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <p className="text-pos-body font-semibold text-primary text-xs sm:text-sm">₹{product.price.toFixed(0)}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock < 5
                              ? "bg-destructive/10 text-destructive"
                              : product.stock < 10
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {product.stock < 5 && <AlertTriangle className="w-3 h-3" />}
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="text-primary hover:text-primary p-1 sm:p-2"
                          >
                            <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
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
          <div className="text-center py-8 sm:py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4 text-sm">No products found</p>
            <Button onClick={handleAddNew} variant="outline" className="text-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Product
            </Button>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-pos-label font-medium mb-2 block">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Milk"
              />
            </div>

            <div>
              <label className="text-pos-label font-medium mb-2 block">Category *</label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 px-3 py-2 sm:py-1 h-11 sm:h-10 border border-border rounded-md text-sm bg-card"
                >
                  <option value="">Select or type category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCategoryDialog(true)}
                  className="text-xs w-full sm:w-auto"
                >
                  New
                </Button>
              </div>
              {!categories.includes(formData.category) && formData.category && (
                <p className="text-xs text-primary">✓ New category will be created</p>
              )}
            </div>

            <div>
              <label className="text-pos-label font-medium mb-2 block">Variant/Unit (Optional)</label>
              <div className="space-y-2 mb-2">
                <select
                  value={formData.variant || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "custom") {
                      setFormData({ ...formData, variant: val });
                    }
                  }}
                  className="w-full px-3 py-2 sm:py-1 h-11 sm:h-10 border border-border rounded-md text-sm bg-card"
                >
                  <option value="">Select or type variant...</option>
                  {COMMON_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                  <option value="custom">+ Custom variant...</option>
                </select>
                <Input
                  type="text"
                  placeholder="e.g., 750ml, 250gm, 6-pack..."
                  value={formData.variant || ""}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="h-11 sm:h-10 text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.variant ? `Product: ${formData.name} - ${formData.variant}` : "Leave empty for single variant"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-pos-label font-medium mb-2 block">Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-pos-label font-medium mb-2 block">Stock</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-pos-label font-medium mb-2 block">Barcode (Optional)</label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g., 100001"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {editingId ? "Update" : "Add"} Product
              </Button>
              <Button onClick={() => setShowDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-pos-label font-medium mb-2 block">Add New Category</label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Beverages"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCategory.trim()) {
                      if (!categories.includes(newCategory)) {
                        setCategories([...categories, newCategory]);
                        setNewCategory("");
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newCategory.trim() && !categories.includes(newCategory)) {
                      setCategories([...categories, newCategory]);
                      setNewCategory("");
                    }
                  }}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-pos-label font-medium mb-2 block">Existing Categories</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-2 bg-accent rounded">
                    <span className="text-pos-body text-sm">{cat}</span>
                    <button
                      onClick={() => setCategories(categories.filter(c => c !== cat))}
                      className="text-destructive hover:text-destructive p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setShowCategoryDialog(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}