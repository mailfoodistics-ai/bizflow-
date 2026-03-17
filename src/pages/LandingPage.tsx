import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BarChart3, Users, Smartphone, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Safe Area Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700/50" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white hidden sm:inline">BizFlow</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              onClick={() => navigate("/signup")}
            >
              Start Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="px-4 py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="space-y-8 text-center">
          {/* Badge */}
          <div className="inline-block mx-auto px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-full">
            <span className="text-blue-400 text-xs sm:text-sm font-semibold flex items-center gap-2 justify-center">
              <Zap className="w-3.5 h-3.5" /> Fast. Secure. Reliable.
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Grow Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Business</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Modern point-of-sale system for retailers. Real-time inventory, instant payments, and complete sales analytics.
            </p>
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-3 gap-4 py-8 border-y border-slate-700/50">
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">10K+</div>
              <p className="text-xs text-slate-400">Active Stores</p>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">₹50Cr+</div>
              <p className="text-xs text-slate-400">Processed</p>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">99.9%</div>
              <p className="text-xs text-slate-400">Uptime</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Button 
              onClick={() => navigate("/signup")} 
              size="lg" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              onClick={() => navigate("/login")} 
              size="lg" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Sign In
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> No credit card required
          </p>
        </div>
      </section>

      {/* Features Section - Mobile Optimized Cards */}
      <section className="px-4 py-16 sm:py-20 max-w-4xl mx-auto border-t border-slate-700/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-sm sm:text-base text-slate-400">Powerful features for modern retailers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              icon: ShoppingCart,
              title: "Fast Billing",
              description: "Quick checkout and barcode scanning in seconds",
            },
            {
              icon: BarChart3,
              title: "Live Analytics",
              description: "Real-time sales charts and revenue trends",
            },
            {
              icon: Users,
              title: "Customer Mgmt",
              description: "Track history and manage loyalty programs",
            },
            {
              icon: Smartphone,
              title: "Digital Payments",
              description: "Auto QR codes for instant UPI payments",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div 
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 sm:p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-semibold text-white">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 sm:py-16 max-w-4xl mx-auto border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Transform Your Store?</h2>
          <p className="text-slate-300 text-sm sm:text-base">Join thousands of retailers already using BizFlow</p>
          <Button 
            onClick={() => navigate("/signup")} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold mx-auto"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-slate-700/50 px-4 py-8 sm:py-12 text-center text-xs sm:text-sm text-slate-400">
        <p>© 2026 BizFlow POS. Made by Foodistics AI.</p>
      </footer>
    </div>
  );
}
