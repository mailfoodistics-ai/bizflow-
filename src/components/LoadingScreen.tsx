import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subtext?: string;
}

export default function LoadingScreen({ message = "Loading", subtext = "Please wait..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-4 px-6">
        {/* Animated logo/icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin"></div>
            <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-pos-title">{message}</h2>
          <p className="text-pos-label text-sm">{subtext}</p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
