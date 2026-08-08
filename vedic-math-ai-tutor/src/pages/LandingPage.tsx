import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Gamepad2, TrendingUp, MessageCircle, BookOpen, Trophy } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Our intelligent tutor adapts to your learning pace and explains each Vedic sutra step by step.",
  },
  {
    icon: Gamepad2,
    title: "Gamified Experience",
    description: "Earn Sutra Coins, Mastery Stones, and Speed Stars as you progress through levels.",
  },
  {
    icon: TrendingUp,
    title: "Adaptive Difficulty",
    description: "Problems adjust in real-time based on your accuracy, speed, and mastery level.",
  },
  {
    icon: MessageCircle,
    title: "Ask Anything",
    description: "Chat with the AI tutor anytime — type or speak your doubts and get instant explanations.",
  },
  {
    icon: BookOpen,
    title: "16 Vedic Sutras",
    description: "Master all 16 sutras of Vedic Mathematics with structured, progressive lessons.",
  },
  {
    icon: Trophy,
    title: "Track Your Growth",
    description: "Visualize progress with charts showing mastery, speed, and accuracy improvements.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            <span className="font-display text-xl font-bold text-foreground">VedicMind</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#sutras" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sutras</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        </div>
        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-2"
            >
              <span className="text-sm font-medium text-saffron-light">✨ AI-Powered Vedic Mathematics</span>
            </motion.div>
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-secondary-foreground md:text-7xl">
              Master Math the{" "}
              <span className="text-gradient-gold">Ancient Way</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-secondary-foreground/70">
              Discover the power of Vedic Mathematics through an AI-guided, gamified learning experience. 
              Solve problems 10x faster with ancient wisdom and modern technology.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup">Start Learning Free →</Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/dashboard">Explore Demo</Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "16", label: "Vedic Sutras" },
                { value: "10x", label: "Faster Solving" },
                { value: "AI", label: "Powered Tutor" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold text-saffron-light">{stat.value}</div>
                  <div className="text-sm text-secondary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-4xl font-bold text-foreground">
              Why <span className="text-gradient-saffron">VedicMind</span>?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A complete learning ecosystem that combines ancient Vedic Mathematics with cutting-edge AI technology.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg gradient-saffron">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="gradient-indigo py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-4xl font-bold text-secondary-foreground">
              Your Learning Journey
            </h2>
            <p className="mx-auto max-w-2xl text-secondary-foreground/70">
              From beginner to Vedic Math master — here's how VedicMind guides you.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Sign Up", desc: "Create your profile and set your learning goals", icon: "🎯" },
              { step: "02", title: "Learn Sutras", desc: "AI tutor teaches you each sutra with examples", icon: "📚" },
              { step: "03", title: "Practice", desc: "Solve adaptive problems and get instant feedback", icon: "✍️" },
              { step: "04", title: "Master", desc: "Track progress, earn rewards, and level up", icon: "🏆" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-saffron/20 text-3xl">
                  {s.icon}
                </div>
                <div className="mb-2 font-display text-sm font-semibold text-saffron-light">Step {s.step}</div>
                <h3 className="mb-2 font-display text-xl font-bold text-secondary-foreground">{s.title}</h3>
                <p className="text-sm text-secondary-foreground/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl gradient-saffron p-12 text-center shadow-elevated"
          >
            <h2 className="mb-4 font-display text-4xl font-bold text-primary-foreground">
              Ready to Think Faster?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
              Join thousands of students mastering mental mathematics with the ancient power of Vedic Sutras and modern AI.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth?mode=signup">Begin Your Journey →</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕉️</span>
            <span className="font-display font-bold text-foreground">VedicMind</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 VedicMind. Ancient wisdom, modern learning.</p>
        </div>
      </footer>
    </div>
  );
}
