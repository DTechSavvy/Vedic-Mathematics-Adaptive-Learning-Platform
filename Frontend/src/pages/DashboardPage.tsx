import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  api,
  UserProfile,
  UserProgressOverview,
  TopicProgressItem,
  RecommendationResult,
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
  Loader2,
  Coins,
  Gem,
  Star,
  Award,
  Sun,
  Moon,
  Compass,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

interface GreetingConfig {
  greeting: string;
  tagline: string;
  badge: string;
  periodIcon: React.ElementType;
  gradientText: string;
}

function getDynamicRealtimeGreeting(userName: string): GreetingConfig {
  const hour = new Date().getHours();
  const name = userName?.trim() || "Learner";

  if (hour >= 5 && hour < 12) {
    const morningOptions: GreetingConfig[] = [
      {
        greeting: `Good morning, ${name}!`,
        tagline: "A fresh dawn to awaken lightning mental calculations with Vedic Sutras.",
        badge: "Morning Clarity · 16 Sutras",
        periodIcon: Sun,
        gradientText: "from-amber-500 via-orange-500 to-amber-600",
      },
      {
        greeting: `Shubh Prabhat, ${name}!`,
        tagline: "Start your day with the timeless wisdom of ancient mathematical agility.",
        badge: "Golden Dawn Session",
        periodIcon: Sun,
        gradientText: "from-amber-600 via-amber-500 to-orange-500",
      },
      {
        greeting: `Rise & Calculate, ${name}!`,
        tagline: "Your morning drill sets an agile, high-speed pace for your entire day.",
        badge: "Early Momentum Active",
        periodIcon: Zap,
        gradientText: "from-orange-500 via-amber-500 to-yellow-500",
      },
    ];
    return morningOptions[Math.floor(Math.random() * morningOptions.length)];
  } else if (hour >= 12 && hour < 17) {
    const afternoonOptions: GreetingConfig[] = [
      {
        greeting: `Good afternoon, ${name}!`,
        tagline: "Keep your calculation momentum flowing through the midday hours.",
        badge: "Midday Power Hour",
        periodIcon: Zap,
        gradientText: "from-amber-500 via-orange-500 to-amber-600",
      },
      {
        greeting: `Shubh Madhyahan, ${name}!`,
        tagline: "Sharpen your mental multiplication, speed squaring, and algebraic proofs.",
        badge: "Adaptive Sutra Drill",
        periodIcon: Sun,
        gradientText: "from-orange-500 via-amber-500 to-amber-600",
      },
      {
        greeting: `Powering Up, ${name}!`,
        tagline: "Transform complex arithmetic into effortless, single-line mental solutions.",
        badge: "Agility Matrix Active",
        periodIcon: Sparkles,
        gradientText: "from-amber-600 via-orange-500 to-amber-500",
      },
    ];
    return afternoonOptions[Math.floor(Math.random() * afternoonOptions.length)];
  } else if (hour >= 17 && hour < 22) {
    const eveningOptions: GreetingConfig[] = [
      {
        greeting: `Good evening, ${name}!`,
        tagline: "Unwind with numbers and master subtle sutra patterns tonight.",
        badge: "Evening Focus Session",
        periodIcon: Moon,
        gradientText: "from-amber-500 via-orange-500 to-indigo-500",
      },
      {
        greeting: `Shubh Sandhya, ${name}!`,
        tagline: "Quiet your thoughts and let calculations flow effortlessly like water.",
        badge: "Vedic Wisdom Sanctuary",
        periodIcon: Moon,
        gradientText: "from-amber-600 via-orange-500 to-amber-500",
      },
      {
        greeting: `Evening Mastery, ${name}!`,
        tagline: "Celebrate today's accomplishments and protect your continuous streak.",
        badge: "Streak Protector Active",
        periodIcon: Sparkles,
        gradientText: "from-orange-500 via-amber-500 to-orange-600",
      },
    ];
    return eveningOptions[Math.floor(Math.random() * eveningOptions.length)];
  } else {
    const nightOptions: GreetingConfig[] = [
      {
        greeting: `Night Owl Session, ${name}!`,
        tagline: "Quiet midnight hours bring the sharpest clarity and deepest focus.",
        badge: "Midnight Sutra Study",
        periodIcon: Moon,
        gradientText: "from-amber-500 via-indigo-500 to-amber-600",
      },
      {
        greeting: `Late Night Wisdom, ${name}!`,
        tagline: "A quick mental drill before rest solidifies neural calculation pathways.",
        badge: "Deep Practice Mode",
        periodIcon: Sparkles,
        gradientText: "from-amber-500 via-orange-500 to-amber-400",
      },
      {
        greeting: `Quiet Hours, Sharp Mind!`,
        tagline: `While the world rests, your mathematical fluency reaches new peaks, ${name}.`,
        badge: "Night Clarity Active",
        periodIcon: Moon,
        gradientText: "from-orange-500 via-amber-500 to-indigo-400",
      },
    ];
    return nightOptions[Math.floor(Math.random() * nightOptions.length)];
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressOverview | null>(null);
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const handleStateSync = () => {
      loadDashboardData();
    };

    window.addEventListener("vedicmind:state-update", handleStateSync);
    return () => {
      window.removeEventListener("vedicmind:state-update", handleStateSync);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Authoritative aggregated single source of truth
      try {
        const overview = await api.getDashboardOverview();
        if (overview?.profile) {
          setProfile(overview.profile);
          setProgress({
            totalQuestions: overview.stats.totalQuestions,
            correctAnswers: overview.stats.correctAnswers,
            wrongAnswers: overview.stats.totalQuestions - overview.stats.correctAnswers,
            accuracy: overview.stats.accuracy,
            streakDays: overview.profile.streak,
          });
          if (overview.recentTopics) {
            setTopics(
              overview.recentTopics.map((m: any) => ({
                topicId: m.topicId,
                topic: m.topicTitle,
                mastery: m.masteryScore,
                completed: m.isMastered,
                status: m.status,
                totalAttempts: m.totalAttempts,
                accuracy: m.accuracy,
                recommendedAction: m.recommendedAction,
              }))
            );
          }
          if (overview.recommendation) {
            setRecommendation({
              weakTopic: overview.recommendation.recommendedTopicTitle,
              mastery: 0,
              recommendation: `${overview.recommendation.action} (${overview.recommendation.reason})`,
            });
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Authoritative dashboard overview fallback:", err);
      }

      // Legacy fallback
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

  const displayName = profile?.name || profile?.email?.split("@")[0] || "Student";
  const userLevel = profile?.level || 1;
  const userXP = profile?.xp || 0;
  const userStreak = profile?.streak ?? 0;
  const totalSolved = progress?.totalQuestions || 0;
  const accuracy = Math.round(progress?.accuracy || 0);

  // Dynamic Real-time greeting configured once per mount/user
  const greetingConfig = useMemo(() => {
    return getDynamicRealtimeGreeting(displayName);
  }, [displayName]);

  const stats = [
    {
      label: "Vedic Level",
      value: `Level ${userLevel}`,
      icon: Trophy,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      subtext: `${userXP} Total XP Earned`,
    },
    {
      label: "Active Streak",
      value: `${userStreak} Day${userStreak === 1 ? "" : "s"}`,
      icon: Flame,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      subtext: userStreak > 0 ? "Consecutive practice days" : "Start your streak today",
    },
    {
      label: "Solving Accuracy",
      value: `${accuracy}%`,
      icon: Target,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      subtext: `${progress?.correctAnswers ?? 0} of ${totalSolved} correct`,
    },
    {
      label: "Problems Solved",
      value: `${totalSolved}`,
      icon: Zap,
      color: "bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30",
      subtext: "Vedic calculation drills",
    },
  ];

  return (
    <AppLayout>
      <div className="p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto space-y-7">
        {/* Welcome Hero Banner with Vedic Gradients & Ambient Glow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 p-6 sm:p-8 lg:p-9 shadow-xl shadow-amber-950/5 backdrop-blur-md"
        >
          {/* Subtle Background Radial Ambient Glows */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Dynamic Real-Time Greeting Heading */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                <span className={`bg-gradient-to-r ${greetingConfig.gradientText} bg-clip-text text-transparent`}>
                  {greetingConfig.greeting}
                </span>{" "}
                <span className="inline-block transform hover:rotate-12 transition-transform duration-300 cursor-default">
                  🙏
                </span>
              </h1>

              {/* Dynamic Personalized Tagline */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {greetingConfig.tagline}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/practice">
                <Button className="h-11 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all duration-300 group">
                  <PlayCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Quick Practice Drill
                </Button>
              </Link>
              <Link to="/tutor">
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-xl border-amber-500/30 bg-background/80 hover:bg-amber-500/10 hover:border-amber-500/60 text-foreground font-semibold text-xs sm:text-sm transition-all duration-300 shadow-xs group"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500 group-hover:rotate-12 transition-transform" />
                  Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Currency & Academic Progression Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 sm:p-5 rounded-2xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-amber-500/30 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 text-xs sm:text-sm">
            {/* V-Coins */}
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
                <Coins className="h-4 w-4" />
              </span>
              <div>
                <div className="font-extrabold text-foreground">{profile?.coins ?? 0}</div>
                <div className="text-[11px] font-medium text-muted-foreground">V-Coins</div>
              </div>
            </div>

            <div className="h-6 w-px bg-border/80 hidden sm:block" />

            {/* Wisdom Stones */}
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
                <Gem className="h-4 w-4" />
              </span>
              <div>
                <div className="font-extrabold text-foreground">{profile?.wisdomStones ?? 0}</div>
                <div className="text-[11px] font-medium text-muted-foreground">Wisdom Stones</div>
              </div>
            </div>

            <div className="h-6 w-px bg-border/80 hidden sm:block" />

            {/* Stars */}
            <div className="flex items-center gap-2.5 font-bold text-foreground">
              <span className="p-2 rounded-xl bg-amber-400/15 text-amber-500 border border-amber-400/25 shadow-xs">
                <Star className="h-4 w-4 fill-amber-400/40" />
              </span>
              <div>
                <div className="font-extrabold text-foreground">{profile?.stars ?? 0}</div>
                <div className="text-[11px] font-medium text-muted-foreground">Stars Collected</div>
              </div>
            </div>

            <div className="h-6 w-px bg-border/80 hidden sm:block" />

            {/* Equipped Academic Title */}
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs">Title:</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                {profile?.equippedTitle || "Vedic Initiate"}
              </span>
            </div>
          </div>

          <Link to="/rewards">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10 flex items-center gap-1.5 transition-colors"
            >
              <span>Rewards Store & Wisdom Tree</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Live Academic Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stat.color} transition-transform group-hover:scale-105 duration-300`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>

              <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-foreground mt-1">{stat.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{stat.subtext}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Pedagogical Recommendation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-sm hover:border-amber-500/40 transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>AI Recommended Next Step</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {recommendation?.weakTopic
                  ? `Focus Recommendation: ${recommendation.weakTopic}`
                  : "Ready to accelerate your mental calculation speed?"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {recommendation?.recommendation ||
                  "Explore the structured Vedic Mathematics curriculum to master Nikhilam base multiplication, squaring, and recursive division."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/learn">
                <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              </Link>
              <Link to="/tutor?prompt=Give me a quick 2-minute diagnostic question on Vedic mathematics">
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold border-border hover:border-amber-400 hover:bg-amber-500/5"
                >
                  Take Diagnostic
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Lower Grid: Topic Mastery Breakdown & Quick Sutra Pathways */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Topic Mastery Progress Breakdown */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <span>Topic Mastery Progress</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {topics.length > 0
                    ? `${topics.length} Canonical Topics • ${
                        topics.filter((t) => t.completed || t.status === "MASTERED").length
                      } Mastered`
                    : "23 Canonical Curriculum Topics Available"}
                </p>
              </div>
              <Link
                to="/progress"
                className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Analytics</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-14 text-center text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500 mx-auto mb-2.5" />
                <span>Loading latest mastery analytics...</span>
              </div>
            ) : topics.length === 0 ? (
              <div className="py-10 text-center bg-muted/20 rounded-2xl p-6 border border-border/60">
                <GraduationCap className="h-9 w-9 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground font-medium mb-3">
                  No topic practice recorded yet. Solve your first problem to ignite your mastery matrix!
                </p>
                <Link to="/practice">
                  <Button size="sm" className="rounded-xl gradient-saffron text-white font-semibold text-xs">
                    Start First Practice Drill
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {[...topics]
                  .sort((a, b) => b.mastery - a.mastery)
                  .slice(0, 5)
                  .map((topic, i) => (
                    <div
                      key={i}
                      className="group p-3 rounded-xl border border-transparent hover:border-amber-500/20 hover:bg-amber-500/5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                        <span className="font-semibold text-foreground flex items-center gap-2 truncate">
                          {topic.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : topic.mastery > 0 ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                          ) : (
                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
                          )}
                          {topic.topicId ? (
                            <Link
                              to={`/practice?topicId=${topic.topicId}`}
                              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate"
                            >
                              {topic.topic}
                            </Link>
                          ) : (
                            <span className="truncate">{topic.topic}</span>
                          )}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {topic.mastery}%
                          </span>
                          {topic.topicId && (
                            <Link
                              to={`/practice?topicId=${topic.topicId}`}
                              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Practice →
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            topic.completed
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-amber-500 to-orange-500"
                          }`}
                          style={{ width: `${Math.min(topic.mastery, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Quick Learning & Sutra Pathways Cards */}
          <div className="space-y-4">
            {/* 16 Classical Sutras Directory */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-2xl group-hover:scale-110 transition-transform select-none">
                  🕉️
                </span>
                <h4 className="font-display font-bold text-base text-foreground">
                  16 Classical Sutras
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Discover the 16 core aphorisms formulated by Swami Bharati Krishna Tirtha for lightning mental calculation.
              </p>
              <Link to="/learn">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold hover:border-amber-400 hover:bg-amber-500/5 group"
                >
                  <span>Explore Sutras Directory</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Global Leaderboard & Soul Badges */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Trophy className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-base text-foreground">
                  Leaderboard & Badges
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Compete with Vedic mathematics students worldwide, earn wisdom stones, and level up your soul tree.
              </p>
              <Link to="/rewards">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold hover:border-amber-400 hover:bg-amber-500/5 group"
                >
                  <span>View Rewards & Rankings</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* AI Tutor Quick Access */}
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-base text-foreground">
                  Interactive AI Tutor
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Stuck on a calculation? Speak your question or upload handwriting for step-by-step guidance.
              </p>
              <Link to="/tutor">
                <Button
                  size="sm"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600"
                >
                  <span>Launch AI Tutor Session</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
