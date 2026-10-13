import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  api,
  CanonicalSutra,
  DifficultyAccessResponse,
  GeneratedQuestion,
  QuestionSubmissionResult,
} from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Flame,
  Trophy,
  RotateCcw,
  BookOpen,
  Loader2,
  AlertCircle,
  Zap,
  Lock,
  ShieldCheck,
  BrainCircuit,
  Filter,
  Layers,
  Coins,
  Award,
  Lightbulb,
  Search,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

export interface CanonicalTopicItem {
  id: number;
  title: string;
  sutra?: string;
  technique?: string;
  moduleTitle: string;
  moduleId: number;
}

const DIFFICULTY_CONFIG = [
  {
    id: "EASY",
    label: "Easy",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    activeColor: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
    description: "Direct single-step computation with clear base alignment and simple deviations.",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    activeColor: "bg-sky-600 text-white shadow-md shadow-sky-600/20",
    description: "Multi-digit deviations, cross-base steps, sub-bases, and carry handling.",
  },
  {
    id: "ADVANCED",
    label: "Advanced",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    activeColor: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20",
    description: "Multi-step duplexing, reverse problems, vinculum numbers, and error analysis.",
  },
  {
    id: "EXPERT",
    label: "Expert",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    activeColor: "bg-amber-600 text-white shadow-md shadow-amber-600/20",
    description: "High-level synthesis: algebraic proofs, optimal sutra selection, and word problems.",
  },
] as const;

export type PracticeDifficulty = "EASY" | "MEDIUM" | "ADVANCED" | "EXPERT";

export type PracticeStep =
  | "MODE_SELECT"
  | "TOPIC_SELECT"
  | "SUTRA_SELECT"
  | "CONFIG_SELECT"
  | "ARENA_SOLVING";

const QUESTION_TYPES = [
  {
    id: "ALL",
    label: "All Types",
    icon: "⚡",
    description: "Adaptive dynamic rotation across all Vedic question formats.",
  },
  {
    id: "CALCULATION",
    label: "Calculation",
    icon: "🧮",
    description: "Evaluate direct mental operations from left to right using Vedic sutras.",
  },
  {
    id: "TECHNIQUE_SELECTION",
    label: "Technique Selection",
    icon: "🎯",
    description: "Analyze the numerical patterns and pick the optimal Vedic Sutra.",
  },
  {
    id: "REVERSE_PROBLEM",
    label: "Reverse Problem",
    icon: "🔄",
    description: "Deduce missing operands, base deviations, or intermediate numbers.",
  },
  {
    id: "ERROR_ANALYSIS",
    label: "Error Analysis",
    icon: "🔍",
    description: "Find the subtle mistake in a calculated step and fix the final value.",
  },
  {
    id: "WORD_PROBLEM",
    label: "Word Problem",
    icon: "📝",
    description: "Real-world scenarios resolved rapidly via mental Vedic shortcuts.",
  },
  {
    id: "CONCEPT_CHECK",
    label: "Concept Check",
    icon: "💡",
    description: "Mastery of mathematical axioms, digit sum checks, and sutra rules.",
  },
] as const;

export const FALLBACK_CANONICAL_SUTRAS: CanonicalSutra[] = [
  { id: "sutra-01", number: 1, name: "Ekadhikena Purvena", sanskritName: "Ekadhikena Purvena", meaning: "By one more than the previous one", englishMeaning: "By one more than the previous one", mathematicalDomain: "Squaring & Division" },
  { id: "sutra-02", number: 2, name: "Nikhilam Navatashcaramam Dashatah", sanskritName: "Nikhilam Navatashcaramam Dashatah", meaning: "All from 9 and the last from 10", englishMeaning: "All from 9 and the last from 10", mathematicalDomain: "Base Multiplication" },
  { id: "sutra-03", number: 3, name: "Urdhva Tiryagbhyam", sanskritName: "Urdhva Tiryagbhyam", meaning: "Vertically and crosswise", englishMeaning: "Vertically and crosswise", mathematicalDomain: "Universal Multiplication" },
  { id: "sutra-04", number: 4, name: "Paravartya Yojayet", sanskritName: "Paravartya Yojayet", meaning: "Transpose and apply", englishMeaning: "Transpose and apply", mathematicalDomain: "Division & Linear Systems" },
  { id: "sutra-05", number: 5, name: "Shunyam Samyasamuccaye", sanskritName: "Shunyam Samyasamuccaye", meaning: "When the collection is equal, it is zero", englishMeaning: "When the collection is equal, it is zero", mathematicalDomain: "Equated Expressions" },
  { id: "sutra-06", number: 6, name: "Anurupyena", sanskritName: "Anurupyena", meaning: "Proportionately", englishMeaning: "Proportionately", mathematicalDomain: "Sub-base Multiplication" },
  { id: "sutra-07", number: 7, name: "Sankalana Vyavakalanabhyam", sanskritName: "Sankalana Vyavakalanabhyam", meaning: "By addition and by subtraction", englishMeaning: "By addition and by subtraction", mathematicalDomain: "Simultaneous Equations" },
  { id: "sutra-08", number: 8, name: "Puranapuranabhyam", sanskritName: "Puranapuranabhyam", meaning: "By the completion or non-completion", englishMeaning: "By the completion or non-completion", mathematicalDomain: "Completing Squares & Roots" },
  { id: "sutra-09", number: 9, name: "Chalana Kalanabhyam", sanskritName: "Chalana Kalanabhyam", meaning: "Differences and similarities", englishMeaning: "Differences and similarities", mathematicalDomain: "Quadratic Factoring" },
  { id: "sutra-10", number: 10, name: "Yavadunam", sanskritName: "Yavadunam", meaning: "Whatever the deficiency", englishMeaning: "Whatever the deficiency", mathematicalDomain: "Deficiency Squaring & Cubing" },
  { id: "sutra-11", number: 11, name: "Vyashtisamashtih", sanskritName: "Vyashtisamashtih", meaning: "Part and whole", englishMeaning: "Part and whole", mathematicalDomain: "Polynomial Factoring" },
  { id: "sutra-12", number: 12, name: "Shesanyankena Charamena", sanskritName: "Shesanyankena Charamena", meaning: "The remainders by the last digit", englishMeaning: "The remainders by the last digit", mathematicalDomain: "Decimal Expansions" },
  { id: "sutra-13", number: 13, name: "Sopantyadvayamantyam", sanskritName: "Sopantyadvayamantyam", meaning: "The ultimate and twice the penultimate", englishMeaning: "The ultimate and twice the penultimate", mathematicalDomain: "Special Linear Systems" },
  { id: "sutra-14", number: 14, name: "Ekanyunena Purvena", sanskritName: "Ekanyunena Purvena", meaning: "By one less than the previous one", englishMeaning: "By one less than the previous one", mathematicalDomain: "Multiplication by 9s" },
  { id: "sutra-15", number: 15, name: "Gunitasamuccayah", sanskritName: "Gunitasamuccayah", meaning: "The product of the sum is the sum of the products", englishMeaning: "The product of the sum is the sum of the products", mathematicalDomain: "Algebraic Verification" },
  { id: "sutra-16", number: 16, name: "Gunakasamuccayah", sanskritName: "Gunakasamuccayah", meaning: "All the multipliers", englishMeaning: "All the multipliers", mathematicalDomain: "Factorization & Roots" },
];

