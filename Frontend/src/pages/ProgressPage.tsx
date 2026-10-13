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
  CartesianGrid,
} from "recharts";
import {
  api,
  UserProgressOverview,
  TopicProgressItem,
  SutraProgressItem,
  DifficultyProgressMap,
  SpeedAnalytics,
  MentalAgilityResult,
} from "@/lib/api";
import {
  Loader2,
  Target,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgressOverview | null>(null);
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [sutras, setSutras] = useState<SutraProgressItem[]>([]);
  const [difficultyMap, setDifficultyMap] = useState<DifficultyProgressMap | null>(null);
  const [speed, setSpeed] = useState<SpeedAnalytics | null>(null);
  const [mentalAgility, setMentalAgility] = useState<MentalAgilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  type TopicFilterType =
    | "ALL"
    | "MASTERED"
    | "IN_PROGRESS"
    | "REVIEW_REQUIRED"
    | "NOT_STARTED";
  const [topicFilter, setTopicFilter] = useState<TopicFilterType>("ALL");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [progRes, topRes, sutraRes, diffRes, spdRes, agilRes] =
        await Promise.allSettled([
          api.getProgressMe(),
          api.getProgressTopics(),
          api.getProgressSutras(),
          api.getProgressDifficulty(),
          api.getSpeedAnalytics(),
          api.getMentalAgility(),
        ]);

      if (progRes.status === "fulfilled") setProgress(progRes.value);
      if (topRes.status === "fulfilled") setTopics(topRes.value);
      if (sutraRes.status === "fulfilled") setSutras(sutraRes.value);
      if (diffRes.status === "fulfilled") setDifficultyMap(diffRes.value);
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
      ? topics.slice(0, 8).map((t) => ({
          name: t.topic.length > 14 ? t.topic.slice(0, 12) + "..." : t.topic,
          mastery: t.mastery,
        }))
      : [
          { name: "Addition", mastery: 85 },
          { name: "Subtraction", mastery: 70 },
          { name: "Multiplication", mastery: 60 },
          { name: "Squaring", mastery: 40 },
        ];

  const isMastered = (t: TopicProgressItem) =>
    t.isMastered || t.status === "MASTERED" || t.status === "COMPLETED";
  const isInProgress = (t: TopicProgressItem) =>
    !isMastered(t) &&
    (t.status === "DEVELOPING" ||
      t.status === "PRACTICING" ||
      t.status === "IN_PROGRESS" ||
      t.status === "LEARNING");
  const isReviewRequired = (t: TopicProgressItem) =>
    t.status === "REVIEW_REQUIRED";
  const isNotStarted = (t: TopicProgressItem) =>
    t.status === "NOT_STARTED" || (!t.status && !t.totalAttempts);

  const filteredTopics = topics.filter((t) => {
    if (topicFilter === "ALL") return true;
    if (topicFilter === "MASTERED") return isMastered(t);
    if (topicFilter === "IN_PROGRESS") return isInProgress(t);
    if (topicFilter === "REVIEW_REQUIRED") return isReviewRequired(t);
    if (topicFilter === "NOT_STARTED") return isNotStarted(t);
    return true;
  });

  const masteredCount = topics.filter(isMastered).length;
  const inProgressCount = topics.filter(isInProgress).length;
  const reviewCount = topics.filter(isReviewRequired).length;
  const notStartedCount = topics.filter(isNotStarted).length;

  const difficultiesList = ["EASY", "MEDIUM", "ADVANCED", "EXPERT"] as const;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-2xl lg:text-3xl font-bold text-foreground">
            📈 Student Progress & Mastery Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time tracking of your accuracy, Vedic agility, and mastery across all 16 Sutras
          </p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading performance data from database...</p>
          </div>
        ) : (
          <>
            {/* Core Metrics Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                  value: `${speed?.averageSpeedSeconds ?? speed?.averageTime ?? 0}s`,
                  emoji: "⚡",
                  sub: "Per question",
                },
                {
                  label: "Mental Agility Score",
                  value: `${mentalAgility?.score ?? mentalAgility?.mentalAgilityScore ?? 0}`,
                  emoji: "🧠",
                  sub: "Accuracy × Speed composite",
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
                  <div className="text-sm font-semibold text-foreground mt-0.5">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Cognitive Difficulty Tiers Breakdown */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Practice Difficulty Tiers
                </h3>
                <span className="text-xs text-muted-foreground">Progressive Milestone Unlocking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {difficultiesList.map((tier) => {
                  const item = difficultyMap ? difficultyMap[tier] : null;
                  const isUnlocked = item ? item.unlocked : tier === "EASY";
                  const total = item ? item.totalAttempts : 0;
                  const accuracy = item ? item.accuracy : 0;

                  return (
                    <div
                      key={tier}
                      className={`p-4 rounded-xl border transition-all ${
                        isUnlocked
                          ? "bg-card border-border hover:border-primary/50 shadow-soft"
                          : "bg-muted/20 border-border/50 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                          {tier}
                        </span>
                        {isUnlocked ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs sm:text-sm mb-3">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Attempts:</span>
                          <span className="font-semibold text-foreground">{total}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Accuracy:</span>
                          <span className="font-semibold text-foreground">{accuracy}%</span>
                        </div>
                      </div>

                      <Link to={`/practice?difficulty=${tier}`}>
                        <Button
                          size="sm"
                          variant={isUnlocked ? "default" : "outline"}
                          disabled={!isUnlocked}
                          className={`w-full text-xs font-semibold h-8 rounded-lg ${
                            isUnlocked ? "gradient-saffron text-primary-foreground" : ""
                          }`}
                        >
                          {isUnlocked ? "Practice Tier" : "Locked"}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 16 Canonical Sutras Mastery Grid */}
            {sutras.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                      <span>🕉️</span> 16 Canonical Vedic Sutras Progress
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Detailed accuracy, practice attempts, and status for each classical aphorism
                    </p>
                  </div>
                  <Link to="/practice">
                    <Button size="sm" variant="outline" className="text-xs font-semibold">
                      Practice Any Sutra →
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sutras.map((sutra) => (
                    <div
                      key={sutra.sutraId}
                      className="p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-mono font-bold text-primary">
                            {sutra.sutraId.replace("sutra-", "Sutra ").replace(/^Sutra 0?(\d+)/, "Sutra $1")}
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              sutra.status === "MASTERED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : sutra.status === "PRACTICING"
                                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {sutra.status.replace("_", " ")}
                          </span>
                        </div>

                        <h4 className="font-display text-sm font-bold text-foreground truncate mb-1">
                          {sutra.sutraName}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 italic mb-2.5">
                          "{sutra.englishMeaning}"
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">{sutra.attemptsCount} attempts</span>
                          <span className="font-mono font-bold text-foreground">
                            {sutra.attemptsCount === 0 || sutra.accuracy === null
                              ? "Not attempted"
                              : `${sutra.accuracy}% acc`}
                          </span>
                        </div>

                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2.5">
                          <div
                            className={`h-full rounded-full ${
                              sutra.mastery >= 80 ? "bg-accent" : "gradient-saffron"
                            }`}
                            style={{ width: `${Math.min(sutra.mastery, 100)}%` }}
                          />
                        </div>

                        <Link to={`/practice/sutra/${sutra.sutraId}`}>
                          <Button size="sm" variant="outline" className="w-full text-xs h-7 rounded-lg font-medium">
                            Practice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Mastery Chart & Curriculum Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Mastery Bar Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
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
              </div>

              {/* Complete Curriculum Topics Status List */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Curriculum Topics ({topics.length})
                    </h3>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setTopicFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        topicFilter === "ALL"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      All ({topics.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicFilter("MASTERED")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        topicFilter === "MASTERED"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Mastered ({masteredCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicFilter("IN_PROGRESS")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        topicFilter === "IN_PROGRESS"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      In Progress ({inProgressCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicFilter("REVIEW_REQUIRED")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        topicFilter === "REVIEW_REQUIRED"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Needs Review ({reviewCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicFilter("NOT_STARTED")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        topicFilter === "NOT_STARTED"
                          ? "bg-muted text-foreground font-semibold shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Not Started ({notStartedCount})
                    </button>
                  </div>

                  {filteredTopics.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No topics match the selected filter.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {filteredTopics.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5"
                        >
                          {/* Header row: Status, Title, Mastery %, Action Buttons */}
                          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 truncate">
                              {isMastered(t) ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              ) : isReviewRequired(t) ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                              ) : isInProgress(t) ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40 shrink-0" />
                              )}
                              <span className="font-semibold text-foreground truncate text-sm">{t.topic}</span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span
                                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isMastered(t)
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : isReviewRequired(t)
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                    : isInProgress(t)
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                                }`}
                              >
                                {t.status?.replace("_", " ") || "NOT STARTED"}
                              </span>
                              <span className="font-mono font-bold text-sm sm:text-base text-primary">
                                {t.mastery}%
                              </span>
                              {t.topicId && (
                                <Link to={`/practice?topicId=${t.topicId}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-3 text-xs font-semibold"
                                  >
                                    Practice
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Overall Mastery Progress Bar */}
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isMastered(t)
                                  ? "bg-emerald-500"
                                  : "gradient-saffron"
                              }`}
                              style={{ width: `${Math.min(t.mastery, 100)}%` }}
                            />
                          </div>

                          {/* 5-Component Mastery Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                            {/* 1. Content Completion Gate */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/50">
                              <span className="text-muted-foreground">Content:</span>
                              <span className={`font-semibold ${
                                (t.contentCompletion ?? 0) >= 100
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}>
                                {(t.contentCompletion ?? 0) >= 100 ? "Read ✓" : `${t.contentCompletion ?? 0}%`}
                              </span>
                            </div>

                            {/* 2. Practice Volume (Target: 50) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/50">
                              <span className="text-muted-foreground">Practice:</span>
                              <span className={`font-semibold ${
                                (t.totalAttempts ?? 0) >= 50
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground"
                              }`}>
                                {t.totalAttempts ?? 0}/50
                              </span>
                            </div>

                            {/* 3. Lifetime Accuracy (Target: 75%) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/50">
                              <span className="text-muted-foreground">Acc:</span>
                              <span className={`font-semibold ${
                                (t.totalAttempts ?? 0) === 0 || t.accuracy === null
                                  ? "text-muted-foreground italic"
                                  : (t.accuracy ?? 0) >= 75
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground"
                              }`}>
                                {(t.totalAttempts ?? 0) === 0 || t.accuracy === null
                                  ? "Not attempted"
                                  : `${t.accuracy}% ${(t.accuracy ?? 0) >= 75 ? "✓" : ""}`}
                              </span>
                            </div>

                            {/* 4. Recent Accuracy (Target: 80%) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/50">
                              <span className="text-muted-foreground">Recent:</span>
                              <span className={`font-semibold ${
                                (t.totalAttempts ?? 0) === 0 || t.recentAccuracy === null
                                  ? "text-muted-foreground italic"
                                  : (t.recentAccuracy ?? 0) >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground"
                              }`}>
                                {(t.totalAttempts ?? 0) === 0 || t.recentAccuracy === null
                                  ? "—"
                                  : `${t.recentAccuracy}% ${(t.recentAccuracy ?? 0) >= 80 ? "✓" : ""}`}
                              </span>
                            </div>
                          </div>

                          {/* Difficulty Tier Coverage Bar */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span className="text-xs font-medium">Tiers Covered:</span>
                            <div className="flex items-center gap-1.5 font-semibold text-xs">
                              <span className={`px-2 py-0.5 rounded ${
                                (t.difficultyCoverage?.easyAttempts ?? 0) > 0
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                Easy {(t.difficultyCoverage?.easyAttempts ?? 0) > 0 ? "✓" : "—"}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${
                                (t.difficultyCoverage?.mediumAttempts ?? 0) > 0
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                Med {(t.difficultyCoverage?.mediumAttempts ?? 0) > 0 ? "✓" : "—"}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${
                                (t.difficultyCoverage?.advancedAttempts ?? 0) > 0
                                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                Adv {(t.difficultyCoverage?.advancedAttempts ?? 0) > 0 ? "✓" : "—"}
                              </span>
                            </div>
                          </div>

                          {/* Recommended Next Pedagogical Action */}
                          {t.recommendedAction && (
                            <div className="mt-1 p-2.5 rounded-lg bg-card/60 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate"><strong className="text-foreground">Next:</strong> {t.recommendedAction}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
