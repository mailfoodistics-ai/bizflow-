import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  title = "Oops! Something went wrong",
  message = "Please try again or contact support",
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-accent/5 p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error icon with animation */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-destructive/20"></div>
            <AlertCircle className="absolute inset-0 m-auto w-12 h-12 text-destructive animate-bounce" />
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-destructive">{title}</h2>
          <p className="text-pos-label text-sm">{message}</p>
        </div>

        {/* Action button */}
        {onRetry && (
          <Button onClick={onRetry} className="w-full bg-destructive hover:bg-destructive/90">
            Try Again
          </Button>
        )}

        {/* Divider */}
        <div className="pt-2">
          <p className="text-pos-label text-xs">Error Code: {Math.random().toString(36).substring(2, 9)}</p>
        </div>
      </div>
    </div>
  );
}
