import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  api,
  UserProfile,
  UserProgressOverview,
  TopicProgressItem,
  RecommendationResult
} from "@/lib/api";
import {
  BookOpen,
  Flame,
  Target,
  Zap,
  Trophy,
  Sparkles,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressOverview | null>(null);
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, progressData, topicsData, recData] = await Promise.allSettled([
        api.getProfile(),
        api.getProgressMe(),
        api.getProgressTopics(),
        api.getRecommendation(),
      ]);

      if (profileData.status === "fulfilled") setProfile(profileData.value);
      if (progressData.status === "fulfilled") setProgress(progressData.value);
      if (topicsData.status === "fulfilled") setTopics(topicsData.value);
      if (recData.status === "fulfilled") setRecommendation(recData.value);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.name || profile?.email?.split("@")[0] || "Vedic Scholar";
  const userXP = profile?.xp ?? 0;
  const userLevel = profile?.level ?? 1;
  const userStreak = profile?.streak ?? 0;
  const accuracy = progress?.accuracy ?? 0;
  const totalSolved = progress?.totalQuestions ?? 0;

  const stats = [
    {
      label: "Vedic Level",
      value: `Level ${userLevel}`,
      icon: Trophy,
      color: "bg-primary/10 text-primary",
      subtext: `${userXP} total XP`
    },
    {
      label: "Current Streak",
      value: `${userStreak} Day${userStreak === 1 ? "" : "s"}`,
      icon: Flame,
      color: "bg-destructive/10 text-destructive",
      subtext: "Consistent practice"
    },
    {
      label: "Solving Accuracy",
      value: `${accuracy}%`,
      icon: Target,
      color: "bg-accent/10 text-accent",
      subtext: `${progress?.correctAnswers ?? 0} of ${totalSolved} correct`
    },
    {
      label: "Problems Solved",
      value: `${totalSolved}`,
      icon: Zap,
      color: "bg-gold/10 text-gold",
      subtext: "Vedic math attempts"
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                Welcome back, {displayName}! 🙏
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your personalized Vedic Mathematics mastery center
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/practice">
                <Button className="gradient-saffron text-primary-foreground text-xs font-semibold shadow-soft">
                  <PlayCircle className="h-4 w-4 mr-1.5" /> Quick Practice
                </Button>
              </Link>
              <Link to="/tutor">
                <Button variant="outline" className="text-xs font-semibold border-primary/30 hover:border-primary">
                  <Sparkles className="h-4 w-4 mr-1.5 text-primary" /> Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{stat.subtext}</div>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning & Recommendation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-soft gradient-soft"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommended Next Step
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {recommendation?.weakTopic
                  ? `Focus on: ${recommendation.weakTopic}`
                  : "Ready to accelerate your mental math?"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {recommendation?.recommendation ||
                  "Explore the Vedic Mathematics curriculum to unlock speed multiplication, squaring, and mental division."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/learn">
                <Button className="gradient-saffron text-primary-foreground font-semibold text-xs h-11 px-6 shadow-soft">
                  <BookOpen className="h-4 w-4 mr-1.5" /> Continue Learning
                </Button>
              </Link>
              <Link to="/tutor?prompt=Give me a quick 2-minute diagnostic question on Vedic mathematics">
                <Button variant="outline" className="text-xs font-semibold h-11 border-border">
                  Take Diagnostic
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Topic Mastery & Quick Links */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Topic Mastery Progress */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Topic Mastery Breakdown
              </h3>
              <Link to="/progress" className="text-xs font-semibold text-primary hover:underline">
                View Detailed Analytics →
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                Loading mastery stats...
              </div>
            ) : topics.length === 0 ? (
              <div className="py-8 text-center bg-muted/20 rounded-xl p-6 border border-border/50">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground font-medium mb-3">
                  No topic attempts recorded yet. Solve your first problem in Practice!
                </p>
                <Link to="/practice">
                  <Button size="sm" className="text-xs gradient-saffron text-primary-foreground font-semibold">
                    Start First Practice
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.slice(0, 5).map((topic, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {topic.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        {topic.topic}
                      </span>
                      <span className="font-mono text-muted-foreground">{topic.mastery}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          topic.completed ? "bg-accent" : "gradient-saffron"
                        }`}
                        style={{ width: `${Math.min(topic.mastery, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Learning Path Cards */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <span>🕉️</span> 16 Classical Sutras
              </h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Discover the 16 core aphorisms formulated by Swami Bharati Krishna Tirtha for lightning mental calculation.
              </p>
              <Link to="/learn">
                <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                  Browse Sutras Directory
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h4 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Global Leaderboard
              </h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Compete with other Vedic math students, earn Sutra coins, and climb the ranks.
              </p>
              <Link to="/rewards">
                <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                  View Leaderboard & Badges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
