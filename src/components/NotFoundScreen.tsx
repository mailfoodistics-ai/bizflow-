import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 via-background to-primary/5 p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 display */}
        <div className="space-y-2">
          <div className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <p className="text-muted-foreground">Page not found</p>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-pos-title">Oops! We couldn't find that page</h2>
          <p className="text-pos-label text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-col sm:flex-row pt-4">
          <Button onClick={() => navigate("/")} className="flex-1 gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Button>
          <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
            Go Back
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-2 pt-6">
          <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
