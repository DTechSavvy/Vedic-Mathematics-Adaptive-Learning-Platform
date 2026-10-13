import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, getGoogleAuthUrl } from "@/lib/api";
import { useAuth } from "@/App";
import {
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Award,
} from "lucide-react";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [name, setName] = useState("");
  const [learningLevel, setLearningLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [submitting, setSubmitting] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, logout } = useAuth();

  useEffect(() => {
    const googleError = searchParams.get("google");
    if (googleError === "error") {
      const message = searchParams.get("message") || "Google login failed.";
      toast({ title: "Google sign-in failed", description: message, variant: "destructive" as any });
      logout();
    }

    const token = searchParams.get("token");
    if (token) {
      login(token, { email: searchParams.get("userEmail") || email });
      navigate("/dashboard");
    }
  }, [searchParams, toast, login, navigate, logout, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const response = await api.login({ email, password });
        login(response.access_token, response.user || { email });
        toast({
          title: "Welcome back to VedicMind! 🕉️",
          description: "Signed in successfully. Resuming your learning journey.",
        });
        navigate("/dashboard");
      } else if (mode === "signup") {
        const response = await api.register({ name, email, password, learningLevel });
        login(response.access_token, response.user || { email });
        toast({
          title: "Welcome to VedicMind! 🕉️",
          description: "Your account has been created. Let's begin mastering mental math!",
        });
        navigate("/dashboard");
      } else if (mode === "forgot") {
        if (!email.trim()) {
          throw new Error("Please enter your registered email address.");
        }
        const res = await api.forgotPassword({ email: email.trim() });
        const code = res.resetCode || "108108";
        setResetCode(code);
        setDemoCodeHint(code);
        toast({
          title: "Reset Code Generated! 🔑",
          description: `Verification code: ${code}. Enter your new password below.`,
        });
        setMode("reset");
      } else if (mode === "reset") {
        if (!resetCode.trim()) {
          throw new Error("Please enter the verification reset code.");
        }
        if (!password || password.length < 6) {
          throw new Error("New password must be at least 6 characters long.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match. Please verify both fields.");
        }
        await api.resetPassword({
          email: email.trim(),
          resetCode: resetCode.trim(),
          newPassword: password,
        });
        toast({
          title: "Password Updated! ✅",
          description: "Your password has been successfully reset. Please sign in now.",
        });
        setPassword("");
        setConfirmPassword("");
        setDemoCodeHint(null);
        setMode("signin");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication request failed.";
      toast({
        title: "Notice",
        description: message,
        variant: "destructive" as any,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="relative min-h-screen w-full flex bg-[#FAF8F5] text-slate-800 overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      {/* Soft Ambient Light Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/35 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-[28rem] h-[28rem] bg-orange-200/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-[100px]" />
      </div>

      {/* Left Showcase Hero Panel (Desktop) - Elegant Light Vedic Theme */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 xl:p-16 border-r border-amber-900/10 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/30 backdrop-blur-md">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="text-3xl transform group-hover:scale-105 transition-transform duration-300 select-none">
              🕉️
            </span>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-tight text-slate-900">
                VedicMind
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                Adaptive Sutra Platform
              </span>
            </div>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-auto py-10 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100/70 px-3.5 py-1.5 text-xs font-semibold text-amber-800 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>16 Canonical Vedic Sutras · AI Tutor Guided</span>
          </div>

          <h2 className="font-display text-4xl xl:text-5xl font-black text-slate-900 leading-[1.15] mb-5 tracking-tight">
            Ancient Wisdom,{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Lightning Fast Mental Math
            </span>
          </h2>

          <p className="text-slate-600 text-base xl:text-lg leading-relaxed mb-8">
            Harness the power of ancient Indian sutras to calculate 10x faster. Master mental multiplication, division, squaring, and roots with real-time feedback.
          </p>

          <div className="grid grid-cols-2 gap-3.5">
            {[
              { icon: BookOpen, title: "16 Canonical Sutras", desc: "Structured step-by-step curriculum" },
              { icon: Sparkles, title: "Intelligent AI Tutor", desc: "Voice, image OCR & step hints" },
              { icon: Award, title: "Gamified Mastery", desc: "Daily streaks, coins & rewards" },
              { icon: ShieldCheck, title: "Adaptive Practice", desc: "Dynamic difficulty scaling" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-amber-200/70 bg-white/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-800">{feature.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal pl-8">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="pt-6 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-500">
          <span>Trusted by thousands of mental math learners</span>
          <span className="text-amber-700 font-semibold">✨ Free to start</span>
        </div>
      </div>

      {/* Right Interactive Auth Container - Light Theme */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand Link */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8 group">
            <span className="text-3xl group-hover:scale-105 transition-transform select-none">
              🕉️
            </span>
            <span className="font-display text-2xl font-black tracking-tight text-slate-900">
              VedicMind
            </span>
          </Link>

          {/* Clean Light Theme Card */}
          <div className="relative rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-amber-900/5">
            {/* Header */}
            <div className="mb-6">
              {mode === "signin" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Sign in to continue your Vedic math journey
                  </p>
                </>
              )}

              {mode === "signup" && (
                <>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Create Your Account
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Unlock lightning calculations with 16 Vedic Sutras
                  </p>
                </>
              )}

              {mode === "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold mb-3 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </button>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Recover Password
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Enter your registered email to receive an instant verification code
                  </p>
                </>
              )}

              {mode === "reset" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold mb-3 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Request another code
                  </button>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Set New Password
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Enter the verification code and your new credentials
                  </p>
                </>
              )}
            </div>

            {/* Hint Banner for Demo Reset Code */}
            {demoCodeHint && mode === "reset" && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-800">Verification Code:</span>{" "}
                  <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono font-bold text-amber-900 border border-amber-300">
                    {demoCodeHint}
                  </code>
                  <p className="mt-1 text-[11px] text-slate-600">
                    We automatically populated the code for instant recovery.
                  </p>
                </div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aryabhata"
                      required
                      className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10"
                    />
                  </div>
                </div>
              )}

              {/* Email (all modes) */}
              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@vedicmind.org"
                    required
                    className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10"
                  />
                </div>
              </div>

              {/* Password (Sign In & Sign Up) */}
              {(mode === "signin" || mode === "signup") && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Password
                    </Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setDemoCodeHint(null);
                        }}
                        className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10"
                    />
                  </div>
                </div>
              )}

              {/* Reset Code & New Password (Reset mode) */}
              {mode === "reset" && (
                <>
                  <div>
                    <Label htmlFor="resetCode" className="text-xs font-semibold text-slate-700">
                      6-Digit Verification Code
                    </Label>
                    <div className="relative mt-1.5">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="resetCode"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="108108"
                        required
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10 font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                      New Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/20 text-sm h-10"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Skill Level Selection (Sign Up only) */}
              {mode === "signup" && (
                <div className="pt-1">
                  <Label className="text-xs font-semibold text-slate-700">Starting Experience Level</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => {
                      const isActive = learningLevel === level;
                      const label = level.charAt(0) + level.slice(1).toLowerCase();
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setLearningLevel(level)}
                          className={`rounded-xl border py-2 px-2 text-xs font-bold transition-all ${
                            isActive
                              ? "border-amber-500 bg-amber-500/10 text-amber-800 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button with Rich Saffron-Orange Gradient */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold shadow-lg shadow-orange-500/20 transition-all duration-300 text-sm flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <span>Processing...</span>
                  ) : mode === "signin" ? (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : mode === "signup" ? (
                    <>
                      <span>Create Account & Start Learning</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : mode === "forgot" ? (
                    <>
                      <span>Generate Verification Code</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Sign In</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Social Divider (Sign In & Sign Up only) */}
            {(mode === "signin" || mode === "signup") && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Continue with Google with Google Icon & Theme Hover */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl border-slate-200 bg-white text-slate-700 font-medium hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm group"
                >
                  {/* High Quality Official Multi-Color Google G Icon */}
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </>
            )}

            {/* Bottom Toggle between Sign In & Sign Up */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
              {mode === "signin" ? (
                <p>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setDemoCodeHint(null);
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors ml-1"
                  >
                    Create Account
                  </button>
                </p>
              ) : mode === "signup" ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setDemoCodeHint(null);
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors ml-1"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setDemoCodeHint(null);
                    }}
                    className="font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors ml-1"
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
