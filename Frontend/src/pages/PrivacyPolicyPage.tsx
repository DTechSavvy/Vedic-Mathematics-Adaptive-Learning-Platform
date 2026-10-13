import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Trash2, 
  Brain, 
  Database, 
  Users, 
  FileText, 
  ArrowLeft,
  Sparkles,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 5, 2026";

  const sections = [
    {
      id: "introduction",
      icon: ShieldCheck,
      title: "1. Introduction & Overview",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Welcome to <strong className="text-foreground">VedicMind</strong> (also referred to as <strong className="text-foreground">DWANDA</strong>, "An AI-Driven Gamified Adaptive Learning Platform for Vedic Mathematics"). We are dedicated to reviving ancient Indian mental arithmetic sutras through contemporary artificial intelligence and adaptive pedagogy, while holding the privacy, safety, and digital autonomy of our learners in highest regard.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This Privacy Policy details how we collect, process, safeguard, and respect your personal information when you access our web application, interact with our AI Tutor, solve practice problems, and track your mathematical progress.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      icon: Database,
      title: "2. Information We Collect",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            To provide an individualized, adaptive learning trajectory, we collect only the necessary data points:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-saffron" /> Account Details
              </h4>
              <p className="text-sm text-muted-foreground">
                Your name, email address, password hash (salted and hashed via bcrypt), and profile preferences. If authenticated via Google OAuth, we receive your verified email and display avatar.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Brain className="h-4 w-4 text-saffron" /> Learning Telemetry & Mastery
              </h4>
              <p className="text-sm text-muted-foreground">
                Practice attempts, response latency, accuracy rates, streak milestones, sutra mastery percentages (BKS knowledge states), and completed lesson chapters.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <FileText className="h-4 w-4 text-saffron" /> AI Tutor Chats & Worksheets
              </h4>
              <p className="text-sm text-muted-foreground">
                Conversational messages exchanged with the Vedic Tutor and mathematical images/scratchpads uploaded for optical step verification.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Lock className="h-4 w-4 text-saffron" /> System & Session Logs
              </h4>
              <p className="text-sm text-muted-foreground">
                Browser agent metadata, timestamped active learning dates (used solely to compute genuine daily streaks), and diagnostic error traces.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-processing",
      icon: Sparkles,
      title: "3. AI Tutor & Multimodal Processing",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our AI Tutor leverages advanced generative multimodal vision models (Google Gemini API) to examine handwritten Vedic calculations, identify mental arithmetic missteps, and explain Sanskrit sutras step-by-step.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Ephemeral Image Handling:</strong> Uploaded images of handwritten calculations are parsed exclusively for mathematical verification and are not used to train third-party public models.
            </li>
            <li>
              <strong className="text-foreground">Speech Synthesis (TTS):</strong> Text-to-speech audio rendering is processed on-device through standard Web Speech synthesis interfaces. No learner vocal recordings are captured or transferred to external servers without explicit student permission.
            </li>
            <li>
              <strong className="text-foreground">Mathematical Grounding:</strong> AI prompts enforce strict canonical Vedic Sutra definitions (such as <em>Ekadhikena Purvena</em>, <em>Nikhilam Navatashcaramam Dashatah</em>, and <em>Urdhva Tiryagbhyam</em>) to prevent hallucinated rules.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "chat-deletion",
      icon: Trash2,
      title: "4. User Control: Chat Deletion & History Purging",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We believe you should have total sovereignty over your educational conversations. Just like modern messaging applications, VedicMind offers instant ChatGPT-style conversation controls:
          </p>
          <div className="rounded-xl border border-saffron/30 bg-saffron/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-saffron/10 text-saffron">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Individual Session Deletion & History Wipe</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  At any point inside the AI Tutor, students can delete individual chat conversations or trigger a complete history purge. When a chat is deleted, all correlated messages and multi-turn context tokens are permanently removed from our active database.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "streak-data",
      icon: Eye,
      title: "5. Real-Time Streak & Activity Calculation",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Our gamification engine tracks your consecutive daily practice to encourage habit formation:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Continuous Flow Check:</strong> If more than one calendar day elapses without completing a lesson or practice question, your streak updates in real time and automatically resets to zero.
            </li>
            <li>
              <strong className="text-foreground">No Surveillance:</strong> Active dates are recorded solely as UTC day timestamps (<code className="px-1.5 py-0.5 rounded bg-muted text-xs">YYYY-MM-DD</code>) upon legitimate educational actions, never through intrusive background activity tracking.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      icon: Lock,
      title: "6. Security & Storage Standards",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We employ modern industry standards to protect your records:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Encryption in Transit:</strong> All platform data is transmitted over HTTPS with TLS 1.3 encryption.</li>
            <li><strong className="text-foreground">Stateless Authentication:</strong> User sessions are managed via cryptographically signed JSON Web Tokens (JWT) containing zero sensitive financial or identifying data.</li>
            <li><strong className="text-foreground">Credential Protection:</strong> Passwords undergo salted cryptographic hashing (Bcrypt) prior to database persistence; plain-text passwords are never logged or stored.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      icon: HelpCircle,
      title: "7. Inquiries & Data Rights",
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Under applicable digital data protection standards, you possess the right to access, rectify, or demand the deletion of your personal records and academic history stored within VedicMind.
          </p>
          <div className="flex flex-wrap gap-4 items-center p-4 rounded-xl border border-border bg-card/40">
            <div>
              <p className="text-sm font-semibold text-foreground">VedicMind Academic Research Team</p>
              <p className="text-xs text-muted-foreground">Major Project Academic Portal • DWANDA Platform</p>
              <p className="text-sm text-saffron mt-1">support@vedicmind.edu</p>
            </div>
          </div>
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
              <ShieldCheck className="h-3.5 w-3.5" /> Learner Data Protection Guarantee
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              How we honor your educational trust, secure your mathematical practice history, and give you full control over your AI chats.
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
            to="/terms"
            className="text-sm font-medium text-saffron hover:underline flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4" /> View Terms and Conditions →
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
