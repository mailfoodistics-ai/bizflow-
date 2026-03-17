import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BarChart3, Users, Settings, ArrowRight, Zap, CheckCircle2, TrendingUp, Lock, Smartphone } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">BizFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/signup")} className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/50">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Dashboard Preview */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/50 rounded-full">
                <span className="text-primary text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Fast. Secure. Reliable.
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                Grow Your <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">Business</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Modern point-of-sale system for retailers. Real-time inventory, instant UPI payments, and complete sales analytics—all in one platform.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-slate-700/50">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <p className="text-sm text-slate-400">Stores Active</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">₹50Cr+</div>
                <p className="text-sm text-slate-400">Processed</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <p className="text-sm text-slate-400">Uptime</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate("/signup")} size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-xl hover:shadow-primary/50 text-lg h-14">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800 hover:border-slate-500 text-lg h-14">
                Sign In
              </Button>
            </div>

            <p className="text-sm text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> No credit card required
            </p>
          </div>

          {/* Right Dashboard Preview */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl hover:shadow-primary/20 transition-shadow">
              {/* Dashboard Header */}
              <div className="bg-slate-900/50 border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-gradient-to-r from-primary to-blue-400 rounded w-24"></div>
                    <div className="h-2 bg-slate-700 rounded w-32 mt-2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="text-xs text-slate-400 mb-2">Sales Today</div>
                    <div className="text-2xl font-bold text-primary">₹12,450</div>
                    <div className="text-xs text-green-400 mt-2">↑ 12%</div>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="text-xs text-slate-400 mb-2">Transactions</div>
                    <div className="text-2xl font-bold text-blue-400">18</div>
                    <div className="text-xs text-green-400 mt-2">↑ 5%</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-slate-700/20 border border-slate-600 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-4">Weekly Sales</div>
                  <div className="flex items-end justify-between h-20 gap-1.5">
                    {[40, 60, 45, 75, 65, 85, 72].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-cyan-400 rounded-sm hover:from-primary hover:to-blue-400 transition-all"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Recent Transaction */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">UPI Payment</div>
                    <div className="text-xs text-slate-400">₹2,500 • Just now</div>
                  </div>
                  <div className="text-sm font-semibold text-green-400">✓</div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-6 -right-3 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                Live Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-700/50">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Powerful features designed specifically for modern retailers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShoppingCart,
              title: "Fast Billing",
              description: "Barcode scanning, quick search, and one-click add. Process sales in seconds.",
              color: "blue",
            },
            {
              icon: BarChart3,
              title: "Real Analytics",
              description: "Live sales charts, top products, revenue trends, and customer insights.",
              color: "green",
            },
            {
              icon: Users,
              title: "Customer Mgmt",
              description: "Track purchase history, maintain loyalty, and manage customer contacts.",
              color: "purple",
            },
            {
              icon: Smartphone,
              title: "UPI Payments",
              description: "Auto-generated QR codes for instant digital payments with zero friction.",
              color: "pink",
            },
            {
              icon: Lock,
              title: "Secure & Safe",
              description: "Enterprise-grade security with end-to-end encryption and automatic backups.",
              color: "orange",
            },
            {
              icon: TrendingUp,
              title: "Inventory Mgmt",
              description: "Real-time stock tracking, low-stock alerts, and automatic reordering.",
              color: "cyan",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            const colorClasses: Record<string, string> = {
              blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
              green: "from-green-500/20 to-green-600/10 border-green-500/30",
              purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
              pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
              orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
              cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
            };

            return (
              <div key={i} className={`bg-gradient-to-br ${colorClasses[feature.color]} border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer`}>
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative p-12 text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Ready to Transform Your Store?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">Join thousands of retailers using BizFlow to streamline operations and boost sales.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={() => navigate("/signup")} size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:shadow-xl hover:shadow-primary/50 text-lg h-14">
                Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline" size="lg" className="border-slate-500 text-white hover:bg-slate-800 text-lg h-14">
                Already have an account?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold text-white">BizFlow</span>
              </div>
              <p className="text-slate-400 text-sm">Modern POS for modern stores</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Product</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><button onClick={() => navigate("/signup")} className="hover:text-white transition">Features</button></li>
                <li><button onClick={() => navigate("/signup")} className="hover:text-white transition">Pricing</button></li>
                <li><button onClick={() => navigate("/signup")} className="hover:text-white transition">Security</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Company</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Legal</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2026 BizFlow POS. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
