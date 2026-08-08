import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode — navigate to dashboard
    toast({
      title: isSignUp ? "Welcome to VedicMind! 🕉️" : "Welcome back! 🕉️",
      description: "Entering demo mode...",
    });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left visual */}
      <div className="hidden w-1/2 gradient-indigo lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6 text-7xl animate-float">🕉️</div>
          <h2 className="mb-4 font-display text-4xl font-bold text-secondary-foreground">
            Ancient Wisdom,<br />
            <span className="text-gradient-gold">Modern Learning</span>
          </h2>
          <p className="max-w-md text-secondary-foreground/70">
            Master the art of lightning-fast mental calculations with 16 Vedic Sutras, guided by AI.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            {["🪙 Earn Coins", "📈 Track Progress", "🤖 AI Tutor"].map((item) => (
              <div key={item} className="rounded-full bg-saffron/10 px-4 py-2 text-sm text-saffron-light">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="text-2xl">🕉️</span>
            <span className="font-display text-xl font-bold text-foreground">VedicMind</span>
          </Link>

          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {isSignUp
              ? "Start your Vedic Mathematics journey today"
              : "Continue your learning path"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>

            {isSignUp && (
              <div>
                <Label>Skill Level</Label>
                <div className="mt-2 flex gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" size="lg">
              {isSignUp ? "Start Learning →" : "Sign In →"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-primary hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
