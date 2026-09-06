import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { api, LeaderboardUser } from "@/lib/api";
import { Trophy, Flame, Zap, Award, Loader2 } from "lucide-react";

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error("Leaderboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-2xl lg:text-3xl font-bold text-foreground">
            🏆 Rewards & Global Leaderboard
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">Your achievements and global Vedic scholar ranking</p>
        </motion.div>

        {/* Currency & Tokens */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: "🪙", name: "Sutra Coins", value: 250, desc: "Earned for correct answers" },
            { icon: "💎", name: "Mastery Stones", value: 3, desc: "Sutra completions" },
            { icon: "⭐", name: "Speed Stars", value: 12, desc: "Fast mental solving" },
            { icon: "🌿", name: "Tree Level", value: 3, desc: "Wisdom tree growth" },
          ].map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center"
            >
              <div className="text-3xl mb-1">{r.icon}</div>
              <div className="font-display text-2xl font-bold text-foreground">{r.value}</div>
              <div className="font-display text-sm font-semibold text-foreground mt-0.5">{r.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Wisdom Tree Growth */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">🌳 Wisdom Tree Progression</h2>
          <div className="flex items-end justify-center gap-6 py-4">
            {treeStages.map((stage) => (
              <div key={stage.level} className={`text-center ${!stage.unlocked ? "opacity-30" : ""}`}>
                <div className={`text-4xl mb-2 ${stage.unlocked ? "animate-float" : ""}`}>{stage.emoji}</div>
                <div className="text-xs font-semibold text-foreground">{stage.name}</div>
                <div className="text-[10px] text-muted-foreground">Level {stage.level}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" /> Top Vedic Scholars (Global Top 10)
            </h2>
            <span className="text-xs text-muted-foreground">Ranked by Total XP</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
              Loading rankings...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground italic">
              No students ranked yet. Complete practice questions to claim Rank #1!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 font-semibold w-16">Rank</th>
                    <th className="pb-3 font-semibold">Scholar</th>
                    <th className="pb-3 font-semibold">Level</th>
                    <th className="pb-3 font-semibold">Streak</th>
                    <th className="pb-3 font-semibold text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 font-display font-bold">
                        {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                      </td>
                      <td className="py-3.5 font-medium text-foreground">
                        {user.name || user.email.split("@")[0]}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]">
                          Lv. {user.level}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-destructive flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" /> {user.streak}d
                      </td>
                      <td className="py-3.5 text-right font-display font-bold text-primary">
                        {user.xp} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Badges Collection */}
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">🏅 Achievement Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              <div className="text-xs text-muted-foreground mt-0.5">{badge.desc}</div>
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
