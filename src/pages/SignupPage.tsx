import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, AlertCircle, CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !storeName) {
      setError("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, storeName);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setShowVerification(true);
      setResendCooldown(300); // 5 minutes cooldown
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(300);
    // In a real app, call resend verification email API
    console.log("Resending verification email to", email);
  };

  const openGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?authuser=${email}`;
    window.open(gmailUrl, "_blank");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Email Verification Screen
  if (showVerification && success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
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
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="relative w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-bounce">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
                <p className="text-slate-400">
                  We sent a verification link to <span className="text-primary font-medium">{email}</span>
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <p className="text-blue-300 text-sm font-medium">📧 Check your email inbox</p>
              <p className="text-slate-400 text-sm">
                Click the verification link in the email to activate your account and login.
              </p>
            </div>

            {/* Gmail Quick Access */}
            <Button
              onClick={openGmail}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium"
            >
              <Mail className="w-4 h-4 mr-2" /> Open Gmail
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Resend Section */}
            <div className="border-t border-slate-700 pt-6 space-y-3">
              <p className="text-slate-400 text-sm text-center">Didn't receive the email?</p>
              <Button
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                {resendCooldown > 0 ? (
                  <>
                    <span className="mr-2">Resend email</span>
                    <span className="font-mono text-sm">
                      {Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <p className="text-slate-500 text-xs text-center">
                (You can request a new link after 5 minutes)
              </p>
            </div>

            {/* Additional help */}
            <div className="space-y-2 text-center text-slate-400 text-sm">
              <p>
                Check your spam folder if you don't see the email.
                <br />
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-400 text-xs">
            <p>Verification emails are sent instantly. It may take a minute to arrive.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
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
            <h1 className="text-2xl font-bold text-white">Create Your Store</h1>
            <p className="text-slate-400">Get started with BizFlow POS in minutes</p>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Store Name</label>
              <Input
                type="text"
                placeholder="My Amazing Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-center text-slate-400 text-sm">
              <Link to="/" className="hover:text-white">
                Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
