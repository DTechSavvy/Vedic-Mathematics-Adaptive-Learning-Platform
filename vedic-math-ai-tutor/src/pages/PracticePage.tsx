import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { sutras } from "@/data/vedic-sutras";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Problem {
  question: string;
  sutraId: string;
  steps: string[];
  answer: string;
}

const problems: Problem[] = [
  { question: "Calculate 98 × 97 using Nikhilam", sutraId: "nikhilam", steps: ["Base = 100", "Deficiencies: 2 and 3", "Cross-subtract: 98-3 = 95", "Multiply deficiencies: 2×3 = 06", "Answer: 95|06"], answer: "9506" },
  { question: "Find 45² using Ekadhikena Purvena", sutraId: "ekadhikena", steps: ["Number ends in 5", "Digit before 5: 4", "4 × 5 = 20", "Last part: 25", "Answer: 20|25"], answer: "2025" },
  { question: "Multiply 14 × 12 using Urdhva-Tiryagbhyam", sutraId: "urdhva", steps: ["Vertical (ones): 4×2 = 8", "Crosswise: (1×2)+(4×1) = 6", "Vertical (tens): 1×1 = 1", "Answer: 168"], answer: "168" },
  { question: "Calculate 993 × 997 using Nikhilam", sutraId: "nikhilam", steps: ["Base = 1000", "Deficiencies: 7 and 3", "Cross-subtract: 993-3 = 990", "Multiply: 7×3 = 021", "Answer: 990|021"], answer: "990021" },
  { question: "Find 85² using Ekadhikena Purvena", sutraId: "ekadhikena", steps: ["Number ends in 5", "Digit before 5: 8", "8 × 9 = 72", "Last part: 25", "Answer: 72|25"], answer: "7225" },
];

export default function PracticePage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = problems[currentIdx];
  const sutra = sutras.find((s) => s.id === current.sutraId);

  const checkAnswer = () => {
    if (userAnswer.trim().replace(/\s/g, "") === current.answer) {
      setResult("correct");
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => s + 1);
    } else {
      setResult("wrong");
      setStreak(0);
    }
    setShowSteps(true);
  };

  const next = () => {
    setCurrentIdx((i) => (i + 1) % problems.length);
    setUserAnswer("");
    setShowSteps(false);
    setResult(null);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Practice Arena ✍️</h1>
            <p className="text-sm text-muted-foreground">Solve problems using Vedic methods</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-xl font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold text-accent">{streak}🔥</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-1">
          {problems.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < currentIdx ? "gradient-saffron" : i === currentIdx ? "bg-primary/30" : "bg-border"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Problem Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">{sutra?.icon}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {sutra?.meaning}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">
                Q{currentIdx + 1}/{problems.length}
              </span>
            </div>
            <h2 className="mb-6 font-display text-xl font-bold text-foreground">{current.question}</h2>

            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !showSteps && checkAnswer()}
                placeholder="Your answer..."
                disabled={showSteps}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 font-display text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {!showSteps ? (
                <Button variant="hero" size="lg" onClick={checkAnswer} disabled={!userAnswer.trim()}>
                  Check
                </Button>
              ) : (
                <Button variant="accent" size="lg" onClick={next}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 flex items-center gap-2 rounded-lg p-3 ${
                  result === "correct"
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {result === "correct" ? (
                  <><CheckCircle2 className="h-5 w-5" /> Correct! +{10 + (streak - 1) * 2} points 🪙</>
                ) : (
                  <><XCircle className="h-5 w-5" /> Not quite. The answer is {current.answer}</>
                )}
              </motion.div>
            )}
          </div>

          {/* Step-by-step solution */}
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <h3 className="mb-4 font-display font-semibold text-foreground">📝 Step-by-Step Solution</h3>
              <div className="space-y-3">
                {current.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-saffron text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground">{step}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
