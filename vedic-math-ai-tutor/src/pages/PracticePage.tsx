import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, GeneratedQuestion, QuestionSubmissionResult } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Flame,
  Trophy,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Loader2,
  AlertCircle,
  Zap
} from "lucide-react";

// Available template presets for practice selection when none is in URL
const PRESET_TEMPLATES = [
  { id: 1, name: "Addition Without Carrying", sutra: "Ekadhikena Purvena", category: "Addition" },
  { id: 2, name: "Nikhilam Subtraction", sutra: "Nikhilam Navatashcaramam Dashatah", category: "Subtraction" },
  { id: 3, name: "Dot Method Addition", sutra: "Rekha Sthana", category: "Addition" },
  { id: 4, name: "Base Method Multiplication", sutra: "Nikhilam", category: "Multiplication" },
  { id: 5, name: "Urdhva Tiryak Multiplication", sutra: "Urdhva-Tiryagbhyam", category: "Multiplication" },
  { id: 6, name: "Squares Ending in 5", sutra: "Ekadhikena Purvena", category: "Squares" },
  { id: 7, name: "Dwandwa Yoga Squaring", sutra: "Duplex Method", category: "Squares" },
];

export default function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const templateIdParam = searchParams.get("templateId");
  const lessonIdParam = searchParams.get("lessonId");

  const [activeTemplateId, setActiveTemplateId] = useState<number>(
    templateIdParam ? Number(templateIdParam) : 1
  );

  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuestionSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gamification & timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (question && !result) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [question, result]);

  // Load question when activeTemplateId changes
  useEffect(() => {
    loadNewQuestion(activeTemplateId);
  }, [activeTemplateId]);

  const loadNewQuestion = async (templateId: number) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setUserAnswer("");
      setTimerSeconds(0);

      const generated = await api.generateQuestion(templateId);
      setQuestion(generated);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      console.error("Question generation failed:", err);
      // If template not found, fallback gracefully
      if (templateId !== 1) {
        setActiveTemplateId(1);
        return;
      }
      setError(err.message || "Failed to generate practice question.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || !userAnswer.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const submissionResult = await api.submitAnswer(question.id, userAnswer.trim());
      setResult(submissionResult);

      if (submissionResult.correct) {
        setStreak((prev) => prev + 1);
        setSessionXP((prev) => prev + submissionResult.earnedXP);
      } else {
        setStreak(0);
      }
    } catch (err: any) {
      console.error("Answer submission failed:", err);
      setError(err.message || "Failed to verify answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    loadNewQuestion(activeTemplateId);
  };

  const handleTemplateChange = (newId: number) => {
    setActiveTemplateId(newId);
    setSearchParams({ templateId: String(newId) });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header with Stats Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <span>✍️</span> Practice Arena
            </h1>
            <p className="text-xs text-muted-foreground">
              Deterministic Vedic problem solving with instant feedback and XP
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-xl shadow-soft">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <Flame className="h-4 w-4" />
              <span>{streak} Streak</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gold">
              <Trophy className="h-4 w-4 text-primary" />
              <span>+{sessionXP} XP</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{timerSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Template Selector Pills */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">Topic:</span>
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateChange(tmpl.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTemplateId === tmpl.id
                    ? "gradient-saffron text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Problem Card */}
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Generating Vedic problem from template...</p>
          </div>
        ) : error && !question ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-soft">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm font-semibold text-destructive mb-4">{error}</p>
            <Button onClick={() => loadNewQuestion(activeTemplateId)} size="sm">
              Retry Question
            </Button>
          </div>
        ) : question ? (
          <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            {/* Question Header */}
            <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Question #{question.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {question.difficulty || "MEDIUM"}
              </span>
            </div>

            {/* Question Body */}
            <div className="p-6 lg:p-10 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Solve using Vedic Method:
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-8">
                {question.question}
              </h2>

              {/* Answer Input Form */}
              {!result ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={submitting}
                      className="text-center font-display text-xl h-14 rounded-xl border-border bg-muted/20 focus:border-primary shadow-soft"
                    />
                    <Button
                      type="submit"
                      disabled={!userAnswer.trim() || submitting}
                      className="h-14 px-8 rounded-xl gradient-saffron text-primary-foreground font-semibold text-sm shadow-soft shrink-0"
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
                      /* Correct State */
                      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground">
                              Outstanding! Correct Answer 🎉
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {result.feedback || "You solved this problem with Vedic precision."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-accent/20">
                          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" /> +{result.earnedXP} XP Earned
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Solved in {timerSeconds} seconds
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Incorrect State */
                      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <XCircle className="h-6 w-6 text-destructive shrink-0" />
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground">
                              Not quite, but you're learning!
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Your answer: <span className="font-mono font-bold line-through">{userAnswer}</span>
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg bg-card p-3 border border-border text-center mb-3">
                          <span className="text-xs text-muted-foreground mr-2">Correct Answer:</span>
                          <span className="font-display text-xl font-bold text-accent">
                            {result.correctAnswer}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Vedic Explanation from Backend */}
                    {result.explanation && (
                      <div className="rounded-xl border border-border bg-muted/20 p-5 mb-6">
                        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> Vedic Explanation:
                        </h4>
                        <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-mono bg-card p-3 rounded-lg border border-border">
                          {result.explanation}
                        </div>
                      </div>
                    )}

                    {/* Action CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        onClick={handleNext}
                        className="w-full sm:flex-1 gradient-saffron text-primary-foreground font-semibold text-xs h-11"
                      >
                        Next Question <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>

                      {/* Bridge to AI Tutor on Mistake or Doubt */}
                      <Link
                        to={`/tutor?prompt=${encodeURIComponent(
                          `I attempted the problem "${question.question}". My answer was "${userAnswer}", but the correct answer is "${result.correctAnswer}". Can you walk me through the Vedic steps and where I might have made an error?`
                        )}`}
                        className="w-full sm:flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full text-xs font-semibold h-11 border-primary/30 hover:border-primary text-primary"
                        >
                          <Sparkles className="h-4 w-4 mr-1.5" /> Ask AI Tutor For Help
                        </Button>
                      </Link>

                      {lessonIdParam && (
                        <Link to={`/lessons/${lessonIdParam}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                            Back to Lesson
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
