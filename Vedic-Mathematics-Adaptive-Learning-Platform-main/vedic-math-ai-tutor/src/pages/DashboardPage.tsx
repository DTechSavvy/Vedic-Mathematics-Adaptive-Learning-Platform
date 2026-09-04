import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { sutras } from "@/data/vedic-sutras";
import { BookOpen, Flame, Target, Zap } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Sutras Learned", value: "3/16", icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Current Streak", value: "5 days", icon: Flame, color: "bg-destructive/10 text-destructive" },
    { label: "Accuracy", value: "87%", icon: Target, color: "bg-accent/10 text-accent" },
    { label: "Speed Score", value: "142", icon: Zap, color: "bg-gold/10 text-gold" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-3xl font-bold text-foreground">Welcome back, Student! 🙏</h1>
          <p className="mb-8 text-muted-foreground">Continue your Vedic Mathematics journey</p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Gamification bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-xl border border-border bg-card p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <div className="font-display text-lg font-bold text-foreground">250</div>
                <div className="text-xs text-muted-foreground">Sutra Coins</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div>
                <div className="font-display text-lg font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground">Mastery Stones</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-display text-lg font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground">Speed Stars</div>
              </div>
            </div>
            <div className="ml-auto">
              <Link to="/rewards">
                <Button variant="outline" size="sm">View All Rewards</Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Continue Learning */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">Continue Learning</h2>
          <Link to="/learn">
            <Button variant="ghost" size="sm">View All →</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sutras.slice(0, 3).map((sutra, i) => (
            <motion.div
              key={sutra.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link
                to={`/learn?sutra=${sutra.id}`}
                className="block rounded-xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{sutra.icon}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    sutra.difficulty === 'beginner' ? 'bg-accent/10 text-accent' :
                    sutra.difficulty === 'intermediate' ? 'bg-primary/10 text-primary' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {sutra.difficulty}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-sm font-semibold text-foreground line-clamp-1">{sutra.name}</h3>
                <p className="mb-3 text-xs text-muted-foreground">"{sutra.meaning}"</p>
                <div className="h-1.5 rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full gradient-saffron"
                    style={{ width: i === 0 ? '80%' : i === 1 ? '45%' : '10%' }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            to="/tutor"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-indigo text-2xl">🤖</div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Ask AI Tutor</h3>
              <p className="text-sm text-muted-foreground">Get help with any doubt</p>
            </div>
          </Link>
          <Link
            to="/practice"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-saffron text-2xl">✍️</div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Quick Practice</h3>
              <p className="text-sm text-muted-foreground">5 adaptive problems</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
