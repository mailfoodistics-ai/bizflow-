import { Loader2, BarChart3, ShoppingCart, Package, Users, FileText, Settings } from "lucide-react";

interface PageLoadingScreenProps {
  page: "dashboard" | "billing" | "inventory" | "customers" | "invoices" | "reports" | "settings";
  message?: string;
}

export default function PageLoadingScreen({ page, message }: PageLoadingScreenProps) {
  const getIcon = () => {
    switch (page) {
      case "dashboard":
        return <BarChart3 className="w-12 h-12" />;
      case "billing":
        return <ShoppingCart className="w-12 h-12" />;
      case "inventory":
        return <Package className="w-12 h-12" />;
      case "customers":
        return <Users className="w-12 h-12" />;
      case "invoices":
        return <FileText className="w-12 h-12" />;
      case "reports":
        return <BarChart3 className="w-12 h-12" />;
      case "settings":
        return <Settings className="w-12 h-12" />;
      default:
        return <Loader2 className="w-12 h-12" />;
    }
  };

  const getPageName = () => {
    switch (page) {
      case "dashboard":
        return "Dashboard";
      case "billing":
        return "Billing";
      case "inventory":
        return "Inventory";
      case "customers":
        return "Customers";
      case "invoices":
        return "Invoices";
      case "reports":
        return "Reports";
      case "settings":
        return "Settings";
      default:
        return "Loading";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <div className="text-center space-y-6 max-w-sm">
        {/* Animated icon specific to page */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            {/* Background pulse */}
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            
            {/* Rotating border */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin"></div>
            
            {/* Page-specific icon */}
            <div className="absolute inset-0 m-auto flex items-center justify-center text-primary">
              {getIcon()}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {message || `Loading ${getPageName()}`}
          </h2>
          <p className="text-gray-600 text-sm">
            {page === "dashboard" && "Fetching your sales data..."}
            {page === "billing" && "Preparing checkout..."}
            {page === "inventory" && "Loading your products..."}
            {page === "customers" && "Fetching customer list..."}
            {page === "invoices" && "Loading invoice history..."}
            {page === "reports" && "Analyzing sales metrics..."}
            {page === "settings" && "Loading configuration..."}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 pt-4">
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" 
            style={{ animationDelay: "0s" }}
          ></div>
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce" 
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div 
            className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" 
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
