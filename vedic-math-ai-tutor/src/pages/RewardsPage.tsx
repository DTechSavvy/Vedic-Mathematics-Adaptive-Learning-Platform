import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";

const badges = [
  { name: "First Steps", icon: "🏅", desc: "Completed your first sutra", earned: true },
  { name: "Quick Learner", icon: "⚡", desc: "Solved 10 problems in a row", earned: true },
  { name: "Nikhilam Master", icon: "🔢", desc: "Mastered the Nikhilam sutra", earned: true },
  { name: "Speed Demon", icon: "🏎️", desc: "Solved 5 problems under 10 seconds", earned: false },
  { name: "Streak King", icon: "🔥", desc: "Maintained a 7-day streak", earned: false },
  { name: "Vedic Scholar", icon: "📚", desc: "Learned all 16 sutras", earned: false },
  { name: "Perfect Score", icon: "💯", desc: "100% accuracy on a practice set", earned: false },
  { name: "Math Wizard", icon: "🧙", desc: "Reached Level 10", earned: false },
];

const treeStages = [
  { level: 1, emoji: "🌱", name: "Seed", unlocked: true },
  { level: 2, emoji: "🌿", name: "Sprout", unlocked: true },
  { level: 3, emoji: "🪴", name: "Sapling", unlocked: true },
  { level: 4, emoji: "🌲", name: "Young Tree", unlocked: false },
  { level: 5, emoji: "🌳", name: "Wisdom Tree", unlocked: false },
];

export default function RewardsPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">🏆 Rewards & Achievements</h1>
          <p className="mb-8 text-sm text-muted-foreground">Your gamification progress</p>
        </motion.div>

        {/* Currency */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: "🪙", name: "Sutra Coins", value: 250, desc: "Correct answers" },
            { icon: "💎", name: "Mastery Stones", value: 3, desc: "Sutra completions" },
            { icon: "⭐", name: "Speed Stars", value: 12, desc: "Fast solving" },
            { icon: "🌿", name: "Tree Level", value: 3, desc: "Continuous learning" },
          ].map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5 shadow-soft text-center"
            >
              <div className="text-3xl mb-2">{r.icon}</div>
              <div className="font-display text-2xl font-bold text-foreground">{r.value}</div>
              <div className="font-display text-sm font-semibold text-foreground">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Wisdom Tree */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">🌳 Wisdom Tree Growth</h2>
          <div className="flex items-end justify-center gap-6">
            {treeStages.map((stage) => (
              <div key={stage.level} className={`text-center ${!stage.unlocked ? "opacity-30" : ""}`}>
                <div className={`text-4xl mb-2 ${stage.unlocked ? "animate-float" : ""}`}>{stage.emoji}</div>
                <div className="text-xs font-semibold text-foreground">{stage.name}</div>
                <div className="text-xs text-muted-foreground">Lv.{stage.level}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">🏅 Badges</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`rounded-xl border border-border bg-card p-4 text-center shadow-soft ${
                !badge.earned ? "opacity-40 grayscale" : ""
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-display text-sm font-semibold text-foreground">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.desc}</div>
              {badge.earned && (
                <div className="mt-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  ✓ Earned
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
