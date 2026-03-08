import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email" });
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setShowForgot(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Send size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sent</h1>
          <p className="text-muted-foreground text-[15px] mt-1">Send messages through time</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>

          <div className="bg-card rounded-lg p-4">
            <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-[15px] mt-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>

          <p className="text-center text-muted-foreground text-sm mt-4">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/signup")} className="text-primary font-medium">
              Sign Up
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