function getSutraNumber(sutra: CanonicalSutra, fallbackIndex: number): number {
  if (sutra.number) return sutra.number;
  if (sutra.order) return sutra.order;
  const match = sutra.id?.match(/\d+/);
  if (match) return parseInt(match[0], 10);
  return fallbackIndex + 1;
}

export default function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { topicId: routeTopicId, sutraId: routeSutraId } = useParams<{
    topicId: string;
    sutraId: string;
  }>();

  const templateIdParam = searchParams.get("templateId");
  const lessonIdParam = searchParams.get("lessonId");
  const topicIdParam = routeTopicId || searchParams.get("topicId");
  const sutraIdParam = routeSutraId || searchParams.get("sutraId");
  const difficultyParam = searchParams.get("difficulty") as PracticeDifficulty | null;

  // Multi-step Flow State
  const [practiceStep, setPracticeStep] = useState<PracticeStep>(() => {
    if (sutraIdParam) return "CONFIG_SELECT";
    if (topicIdParam) return "CONFIG_SELECT";
    return "MODE_SELECT";
  });

  // Mode: "preset" = Topic Practice, "sutra" = Sutra Practice
  const [practiceMode, setPracticeMode] = useState<"preset" | "sutra">(() => {
    return sutraIdParam ? "sutra" : "preset";
  });

  // Difficulty & Access State
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty>(
    difficultyParam && ["EASY", "MEDIUM", "ADVANCED", "EXPERT"].includes(difficultyParam)
      ? difficultyParam
      : "EASY"
  );
  const [difficultyAccess, setDifficultyAccess] = useState<DifficultyAccessResponse | null>(null);

  // Locked Difficulty Popup Modal State
  const [lockedModalData, setLockedModalData] = useState<{
    difficulty: PracticeDifficulty;
    title: string;
    reason: string;
    requiredAttempts: number;
    currentAttempts: number;
    requiredAccuracy: number;
    currentAccuracy: number;
    fallbackDifficulty: PracticeDifficulty;
  } | null>(null);

  // Question Type & Challenge Tracking
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("ALL");
  const [challengeNumber, setChallengeNumber] = useState<number>(1);

  // Canonical Topics & Modules State (All 23 Topics loaded from course hierarchy)
  const [canonicalTopics, setCanonicalTopics] = useState<CanonicalTopicItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(
    topicIdParam ? Number(topicIdParam) : 1
  );
  const [topicSearch, setTopicSearch] = useState<string>("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | "ALL">("ALL");

  // Canonical Sutras State (Pre-populated with all 16 canonical sutras)
  const [sutras, setSutras] = useState<CanonicalSutra[]>(FALLBACK_CANONICAL_SUTRAS);
  const [selectedSutraId, setSelectedSutraId] = useState<string>(sutraIdParam || "sutra-01");
  const [sutraSearch, setSutraSearch] = useState("");

  // Consumable Token States
  const [hintCount, setHintCount] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<{ hint: string; shortcutRule: string } | null>(null);
  const [usingHint, setUsingHint] = useState(false);

  const [solutionCount, setSolutionCount] = useState<number>(0);
  const [activeSolution, setActiveSolution] = useState<{
    steps: string[];
    fullAnswer: string;
    shortcutRule?: string;
  } | null>(null);
  const [usingSolution, setUsingSolution] = useState(false);

  const [retryCount, setRetryCount] = useState<number>(0);
  const [usingRetry, setUsingRetry] = useState(false);

  // Question & Solving State
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [topicTitle, setTopicTitle] = useState<string | null>(null);
  const [topicTechnique, setTopicTechnique] = useState<string | null>(null);
  const [topicSutra, setTopicSutra] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuestionSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gamification & Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Policies, Sutras, Topics, and Entitlements on Mount
  useEffect(() => {
    api.getDifficultyAccess()
      .then((data) => {
        setDifficultyAccess(data);
        if (
          data.unlockedDifficulties?.length &&
          !data.unlockedDifficulties.includes(selectedDifficulty)
        ) {
          setSelectedDifficulty(data.unlockedDifficulties[0]);
        }
      })
      .catch((err: unknown) => {
        console.warn("Failed to fetch difficulty access policy:", err);
      });

    api.getSutras()
      .then((data) => {
        setSutras(data || []);
      })
      .catch((err: unknown) => {
        console.warn("Failed to fetch canonical sutras:", err);
      });

    api.getCourseFull(1)
      .then((course) => {
        if (course?.modules) {
          const list: CanonicalTopicItem[] = [];
          for (const m of course.modules) {
            for (const t of m.topics || []) {
              list.push({
                id: t.id,
                title: t.title,
                sutra: t.sutra || undefined,
                technique: t.technique || undefined,
                moduleTitle: m.title,
                moduleId: m.id,
              });
            }
          }
          setCanonicalTopics(list);

          // Update topic title if selectedTopicId exists
          if (topicIdParam) {
            const found = list.find((item) => item.id === Number(topicIdParam));
            if (found) {
              setTopicTitle(found.title);
              setTopicTechnique(found.technique || null);
              setTopicSutra(found.sutra || null);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch course full topics:", err);
      });

    api.getEntitlements()
      .then((ent) => {
        if (ent?.HINT_TOKEN) setHintCount(ent.HINT_TOKEN.balance || 0);
        if (ent?.SOLUTION_TOKEN) setSolutionCount(ent.SOLUTION_TOKEN.balance || 0);
        if (ent?.RETRY_TOKEN) setRetryCount(ent.RETRY_TOKEN.balance || 0);
      })
      .catch(() => {});
  }, []);

  // Timer Effect: Runs ONLY when in ARENA_SOLVING and question is active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (question && !result && practiceStep === "ARENA_SOLVING") {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [question, result, practiceStep]);

  // Load Sutra Question
  const loadSutraQuestion = async (
    sutraId: string,
    diff: PracticeDifficulty,
    qType?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setUserAnswer("");
      setTimerSeconds(0);
      setActiveHint(null);
      setActiveSolution(null);
      const activeType = qType !== undefined ? qType : selectedQuestionType;
      const generated = await api.generateSutraQuestion(
        sutraId,
        diff,
        activeType === "ALL" ? undefined : activeType
      );
      setTopicTitle(null);
      if (generated.questionType === "TECHNIQUE_SELECTION") {
        setTopicTechnique("Strategy Identification");
        setTopicSutra("Identify optimal Sutra");
      } else {
        setTopicTechnique(generated.technique || null);
        setTopicSutra(generated.sutra || sutraId);
      }
      setQuestion(generated);
      setTimeout(() => inputRef.current?.focus(), 150);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load question for this Sutra.";
      setError(message);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  // Load Topic Question
  const loadTopicQuestion = async (
    topicId: number,
    diff: PracticeDifficulty,
    qType?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setUserAnswer("");
      setTimerSeconds(0);
      setActiveHint(null);
      setActiveSolution(null);

      const activeType = qType !== undefined ? qType : selectedQuestionType;
      const [topic, generated] = await Promise.all([
        api.getTopic(topicId).catch(() => null),
        api.generateTopicQuestion(
          topicId,
          diff,
          activeType === "ALL" ? undefined : activeType
        ),
      ]);

      if (topic) {
        setTopicTitle(topic.title);
        setTopicTechnique(topic.technique || null);
        setTopicSutra(topic.sutra || null);
      } else {
        const found = canonicalTopics.find((t) => t.id === topicId);
        if (found) {
          setTopicTitle(found.title);
          setTopicTechnique(found.technique || null);
          setTopicSutra(found.sutra || null);
        }
      }

      if (generated.questionType === "TECHNIQUE_SELECTION") {
        setTopicTechnique("Strategy Identification");
        setTopicSutra("Identify optimal Sutra");
      }
      setQuestion(generated);
      setTimeout(() => inputRef.current?.focus(), 150);
    } catch (err: unknown) {
      console.error("Topic question generation failed:", err);
      const message =
        err instanceof Error ? err.message : "This topic does not have a practice template yet.";
      setError(message);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle Difficulty Selection with Lock Inspection Modal
  const handleDifficultySelect = (diff: PracticeDifficulty) => {
    if (!difficultyAccess) {
      setSelectedDifficulty(diff);
      return;
    }

    const accessItem = difficultyAccess.access?.find((a) => a.difficulty === diff);
    if (accessItem && !accessItem.unlocked) {
      const diffObj = DIFFICULTY_CONFIG.find((d) => d.id === diff);
      const prevTier: PracticeDifficulty =
        diff === "EXPERT" ? "ADVANCED" : diff === "ADVANCED" ? "MEDIUM" : "EASY";

      setLockedModalData({
        difficulty: diff,
        title: `${diffObj?.label || diff} Difficulty Locked`,
        reason:
          accessItem.reason ||
          `Solve at least ${accessItem.requiredAttempts || 5} questions with ≥${
            accessItem.requiredAccuracy || 70
          }% accuracy on ${prevTier} difficulty to unlock.`,
        requiredAttempts: accessItem.requiredAttempts || 5,
        currentAttempts: accessItem.currentAttempts || 0,
        requiredAccuracy: accessItem.requiredAccuracy || 70,
        currentAccuracy: accessItem.currentAccuracy || 0,
        fallbackDifficulty: prevTier,
      });
      return;
    }

    setSelectedDifficulty(diff);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("difficulty", diff);
      return next;
    });
  };

  // Start Practice Session (Generates Question & Starts Timer)
  const handleStartSession = () => {
    setPracticeStep("ARENA_SOLVING");
    if (practiceMode === "sutra") {
      loadSutraQuestion(selectedSutraId, selectedDifficulty, selectedQuestionType);
    } else {
      loadTopicQuestion(selectedTopicId, selectedDifficulty, selectedQuestionType);
    }
  };

  // Consumable Hint Token
  const handleUseHint = async () => {
    const targetQId = question?.questionId ?? question?.id;
    if (!targetQId || hintCount <= 0 || usingHint) return;
    try {
      setUsingHint(true);
      const res = await api.useHintToken(targetQId);
      if (res?.success) {
        setHintCount(res.remainingHints);
        setActiveHint({ hint: res.hint, shortcutRule: res.shortcutRule });
      }
    } catch (err: unknown) {
      console.warn("Failed to use hint token:", err);
    } finally {
      setUsingHint(false);
    }
  };

  // Consumable Solution Token
  const handleUseSolution = async () => {
    const targetQId = question?.questionId ?? question?.id;
    if (!targetQId || solutionCount <= 0 || usingSolution) return;
    try {
      setUsingSolution(true);
      const res = await api.useSolutionToken(targetQId);
      if (res?.success) {
        setSolutionCount(res.remainingSolutions);
        setActiveSolution({
          steps: res.solutionSteps || [],
          fullAnswer: res.fullAnswer,
          shortcutRule: res.shortcutRule,
        });
      }
    } catch (err: unknown) {
      console.warn("Failed to use solution token:", err);
    } finally {
      setUsingSolution(false);
    }
  };

  // Consumable Retry Token
  const handleUseRetry = async () => {
    if (retryCount <= 0 || usingRetry) return;
    try {
      setUsingRetry(true);
      const targetQId = question?.questionId ?? question?.id;
      const res = await api.useRetryToken(targetQId);
      if (res?.success) {
        setRetryCount(res.remainingRetries);
        setResult(null);
        setUserAnswer("");
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err: unknown) {
      console.warn("Failed to use retry token:", err);
    } finally {
      setUsingRetry(false);
    }
  };

  // Submit Answer
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || !userAnswer.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const targetQuestionId = question.questionId ?? question.id;
      if (!targetQuestionId) {
        throw new Error("Unable to submit answer: Missing question identifier.");
      }

      const submissionResult = await api.submitAnswer(targetQuestionId, userAnswer.trim());
      setResult(submissionResult);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vedicmind:state-update", { detail: submissionResult })
        );
      }

      if (submissionResult.correct) {
        setStreak((prev) => prev + 1);
        setSessionXP((prev) => prev + (submissionResult.earnedXP || 15));
        if (submissionResult.earnedCoins) {
          setSessionCoins((prev) => prev + submissionResult.earnedCoins);
        }
        api.getDifficultyAccess().then(setDifficultyAccess).catch(() => {});
      } else {
        setStreak(0);
      }
    } catch (err: unknown) {
      console.error("Answer submission failed:", err);
      const message = err instanceof Error ? err.message : "Failed to verify answer.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Next Question
  const handleNext = () => {
    setChallengeNumber((prev) => prev + 1);
    if (practiceMode === "sutra") {
      loadSutraQuestion(selectedSutraId, selectedDifficulty, selectedQuestionType);
    } else {
      loadTopicQuestion(selectedTopicId, selectedDifficulty, selectedQuestionType);
    }
  };

  // Retry same question
  const handleRetry = () => {
    setResult(null);
    setUserAnswer("");
    setTimerSeconds(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Filter canonical topics across all 5 modules
  const filteredTopics = canonicalTopics.filter((t) => {
    if (selectedModuleFilter !== "ALL" && t.moduleId !== selectedModuleFilter) return false;
    if (!topicSearch.trim()) return true;
    const q = topicSearch.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.sutra && t.sutra.toLowerCase().includes(q)) ||
      (t.technique && t.technique.toLowerCase().includes(q)) ||
      (t.moduleTitle && t.moduleTitle.toLowerCase().includes(q))
    );
  });

  const modulesList = Array.from(
    new Map(canonicalTopics.map((t) => [t.moduleId, t.moduleTitle])).entries()
  ).map(([id, title]) => ({ id, title }));

  // Filter canonical sutras
  const filteredSutras = sutras.filter((s) => {
    if (!sutraSearch.trim()) return true;
    const query = sutraSearch.toLowerCase();
    const name = (s.name || s.sanskritName || "").toLowerCase();
    const meaning = (s.meaning || s.englishMeaning || s.description || "").toLowerCase();
    const domain = (s.mathematicalDomain || "").toLowerCase();
    return (
      name.includes(query) ||
      meaning.includes(query) ||
      s.id.toLowerCase().includes(query) ||
      domain.includes(query)
    );
  });

  // Selected Target Info for Configuration View
  const selectedTopicItem = canonicalTopics.find((t) => t.id === selectedTopicId);
  const selectedSutraItem = sutras.find((s) => s.id === selectedSutraId);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* ========================================================== */}
        {/* STEP 1: PRACTICE MODE SELECTION (TOPIC VS SUTRA)           */}
        {/* ========================================================== */}
        {practiceStep === "MODE_SELECT" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" /> Vedic Mathematics Adaptive Arena
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Choose Your Practice Path
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strengthen mental calculation through structured curriculum syllabus topics or master
                the 16 canonical Vedic aphorisms of Bharati Krishna Tirtha.
              </p>
            </div>

            {/* Mode Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Card 1: Curriculum Topic Practice */}
              <motion.div
                whileHover={{ scale: 1.015, y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setPracticeMode("preset");
                  setPracticeStep("TOPIC_SELECT");
                }}
                className="cursor-pointer group relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-card p-7 sm:p-8 shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Layers className="h-7 w-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                      23 Topics • 5 Modules
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Topic Practice
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                      Structured curriculum progression across all 5 modules—from fundamental base addition
                      and subtraction to multi-digit duplex squaring and algebraic roots.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Base-10 Arithmetic
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Duplex Method
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Vinculum Numbers
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-amber-500/20 flex items-center justify-between text-sm font-bold text-amber-600 dark:text-amber-400">
                  <span>Select Curriculum Topic</span>
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Canonical Sutra Practice */}
              <motion.div
                whileHover={{ scale: 1.015, y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setPracticeMode("sutra");
                  setPracticeStep("SUTRA_SELECT");
                }}
                className="cursor-pointer group relative rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/5 to-card p-7 sm:p-8 shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <BrainCircuit className="h-7 w-7" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      16 Canonical Sutras
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Sutra Practice
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                      Target specific timeless aphorisms: Ekadhikena Purvena, Nikhilam Navatashcaramam Dashatah,
                      Urdhva Tiryagbhyam, Paravartya Yojayet, and more.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Timeless Aphorisms
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Lightning Mental Speed
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-border">
                      • Universal Techniques
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Select Canonical Sutra</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 2A: TOPIC SELECTION (23 CANONICAL TOPICS)             */}
        {/* ========================================================== */}
        {practiceStep === "TOPIC_SELECT" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header & Back Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <button
                  onClick={() => setPracticeStep("MODE_SELECT")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Mode Selection
                </button>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-6 w-6 text-amber-500" /> Select Curriculum Topic
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose any of the 23 syllabus topics to practice mental calculation steps.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Input
                  type="text"
                  placeholder="Search 23 topics, sutras, modules..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="h-9 text-xs bg-muted/20 rounded-xl pr-8"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Module Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedModuleFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedModuleFilter === "ALL"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All Modules ({canonicalTopics.length || 23})
              </button>
              {modulesList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleFilter(m.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    selectedModuleFilter === m.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Module {m.id}: {m.title.replace(/^Module\s*\d+:\s*/i, "")}
                </button>
              ))}
            </div>

            {/* 23 Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {filteredTopics.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.015, y: -2 }}
                  onClick={() => {
                    setSelectedTopicId(t.id);
                    setTopicTitle(t.title);
                    setTopicTechnique(t.technique || null);
                    setTopicSutra(t.sutra || null);
                    setPracticeStep("CONFIG_SELECT");
                  }}
                  className="cursor-pointer group rounded-2xl border border-border/80 hover:border-amber-500/50 bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                        Topic {t.id}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Module {t.moduleId}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {t.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.technique || t.sutra || t.moduleTitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Configure & Solve</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 2B: SUTRA SELECTION (16 CANONICAL SUTRAS - NO #)       */}
        {/* ========================================================== */}
        {practiceStep === "SUTRA_SELECT" && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header & Back Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <button
                  onClick={() => setPracticeStep("MODE_SELECT")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Mode Selection
                </button>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-indigo-500" /> Select Canonical Sutra
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose any of the 16 timeless Vedic aphorisms to train dedicated mental calculation algorithms.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Input
                  type="text"
                  placeholder="Filter 16 Sutras..."
                  value={sutraSearch}
                  onChange={(e) => setSutraSearch(e.target.value)}
                  className="h-9 text-xs bg-muted/20 rounded-xl pr-8"
                />
                <Filter className="h-4 w-4 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 16 Sutras Grid: Strictly NO #, displaying Name & Sutra Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {filteredSutras.map((sutra, idx) => {
                const sNumber = getSutraNumber(sutra, idx);
                const sName = sutra.name || sutra.sanskritName || `Sutra ${sNumber}`;
                const sMeaning = sutra.meaning || sutra.englishMeaning || sutra.description || "Canonical Vedic aphorism";
                const sDomain = sutra.mathematicalDomain || "Vedic Mathematics";

                return (
                  <motion.div
                    key={sutra.id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    onClick={() => {
                      setSelectedSutraId(sutra.id);
                      setTopicTitle(null);
                      setTopicSutra(sName);
                      setTopicTechnique(sMeaning);
                      setPracticeStep("CONFIG_SELECT");
                    }}
                    className="cursor-pointer group rounded-2xl border border-border/80 hover:border-indigo-500/50 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs">
                          Sutra {sNumber}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {sDomain}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {sName}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sMeaning}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm font-semibold text-primary">
                      <span>Configure & Solve</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 3: CONFIGURATION (DIFFICULTY & QUESTION TYPE)          */}
        {/* ========================================================== */}
        {practiceStep === "CONFIG_SELECT" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header & Change Target Action */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <button
                  onClick={() => {
                    if (practiceMode === "sutra") setPracticeStep("SUTRA_SELECT");
                    else setPracticeStep("TOPIC_SELECT");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1.5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {practiceMode === "sutra" ? "Change Sutra" : "Change Topic"}
                </button>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Session Setup & Configuration
                </h2>
              </div>

              <button
                onClick={() => setPracticeStep("MODE_SELECT")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Switch Path
              </button>
            </div>

            {/* Target Summary Highlight Card */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-amber-500/5 to-card p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  {practiceMode === "sutra" ? (
                    <BrainCircuit className="h-6 w-6" />
                  ) : (
                    <Layers className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary/15 text-primary">
                      {practiceMode === "sutra"
                        ? `Sutra ${getSutraNumber(
                            selectedSutraItem || ({ id: selectedSutraId } as any),
                            0
                          )}`
                        : `Topic ${selectedTopicId}`}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {practiceMode === "sutra"
                        ? selectedSutraItem?.mathematicalDomain || "Canonical Sutra"
                        : selectedTopicItem?.moduleTitle || "Syllabus Topic"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mt-1">
                    {practiceMode === "sutra"
                      ? selectedSutraItem?.name || selectedSutraItem?.sanskritName || topicSutra || `Sutra ${selectedSutraId}`
                      : selectedTopicItem?.title || topicTitle || `Topic ${selectedTopicId}`}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {practiceMode === "sutra"
                      ? selectedSutraItem?.meaning || selectedSutraItem?.englishMeaning || topicTechnique || "Canonical Vedic Aphorism"
                      : selectedTopicItem?.technique || topicTechnique || "Vedic Mental Arithmetic"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (practiceMode === "sutra") setPracticeStep("SUTRA_SELECT");
                  else setPracticeStep("TOPIC_SELECT");
                }}
                className="self-start sm:self-auto text-xs"
              >
                Change Selection
              </Button>
            </div>

            {/* Section 1: Difficulty Level Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" /> 1. Select Cognitive Difficulty Tier
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select your challenge level. Higher tiers unlock automatically as your accuracy improves.
                  </p>
                </div>
                {difficultyAccess?.userLevel && (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Track: {difficultyAccess.userLevel}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DIFFICULTY_CONFIG.map((diff) => {
                  const accessItem = difficultyAccess?.access?.find((a) => a.difficulty === diff.id);
                  const isUnlocked = accessItem ? accessItem.unlocked : true;
                  const isSelected = selectedDifficulty === diff.id;

                  return (
                    <motion.div
                      key={diff.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleDifficultySelect(diff.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? `${diff.activeColor} ring-2 ring-primary/40`
                          : isUnlocked
                          ? "border-border bg-card hover:border-primary/40 shadow-xs"
                          : "border-border/60 bg-card/40 opacity-70 border-dashed"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isSelected ? "text-white" : ""
                            }`}
                          >
                            {diff.label}
                          </span>
                          {!isUnlocked ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          ) : isSelected ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                              <Check className="h-3 w-3" /> Selected
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isSelected ? "text-white/90" : "text-muted-foreground"
                          }`}
                        >
                          {diff.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 text-[10px] font-semibold border-t border-white/20">
                        {!isUnlocked
                          ? "Click to see unlock criteria"
                          : isSelected
                          ? "Active tier for this session"
                          : "Available to practice"}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Question Type Selection */}
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> 2. Select Question Type
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pick the cognitive style of problem you want to solve.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {QUESTION_TYPES.map((qt) => {
                  const isSelected = selectedQuestionType === qt.id;
                  return (
                    <motion.div
                      key={qt.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedQuestionType(qt.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                          : "border-border bg-card hover:border-primary/40 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{qt.icon}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="font-display text-sm font-bold text-foreground">
                          {qt.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {qt.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Large Glowing Start Button */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Configured: <strong className="text-foreground">{selectedDifficulty}</strong> difficulty •{" "}
                <strong className="text-foreground">{selectedQuestionType.replaceAll("_", " ")}</strong> format
              </div>

              <Button
                size="lg"
                onClick={handleStartSession}
                className="gradient-saffron text-primary-foreground font-bold text-sm px-8 py-6 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Start Practice Session ⚡</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* STEP 4: SOLVING ARENA (QUESTION, TIMER, SUBMIT, FEEDBACK)   */}
        {/* ========================================================== */}
        {practiceStep === "ARENA_SOLVING" && (
          <div className="space-y-6">
            {/* Top Navigation & Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPracticeStep("MODE_SELECT")}
                  className="text-xs font-semibold rounded-xl"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> All Modes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPracticeStep("CONFIG_SELECT")}
                  className="text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground"
                >
                  ⚙️ Adjust Difficulty / Type
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-3 bg-card/90 backdrop-blur border border-border px-4 py-2 rounded-2xl shadow-soft self-start md:self-auto">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <Flame className="h-4 w-4" />
                  <span>{streak} Streak</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Trophy className="h-4 w-4" />
                  <span>+{sessionXP} XP</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                  <Coins className="h-4 w-4" />
                  <span>+{sessionCoins} 🪙</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timerSeconds}s</span>
                </div>
              </div>
            </div>

            {/* Main Question Arena Card */}
            {loading ? (
              <div className="rounded-3xl border border-border bg-card p-14 text-center shadow-soft">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">
                  Generating problem from canonical template...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configured for {selectedDifficulty} difficulty ({selectedQuestionType})
                </p>
              </div>
            ) : error && !question ? (
              <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-soft">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                <p className="text-sm font-semibold text-destructive mb-2">{error}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Try another difficulty tier or another question type.
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => handleNext()} size="sm">
                    Try Another Problem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPracticeStep("CONFIG_SELECT")}
                  >
                    Change Configuration
                  </Button>
                </div>
              </div>
            ) : question ? (
              <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
                {/* Question Header */}
                <div className="border-b border-border bg-muted/30 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Challenge #{challengeNumber}
                    </span>
                    {question.cognitiveCategory && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        {question.cognitiveCategory}
                      </span>
                    )}
                    {question.questionType && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {question.questionType.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hint Token */}
                    <button
                      type="button"
                      onClick={handleUseHint}
                      disabled={hintCount <= 0 || usingHint || !!activeHint || !!result}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        activeHint
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : hintCount > 0
                          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-pointer"
                          : "bg-muted text-muted-foreground border border-border opacity-60 cursor-not-allowed"
                      }`}
                      title={
                        hintCount > 0
                          ? "Use 1 Hint Token for a pedagogical clue"
                          : "No Hint Tokens remaining. Purchase in Rewards Shop with V-Coins."
                      }
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>
                        {usingHint
                          ? "Unlocking..."
                          : activeHint
                          ? "Hint Active"
                          : `Hint (${hintCount})`}
                      </span>
                    </button>

                    {/* Solution Token */}
                    <button
                      type="button"
                      onClick={handleUseSolution}
                      disabled={solutionCount <= 0 || usingSolution || !!activeSolution || !!result}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        activeSolution
                          ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                          : solutionCount > 0
                          ? "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 cursor-pointer"
                          : "bg-muted text-muted-foreground border border-border opacity-60 cursor-not-allowed"
                      }`}
                      title={
                        solutionCount > 0
                          ? "Use 1 Solution Token to reveal full Vedic derivation"
                          : "No Solution Tokens remaining. Purchase in Rewards Shop with V-Coins."
                      }
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>
                        {usingSolution
                          ? "Revealing..."
                          : activeSolution
                          ? "Solution Active"
                          : `Solution (${solutionCount})`}
                      </span>
                    </button>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {question.difficulty || selectedDifficulty}
                    </span>
                  </div>
                </div>

                {/* Problem Body */}
                <div className="p-6 sm:p-10 text-center space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {topicSutra || topicTechnique || "Solve using Vedic Method"}
                    </p>
                    <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-snug">
                      {question.question}
                    </h2>
                  </div>

                  {/* Active Hint Card */}
                  {activeHint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md mx-auto rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-left shadow-soft space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        <Lightbulb className="h-4 w-4" /> Pedagogical Clue
                      </div>
                      <p className="text-xs text-foreground font-medium leading-relaxed">
                        {activeHint.hint}
                      </p>
                      {activeHint.shortcutRule && (
                        <div className="text-[11px] text-muted-foreground font-mono bg-card/80 px-2.5 py-1 rounded-md border border-border/60">
                          Sutra Rule: {activeHint.shortcutRule}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Active Solution Card */}
                  {activeSolution && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-lg mx-auto rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-left shadow-soft space-y-2"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                        <BookOpen className="h-4 w-4" /> Full Vedic Derivation Steps
                      </div>
                      {activeSolution.shortcutRule && (
                        <div className="text-[11px] text-muted-foreground font-mono bg-card/80 px-2 py-1 rounded-md border border-border/60">
                          Sutra: {activeSolution.shortcutRule}
                        </div>
                      )}
                      <ol className="list-decimal list-inside space-y-1.5 text-xs text-foreground font-medium pt-1">
                        {activeSolution.steps.map((s, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {s}
                          </li>
                        ))}
                      </ol>
                      <div className="pt-2 border-t border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        Final Answer: <span className="font-mono underline">{activeSolution.fullAnswer}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Multiple Choice Options */}
                  {question.options && question.options.length > 0 && !result && (
                    <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {question.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setUserAnswer(opt)}
                          className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                            userAnswer === opt
                              ? "border-primary bg-primary/10 text-foreground font-semibold"
                              : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <span className="font-mono font-bold mr-2 text-primary">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Answer Input Form */}
                  {!result ? (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          type="text"
                          inputMode="text"
                          placeholder="Enter your answer"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          disabled={submitting}
                          className="text-center font-display text-xl h-14 rounded-2xl border-border bg-muted/20 focus:border-primary shadow-soft"
                        />
                        <Button
                          type="submit"
                          disabled={!userAnswer.trim() || submitting}
                          className="h-14 px-8 rounded-2xl gradient-saffron text-primary-foreground font-semibold text-sm shadow-soft shrink-0"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Calculate mentally from left to right using Vedic deviations.
                      </p>
                    </form>
                  ) : null}

                  {/* Result & Explanation Feedback Screen */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto text-left mt-6"
                      >
                        {result.correct ? (
                          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 mb-6 shadow-soft">
                            <div className="flex items-center gap-3 mb-2">
                              <CheckCircle2 className="h-7 w-7 text-accent shrink-0" />
                              <div>
                                <h3 className="font-display text-lg font-bold text-foreground">
                                  Outstanding! Correct Answer 🎉
                                </h3>
                                <p className="text-xs text-muted-foreground">{result.feedback}</p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-accent/20">
                              <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5" /> +{result.earnedXP} XP Earned
                              </span>
                              {(result.earnedCoins ?? 0) > 0 && (
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                                  <Coins className="h-3.5 w-3.5" /> +{result.earnedCoins} V-Coins
                                </span>
                              )}
                              <span className="text-xs font-medium text-muted-foreground">
                                Solved in {timerSeconds} seconds
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 mb-6 shadow-soft">
                            <div className="flex items-center gap-3 mb-3">
                              <XCircle className="h-7 w-7 text-destructive shrink-0" />
                              <div>
                                <h3 className="font-display text-lg font-bold text-foreground">
                                  Not quite, but you're learning!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Your answer:{" "}
                                  <span className="font-mono font-bold line-through">{userAnswer}</span>
                                </p>
                              </div>
                            </div>

                            <div className="rounded-xl bg-card p-3 border border-border text-center mb-1">
                              <span className="text-xs text-muted-foreground mr-2">Correct Answer:</span>
                              <span className="font-display text-xl font-bold text-accent">
                                {result.correctAnswer}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="rounded-xl border border-border bg-card p-3.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                              Your Answer
                            </div>
                            <div className="font-display text-base font-semibold text-foreground truncate">
                              {userAnswer}
                            </div>
                          </div>

                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                              Verified Answer
                            </div>
                            <div className="font-display text-base font-semibold text-foreground truncate">
                              {result.correctAnswer}
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Vedic Derivation */}
                        {result.explanation?.steps?.length ? (
                          <div className="rounded-2xl border border-border bg-muted/20 p-5 mb-6 shadow-soft">
                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                              <BookOpen className="h-4 w-4" /> Vedic Derivation Steps:
                            </h4>
                            <div className="text-xs text-foreground/90 leading-relaxed bg-card p-4 rounded-xl border border-border">
                              <ol className="space-y-2 list-decimal list-inside">
                                {result.explanation.steps.map((step, index) => (
                                  <li key={`${index}-${step}`} className="leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : null}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          {!result.correct && retryCount > 0 && (
                            <Button
                              onClick={handleUseRetry}
                              disabled={usingRetry}
                              className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-11 rounded-xl shadow-soft flex items-center justify-center gap-1.5"
                            >
                              {usingRetry ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                              Use Retry Token ({retryCount})
                            </Button>
                          )}

                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="w-full sm:flex-1 text-xs font-semibold h-11 rounded-xl"
                          >
                            <RotateCcw className="h-4 w-4 mr-1.5" /> Retry
                          </Button>

                          <Button
                            onClick={handleNext}
                            className="w-full sm:flex-1 gradient-saffron text-primary-foreground font-semibold text-xs h-11 rounded-xl shadow-soft"
                          >
                            Next Question <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Button>

                          <Link
                            to={`/tutor?prompt=${encodeURIComponent(
                              `I attempted the Vedic problem "${question.question}". My answer was "${userAnswer}", but the correct answer is "${result.correctAnswer}". Can you walk me through the Vedic steps and where I might have made an error?`
                            )}`}
                            className="w-full sm:flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full text-xs font-semibold h-11 rounded-xl border-primary/30 hover:border-primary text-primary"
                            >
                              <Sparkles className="h-4 w-4 mr-1.5" /> Ask AI Tutor
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================== */}
        {/* POPUP MODAL: LOCKED DIFFICULTY MILESTONE REQUIREMENT        */}
        {/* ========================================================== */}
        <AnimatePresence>
          {lockedModalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-inner">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Academic Milestone Required
                      </span>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {lockedModalData.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setLockedModalData(null)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-2">
                  <p className="leading-relaxed font-medium">
                    {lockedModalData.reason}
                  </p>
                </div>

                {/* Progress Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Required Accuracy
                    </div>
                    <div className="font-bold text-foreground mt-0.5 text-sm">
                      ≥{lockedModalData.requiredAccuracy}%
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Current: {lockedModalData.currentAccuracy}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Qualifying Attempts
                    </div>
                    <div className="font-bold text-foreground mt-0.5 text-sm">
                      {lockedModalData.currentAttempts} / {lockedModalData.requiredAttempts}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      Need {Math.max(0, lockedModalData.requiredAttempts - lockedModalData.currentAttempts)} more
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setLockedModalData(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDifficulty(lockedModalData.fallbackDifficulty);
                      setLockedModalData(null);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-soft flex items-center gap-1.5 transition-all"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Practice {lockedModalData.fallbackDifficulty} to Unlock</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
