import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  api,
  LessonPagesResponse,
  LearningPageDetail,
  LearningPageSummary,
  LearningResourceItem,
} from "@/lib/api";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  PlayCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  Loader2,
  Video,
  ExternalLink,
  ShieldCheck,
  ListOrdered,
  Layers,
  HelpCircle,
  Award,
  RotateCcw,
} from "lucide-react";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Curriculum & Multi-Page State
  const [lessonData, setLessonData] = useState<LessonPagesResponse | null>(null);
  const [currentPage, setCurrentPage] = useState<LearningPageDetail | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  // Page Completion & Reward State
  const [completingPage, setCompletingPage] = useState(false);
  const [lessonCompletedReward, setLessonCompletedReward] = useState<{
    earnedXP: number;
    earnedCoins: number;
  } | null>(null);

  // Time spent tracking
  const pageStartTimeRef = useRef<number>(Date.now());

  // 1. Initial Load of Lesson and Page List
  useEffect(() => {
    if (!lessonId) return;
    const lid = Number(lessonId);
    loadLessonPages(lid);
  }, [lessonId]);

  // 2. Fetch specific page details when selectedPageId changes
  useEffect(() => {
    if (!lessonId || !selectedPageId) return;
    loadPageDetails(Number(lessonId), selectedPageId);
    pageStartTimeRef.current = Date.now();
  }, [lessonId, selectedPageId]);

  const loadLessonPages = async (lid: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getLessonPages(lid);
      setLessonData(res);

      const pagesList = res.pages || [];

      // Determine initial page to show when pages exist:
      // Priority: query param > lastVisitedPageId > first uncompleted page > first page
      if (pagesList.length > 0) {
        let targetId: number | null = null;
        if (pageParam) {
          const found = pagesList.find(
            (p) => String(p.id) === pageParam || p.slug === pageParam
          );
          if (found) targetId = found.id;
        }

        if (!targetId && res.lastVisitedPageId) {
          const found = pagesList.find((p) => p.id === res.lastVisitedPageId);
          if (found) targetId = found.id;
        }

        if (!targetId) {
          const firstUncompleted = pagesList.find((p) => !p.isCompleted);
          targetId = firstUncompleted ? firstUncompleted.id : pagesList[0]?.id;
        }

        if (targetId) {
          setSelectedPageId(targetId);
        }
      } else {
        setSelectedPageId(null);
        setCurrentPage(null);
      }
    } catch (err: any) {
      console.error("Failed to load lesson pages:", err);
      setError(err.message || "Failed to load multi-page curriculum for this lesson.");
    } finally {
      setLoading(false);
    }
  };

  const loadPageDetails = async (lid: number, pid: number) => {
    try {
      setPageLoading(true);
      const pageDetail = await api.getPageDetails(lid, pid);
      setCurrentPage(pageDetail);

      // Notify backend that user started this page
      api.startLearningPage(lid, pid).catch(() => {});
    } catch (err: any) {
      console.warn("Failed to load page details:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSelectPage = (page: LearningPageSummary) => {
    if (page.id === selectedPageId) return;
    setSelectedPageId(page.id);
    setSearchParams({ page: page.slug });
  };

  const handleMarkPageComplete = async () => {
    if (!lessonId || !selectedPageId || completingPage) return;
    try {
      setCompletingPage(true);
      const elapsedSeconds = Math.max(
        5,
        Math.floor((Date.now() - pageStartTimeRef.current) / 1000)
      );

      const res = await api.completeLearningPage(
        Number(lessonId),
        selectedPageId,
        elapsedSeconds
      );

      // Update local page completion status
      setLessonData((prev) => {
        if (!prev) return prev;
        const updatedPages = prev.pages.map((p) =>
          p.id === selectedPageId ? { ...p, isCompleted: true } : p
        );
        const completedCount = updatedPages.filter((p) => p.isCompleted).length;
        return {
          ...prev,
          pages: updatedPages,
          stats: {
            ...prev.stats,
            completedPages: completedCount,
            progressPercentage: Math.round(
              (completedCount / updatedPages.length) * 100
            ),
          },
        };
      });

      if (currentPage) {
        setCurrentPage({
          ...currentPage,
          isCompleted: true,
          progress: {
            isCompleted: true,
            timeSpentSeconds: elapsedSeconds,
            lastVisitedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        });
      }

      // Check if this action completed the entire lesson
      if (res?.isLessonCompleted) {
        setLessonCompletedReward({
          earnedXP: res.earnedXP || 50,
          earnedCoins: res.earnedCoins || 25,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vedicmind:state-update", { detail: res })
          );
        }
      }

      // Automatically advance to the next page if one exists
      if (currentPage?.navigation.nextPage) {
        setSelectedPageId(currentPage.navigation.nextPage.id);
        setSearchParams({ page: currentPage.navigation.nextPage.slug });
      }
    } catch (err: any) {
      console.error("Failed to complete learning page:", err);
    } finally {
      setCompletingPage(false);
    }
  };

  const getPageTypeBadge = (type: string) => {
    switch (type) {
      case "INTRODUCTION":
        return { label: "Introduction", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "THEORY":
        return { label: "Concept & Theory", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
      case "SUTRA_TECHNIQUE":
        return { label: "Sutra Technique", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "WORKED_EXAMPLE":
      case "WORKED_EXAMPLES":
        return { label: "Worked Example", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "COMMON_MISTAKES":
      case "COMMON_ERRORS":
        return { label: "Common Pitfalls", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
      case "APPLICATIONS":
        return { label: "Real Applications", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" };
      case "SUMMARY":
        return { label: "Summary & Takeaways", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      default:
        return { label: "Lesson Page", color: "bg-primary/10 text-primary border-primary/20" };
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <Loader2 className="h-9 w-9 animate-spin text-primary mb-3" />
          <h3 className="font-display font-bold text-foreground text-base">
            Loading Vedic Learning Module...
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Fetching structured multi-page content, formulas, worked proofs, and verified resources.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (error || !lessonData) {
    const isAuthError =
      error?.toLowerCase().includes("unauthorized") ||
      error?.toLowerCase().includes("jwt") ||
      error?.toLowerCase().includes("forbidden");
    const isNotFound =
      error?.toLowerCase().includes("not found") ||
      error?.toLowerCase().includes("cannot find");

    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground mb-1">
              {isAuthError
                ? "Sign-In Required"
                : isNotFound
                ? "Curriculum Topic or Lesson Not Found"
                : "Unable to Load Lesson Module"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || "Unable to locate or render this Vedic Mathematics lesson module."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isAuthError ? (
                <Button
                  onClick={() => navigate("/auth")}
                  className="gradient-saffron text-primary-foreground text-xs font-semibold"
                >
                  Sign In to Continue
                </Button>
              ) : (
                <Button
                  onClick={() => lessonId && loadLessonPages(Number(lessonId))}
                  className="gradient-saffron text-primary-foreground text-xs font-semibold shadow-soft"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry Loading
                </Button>
              )}
              <Button onClick={() => navigate("/learn")} variant="outline" className="text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Curriculum
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Safe data unpacking with complete defensive fallbacks
  const lesson = lessonData.lesson || {
    id: Number(lessonId) || 0,
    title: (lessonData as any).lessonTitle || "Vedic Mathematics Lesson",
    topicId: Number(lessonId) || 0,
    topicTitle: "Curriculum Topic",
    moduleTitle: "Vedic Mathematics",
    sutra: null,
    technique: null,
  };
  const pages = lessonData.pages || [];
  const stats = lessonData.stats || {
    totalPages: pages.length,
    completedPages: (lessonData as any).completedPages || 0,
    progressPercentage: 0,
    totalEstimatedMinutes: 15,
  };
  const resources = lessonData.resources || [];
  const badgeInfo = currentPage ? getPageTypeBadge(currentPage.pageType) : null;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Top Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/learn" className="hover:text-foreground transition-colors flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Curriculum
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-muted-foreground truncate max-w-[150px]">
            {lesson.moduleTitle}
          </span>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link
            to={`/learn?topic=${lesson.topicId}`}
            className="hover:text-foreground font-medium text-foreground truncate max-w-[180px]"
          >
            {lesson.topicTitle}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-primary font-semibold truncate max-w-[200px]">
            {lesson.title}
          </span>
        </nav>

        {/* Lesson Header Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {lesson.technique && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> {lesson.technique}
                  </span>
                )}
                {lesson.sutra && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Sutra: {lesson.sutra}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto md:ml-0">
                  <Clock className="h-3 w-3" /> ~{stats.totalEstimatedMinutes} mins total
                </span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                {lesson.title}
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/tutor?lessonId=${lesson.id}&topicId=${lesson.topicId}&prompt=${encodeURIComponent(
                  `I am learning ${lesson.title} (Sutra: ${lesson.sutra || "Vedic Mathematics"}). Can you guide me through the main concept?`
                )}`}
              >
                <Button variant="outline" size="sm" className="text-xs border-primary/30 text-primary hover:bg-primary/5">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Ask AI Tutor
                </Button>
              </Link>
              <Link to={`/practice?topicId=${lesson.topicId}&lessonId=${lesson.id}`}>
                <Button size="sm" className="gradient-saffron text-primary-foreground text-xs font-semibold shadow-soft">
                  <PlayCircle className="h-3.5 w-3.5 mr-1" /> Practice Topic
                </Button>
              </Link>
            </div>
          </div>

          {/* Module Progress Bar */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">
                Progress: {stats.completedPages} of {stats.totalPages} Pages Completed
              </span>
              <span className="font-bold text-primary">{stats.progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full gradient-saffron rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Lesson Completed Celebration Modal/Banner */}
        {lessonCompletedReward && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Module Completed! Mastered with Honors 🎉
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You earned <span className="font-bold text-emerald-600 dark:text-emerald-400">+{lessonCompletedReward.earnedXP} XP</span> and <span className="font-bold text-amber-600 dark:text-amber-400">+{lessonCompletedReward.earnedCoins} V-Coins</span>.
                </p>
              </div>
            </div>
            <Link to={`/practice?topicId=${lesson.topicId}&lessonId=${lesson.id}`}>
              <Button size="sm" className="gradient-saffron text-primary-foreground text-xs font-semibold whitespace-nowrap">
                Start Topic Practice <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Empty State vs Multi-Page Content Grid */}
        {pages.length === 0 ? (
          /* SUCCESS_WITH_EMPTY_CONTENT: Topic has no multi-page content yet */
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-soft max-w-3xl mx-auto my-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Content is Being Prepared
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
              Structured multi-page proofs, historical context, and worked examples for{" "}
              <strong className="text-foreground">{lesson.title}</strong> are currently being curated. You can explore this topic with DWANDA AI Tutor or solve practice questions right now!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/tutor?topicId=${lesson.topicId}&prompt=${encodeURIComponent(
                  `Can you explain ${lesson.title} and the Vedic sutra ${lesson.sutra || "associated with it"}?`
                )}`}
              >
                <Button className="gradient-saffron text-primary-foreground text-xs font-semibold shadow-soft">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Ask AI Tutor
                </Button>
              </Link>
              <Link to={`/practice?topicId=${lesson.topicId}`}>
                <Button variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/5">
                  <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Practice Topic
                </Button>
              </Link>
              <Button onClick={() => navigate("/learn")} variant="ghost" className="text-xs text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Curriculum
              </Button>
            </div>
          </div>
        ) : (
          /* Main Grid: Left Drawer/Sidebar + Center Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDEBAR: Ordered Page Navigation & Resources */}
            <aside className="lg:col-span-4 space-y-4">
            {/* Page Directory Card */}
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-primary" /> Learning Steps
                </h3>
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {pages.length} Pages
                </span>
              </div>

              <div className="space-y-1.5">
                {pages.map((page, idx) => {
                  const isSelected = page.id === selectedPageId;
                  const isDone = !!page.isCompleted;

                  return (
                    <button
                      key={page.id}
                      onClick={() => handleSelectPage(page)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 text-foreground font-semibold shadow-xs"
                          : "bg-card border-border/60 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {/* Step Indicator */}
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : isSelected
                            ? "gradient-saffron text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Page Title & Type */}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-foreground">
                          {page.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{getPageTypeBadge(page.pageType).label}</span>
                          <span>•</span>
                          <span>{page.estimatedMinutes} min</span>
                        </div>
                      </div>

                      {isSelected && (
                        <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Resources Card (Videos & References) */}
            {resources && resources.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-primary" /> Educational References
                </h4>
                <div className="space-y-2">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors text-xs flex items-start gap-2.5"
                    >
                      {res.resourceType === "YOUTUBE_VIDEO" ? (
                        <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Video className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 line-clamp-1"
                        >
                          {res.title}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                        </a>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {res.authorOrPublisher || res.provider || "Educational Resource"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 space-y-6">
            {pageLoading ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Loading page content & formulas...</p>
              </div>
            ) : currentPage ? (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
                {/* Header Information for the Active Page */}
                <div className="border-b border-border pb-5 mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {badgeInfo && (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeInfo.color}`}
                      >
                        {badgeInfo.label}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {currentPage.estimatedMinutes} min read
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      Page {currentPage.order} of {pages.length}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {currentPage.title}
                  </h2>

                  {/* Learning Objectives Chips */}
                  {currentPage.learningObjectives &&
                    currentPage.learningObjectives.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/60">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-accent" /> Page Objectives:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentPage.learningObjectives.map((obj, i) => (
                            <span
                              key={i}
                              className="text-xs bg-muted/50 border border-border text-foreground px-2.5 py-1 rounded-lg"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Render Markdown Content with LaTeX math formatting */}
                <article className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed mb-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h2: ({ node, ...props }) => (
                        <h2
                          className="font-display text-xl font-bold text-foreground mt-6 mb-3 border-b border-border/40 pb-1"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="font-display text-base font-bold text-foreground mt-5 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-foreground/90 my-3 leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 my-3 space-y-1 text-foreground/90" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 my-3 space-y-1 text-foreground/90" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-primary/50 bg-primary/5 p-4 rounded-r-xl italic text-foreground/90 my-4"
                          {...props}
                        />
                      ),
                      code: ({ inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline ? (
                          <div className="my-4 rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs overflow-x-auto text-foreground">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </div>
                        ) : (
                          <code
                            className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary font-semibold"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {currentPage.contentMarkdown}
                  </ReactMarkdown>
                </article>

                {/* Embedded Video Resource for this Page if present */}
                {currentPage.resources &&
                  currentPage.resources.some((r) => r.resourceType === "YOUTUBE_VIDEO" && r.embedUrl) && (
                    <div className="my-6 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
                      <h4 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Video className="h-4 w-4 text-rose-500" /> Instructional Video Demonstration
                      </h4>
                      {currentPage.resources
                        .filter((r) => r.resourceType === "YOUTUBE_VIDEO" && r.embedUrl)
                        .map((videoRes) => (
                          <div key={videoRes.id} className="space-y-2">
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black shadow-md">
                              <iframe
                                src={videoRes.embedUrl!}
                                title={videoRes.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                              <span>{videoRes.title}</span>
                              <a
                                href={videoRes.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 font-medium"
                              >
                                Watch on YouTube <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                {/* Bottom Navigation & Completion Controls */}
                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Previous Button */}
                  {currentPage.navigation.previousPage ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentPage.navigation.previousPage) {
                          setSelectedPageId(currentPage.navigation.previousPage.id);
                          setSearchParams({ page: currentPage.navigation.previousPage.slug });
                        }
                      }}
                      className="text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous Step
                    </Button>
                  ) : (
                    <div />
                  )}

                  {/* Complete / Continue Action */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      onClick={handleMarkPageComplete}
                      disabled={completingPage}
                      className="gradient-saffron text-primary-foreground text-xs font-semibold shadow-soft"
                    >
                      {completingPage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : currentPage.isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-white" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-white" />
                      )}
                      {currentPage.navigation.nextPage
                        ? currentPage.isCompleted
                          ? "Continue to Next Step →"
                          : "Mark Complete & Continue →"
                        : currentPage.isCompleted
                        ? "Lesson Finished ✓"
                        : "Finish Lesson (+50 XP) 🎉"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-display font-semibold text-foreground text-sm mb-1">
                  Select a Learning Step
                </h4>
                <p className="text-xs text-muted-foreground">
                  Choose a page from the learning steps on the left to begin exploring.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
