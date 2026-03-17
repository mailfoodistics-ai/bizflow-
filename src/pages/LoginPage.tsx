import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BizFlow POS</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6 backdrop-blur">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400">Sign in to access your store dashboard</p>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                Create one
              </Link>
            </p>
            <p className="text-center text-slate-400 text-sm">
              <Link to="/" className="hover:text-white">
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
