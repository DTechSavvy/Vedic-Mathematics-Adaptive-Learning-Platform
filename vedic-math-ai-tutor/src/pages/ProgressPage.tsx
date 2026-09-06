import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  api,
  UserProgressOverview,
  TopicProgressItem,
  SpeedAnalytics,
  MentalAgilityResult
} from "@/lib/api";
import { Loader2, Target, Zap, TrendingUp, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgressOverview | null>(null);
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [speed, setSpeed] = useState<SpeedAnalytics | null>(null);
  const [mentalAgility, setMentalAgility] = useState<MentalAgilityResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [progRes, topRes, spdRes, agilRes] = await Promise.allSettled([
        api.getProgressMe(),
        api.getProgressTopics(),
        api.getSpeedAnalytics(),
        api.getMentalAgility(),
      ]);

      if (progRes.status === "fulfilled") setProgress(progRes.value);
      if (topRes.status === "fulfilled") setTopics(topRes.value);
      if (spdRes.status === "fulfilled") setSpeed(spdRes.value);
      if (agilRes.status === "fulfilled") setMentalAgility(agilRes.value);
    } catch (err) {
      console.error("Progress analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    topics.length > 0
      ? topics.map((t) => ({
          name: t.topic.length > 16 ? t.topic.slice(0, 14) + "..." : t.topic,
          mastery: t.mastery,
        }))
      : [
          { name: "Addition", mastery: 85 },
          { name: "Subtraction", mastery: 70 },
          { name: "Multiplication", mastery: 60 },
          { name: "Squaring", mastery: 40 },
        ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-2xl lg:text-3xl font-bold text-foreground">
            📈 Student Progress & Analytics
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Real-time tracking of your Vedic math accuracy, speed, and topic mastery
          </p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading performance data from database...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Total Problems Solved",
                  value: `${progress?.totalQuestions ?? 0}`,
                  emoji: "✍️",
                  sub: `${progress?.correctAnswers ?? 0} Correct`,
                },
                {
                  label: "Average Accuracy",
                  value: `${progress?.accuracy ?? 0}%`,
                  emoji: "🎯",
                  sub: "Across all attempts",
                },
                {
                  label: "Average Speed",
                  value: `${speed?.averageSpeedSeconds ?? 0}s`,
                  emoji: "⚡",
                  sub: "Per question",
                },
                {
                  label: "Mental Agility Score",
                  value: `${mentalAgility?.score ?? 0}`,
                  emoji: "🧠",
                  sub: "Accuracy × Speed",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center"
                >
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Topic Mastery Bar Chart */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Topic Mastery (%)
                  </h3>
                  <span className="text-xs text-muted-foreground">PostgreSQL Metrics</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="mastery" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Topics Breakdown List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Detailed Topic Status
                </h3>

                {topics.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
                    No topic progress recorded yet. Solve questions in Practice to generate analytics!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {topics.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-foreground">{t.topic}</span>
                          <span className="font-mono font-bold text-primary">{t.mastery}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.completed ? "bg-accent" : "gradient-saffron"
                            }`}
                            style={{ width: `${Math.min(t.mastery, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Action to Practice */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-center max-w-xl mx-auto">
              <h4 className="font-display font-bold text-base text-foreground mb-1">
                Keep Sharpening Your Vedic Agility 🕉️
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Solve more practice problems to level up your score and climb the global ranks.
              </p>
              <Link to="/practice">
                <Button className="gradient-saffron text-primary-foreground font-semibold text-xs px-6">
                  Go to Practice Arena
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
