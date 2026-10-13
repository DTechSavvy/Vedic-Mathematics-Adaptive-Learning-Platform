import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FileCheck2, 
  Scale, 
  Brain, 
  Flame, 
  GraduationCap, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Trash2
} from "lucide-react";

export default function TermsConditionsPage() {
  const lastUpdated = "October 5, 2026";

  const sections = [
    {
      id: "acceptance",
      icon: FileCheck2,
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By registering, accessing, or interacting with <strong className="text-foreground">VedicMind</strong> (also designated as <strong className="text-foreground">DWANDA</strong>, "An AI-Driven Gamified Adaptive Learning Platform for Vedic Mathematics"), you agree to be bound by these Terms and Conditions.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you do not concur with any part of these Terms, you must discontinue platform use immediately. These terms establish a legally binding agreement between you and the VedicMind academic platform administrators.
          </p>
        </>
      ),
    },
    {
      id: "educational-mission",
      icon: GraduationCap,
      title: "2. Educational Purpose & Pedagogy",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            VedicMind is an academic, adaptive learning platform engineered to teach the 16 core Sutras and 13 Sub-Sutras of Vedic Mathematics (derived from Swami Bharati Krishna Tirtha's canonical treatise).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Authorized Learning Use
              </h4>
              <p className="text-sm text-muted-foreground">
                Learners are encouraged to explore curriculum modules, test their mental calculation speed, engage in practice drills, and seek step-by-step guidance from the AI Tutor.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Academic Disclaimer
              </h4>
              <p className="text-sm text-muted-foreground">
                Vedic mental arithmetic shortcuts augment standard arithmetic. Results and explanations provided by the automated tutor should be evaluated critically by students preparing for formal competitive examinations.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "ai-tutor-ethics",
      icon: Brain,
      title: "3. AI Tutor Acceptable Use & Conduct",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            The AI Tutor is equipped with multimodal reasoning (text, audio text-to-speech, and image recognition) to assist you with mathematical queries. You agree to adhere to the following usage standards:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Honest Academic Inquiries:</strong> The AI Tutor is intended for learning sutras, diagnosing arithmetic errors, and understanding proofs. Do not submit harmful, abusive, harassing, or deceptive prompts.
            </li>
            <li>
              <strong className="text-foreground">Mathematical Worksheets:</strong> Uploaded images must be relevant mathematical scratchpads, practice problems, or textbook excerpts. Uploading unauthorized copyrighted material or non-educational content is strictly prohibited.
            </li>
            <li>
              <strong className="text-foreground">Chat Privacy Controls:</strong> You retain the capability to delete individual chat threads or execute a complete history purge anytime directly from the AI Tutor interface.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "gamification-rules",
      icon: Flame,
      title: "4. Gamification, Badges & Daily Streaks",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            VedicMind employs gamified incentives (Sutra Coins, Mastery Badges, Speed Stars, and Continuous Streaks) to foster consistent mathematical discipline:
          </p>
          <div className="rounded-xl border border-saffron/30 bg-saffron/5 p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-saffron" /> The Continuous Flow Rule
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Streaks represent consecutive calendar days of verified educational practice. If a learner misses one calendar day in the continuous flow, our state engine evaluates the inactivity and the streak automatically resets to zero (0). Automated scripts, bots, or unauthorized manipulation of streak telemetry will result in badge forfeiture.
            </p>
            <p className="text-xs text-muted-foreground/80 italic">
              Note: Virtual currency (Sutra Coins) holds no monetary value outside the VedicMind ecosystem and cannot be redeemed for fiat currency.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "intellectual-property",
      icon: BookOpen,
      title: "5. Intellectual Property Rights",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-3">
            All original pedagogical structures, interactive problem generators, custom SVG visualizations, codebases, and platform designs are the intellectual property of the VedicMind (DWANDA) development team.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Historical Vedic sutras and mathematical principles themselves reside in the public domain. References to external educational media (e.g., historical archives from the University of St Andrews MacTutor archive or embedded instructional YouTube videos) remain the copyright of their respective creators and are cited under educational fair use.
          </p>
        </>
      ),
    },
    {
      id: "account-management",
      icon: Scale,
      title: "6. User Accounts & Termination",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-3">
            You are responsible for safeguarding your login credentials. You agree not to share your account or use another student's profile without authorization.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate access to any account that engages in system exploitation, reverse engineering of the adaptive assessment algorithms, or abusive behavior toward our AI systems.
          </p>
        </>
      ),
    },
    {
      id: "liability-limitation",
      icon: ShieldCheck,
      title: "7. Limitation of Liability",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            The platform is provided on an "as-is" and "as-available" basis for educational enrichment. To the fullest extent permissible by applicable law, VedicMind and its project team disclaim all warranties, express or implied, including fitness for a particular examination or guaranteed improvement in competitive test scoring.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">VedicMind</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-card/80 via-background to-background py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="container relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3.5 py-1 text-xs font-medium text-saffron mb-4">
              <Scale className="h-3.5 w-3.5" /> Platform Governance & Academic Terms
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Terms & Conditions
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Guidelines for fair use, AI tutor interactions, gamified streaks, and educational integrity on VedicMind.
            </p>
            <p className="mt-3 text-xs text-muted-foreground/80">
              Effective Date: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-4xl py-12">
        <div className="space-y-10">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-2xl border border-border/70 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron/10 text-saffron border border-saffron/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="mt-2 text-foreground/90">
                  {section.content}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/70 pt-8">
          <Link
            to="/privacy"
            className="text-sm font-medium text-saffron hover:underline flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" /> View Privacy Policy →
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to VedicMind Home
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 bg-card/20">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕉️</span>
            <span className="font-display font-semibold text-foreground">VedicMind</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VedicMind (DWANDA). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
