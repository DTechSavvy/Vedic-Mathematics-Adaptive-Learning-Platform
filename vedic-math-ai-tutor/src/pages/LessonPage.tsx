import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { api, Lesson, LessonExample } from "@/lib/api";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  PlayCircle,
  HelpCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      loadLesson(Number(lessonId));
    }
  }, [lessonId]);

  const loadLesson = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch rich content including examples and topic hierarchy
      const data = await api.getLessonContent(id);
      setLesson(data);
    } catch (err: any) {
      console.error("Failed to load lesson:", err);
      // Fallback: try fetching basic lesson or topic curriculum
      try {
        const topicData = await api.getTopicCurriculum(id);
        if (topicData && topicData.lessons && topicData.lessons.length > 0) {
          const fallbackLesson = topicData.lessons[0];
          setLesson({ ...fallbackLesson, topic: topicData });
          return;
        }
      } catch {
        // ignore secondary fallback error
      }
      setError(err.message || "Unable to load this lesson.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading lesson content & worked examples...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !lesson) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground mb-1">Lesson Not Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || "The requested Vedic Mathematics lesson could not be loaded."}
            </p>
            <Button onClick={() => navigate("/learn")} variant="outline" className="text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Curriculum
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Determine the relevant templateId for practice
  const topicTemplates = lesson.topic?.templates || [];
  const primaryTemplateId = topicTemplates.length > 0 ? topicTemplates[0].id : lesson.topicId || 1;

  // Format step strings safely
  const parsedSteps: string[] = Array.isArray(lesson.steps)
    ? (lesson.steps as string[])
    : typeof lesson.steps === "string"
    ? JSON.parse(lesson.steps as string)
    : [
        "Identify the Vedic base and deviations from the numbers.",
        "Apply the sutra algorithm to the cross and vertical parts.",
        "Consolidate the parts to reach the verified solution."
      ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/learn" className="hover:text-foreground transition-colors">
            Curriculum
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {lesson.topic?.module?.course && (
            <>
              <span className="hover:text-foreground truncate max-w-[120px]">
                {lesson.topic.module.course.title}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          {lesson.topic?.module && (
            <>
              <span className="hover:text-foreground truncate max-w-[140px]">
                {lesson.topic.module.title}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          {lesson.topic && (
            <>
              <span className="hover:text-foreground truncate max-w-[140px]">
                {lesson.topic.title}
              </span>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[160px]">{lesson.title}</span>
        </nav>

        {/* Lesson Hero Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> {lesson.technique || "Vedic Algorithm"}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {lesson.difficulty}
            </span>
            {lesson.estimatedMinutes && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} mins read
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl lg:text-4xl font-bold text-foreground mb-2">
            {lesson.title}
          </h1>

          {lesson.sutra && (
            <p className="text-sm lg:text-base italic text-primary font-medium mb-4">
              Vedic Sutra: "{lesson.sutra}"
            </p>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {lesson.description || lesson.content}
          </p>

          {/* Action CTAs in Header */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            <Link to={`/practice?templateId=${primaryTemplateId}&lessonId=${lesson.id}`}>
              <Button className="gradient-saffron text-primary-foreground font-semibold text-xs shadow-soft">
                <PlayCircle className="h-4 w-4 mr-1.5" /> Practice This Lesson
              </Button>
            </Link>
            <Link
              to={`/tutor?lessonId=${lesson.id}&topicId=${lesson.topicId}&prompt=${encodeURIComponent(
                `I am studying the lesson "${lesson.title}". Can you give me an intuitive Vedic explanation and tips?`
              )}`}
            >
              <Button variant="outline" className="text-xs font-semibold border-primary/30 hover:border-primary">
                <Sparkles className="h-4 w-4 mr-1.5 text-primary" /> Ask AI Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft mb-8">
            <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" /> Learning Objectives
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {lesson.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground bg-muted/30 p-2.5 rounded-lg">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Conceptual Explanation */}
        {lesson.explanation && (
          <div className="rounded-xl border border-border bg-card p-6 lg:p-8 shadow-soft mb-8">
            <h3 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Concept & Principles
            </h3>
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-5 rounded-xl border border-border/50">
              {lesson.explanation}
            </div>
          </div>
        )}

        {/* Section 3: Structured Step-by-Step Methodology */}
        <div className="rounded-xl border border-border bg-card p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gold" /> Step-by-Step Method
            </h3>
            <span className="text-xs text-muted-foreground">{parsedSteps.length} Steps</span>
          </div>

          <div className="space-y-4">
            {parsedSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-muted/10 p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-saffron text-xs font-bold text-primary-foreground shadow-sm">
                  {idx + 1}
                </div>
                <div className="pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-0.5">
                    Step {idx + 1}
                  </div>
                  <p className="text-sm text-foreground font-medium">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 4: Worked Examples */}
        {lesson.examples && lesson.examples.length > 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 lg:p-8 shadow-soft mb-8">
            <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Worked Examples
            </h3>
            <div className="space-y-6">
              {lesson.examples.map((example, exIdx) => (
                <div
                  key={example.id || exIdx}
                  className="rounded-xl border border-border bg-muted/20 p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary uppercase">
                      Example {exIdx + 1}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {example.difficulty || "STANDARD"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-card p-4 border border-border font-display text-lg font-bold text-foreground mb-4">
                    {example.question}
                  </div>

                  <div className="mb-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Step-by-Step Solution:
                    </h5>
                    <div className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/80 whitespace-pre-line leading-relaxed font-mono">
                      {example.solution}
                    </div>
                  </div>

                  {example.explanation && (
                    <p className="text-xs text-muted-foreground italic mb-4">
                      💡 {example.explanation}
                    </p>
                  )}

                  <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-center">
                    <span className="text-xs font-medium text-muted-foreground mr-2">Verified Result:</span>
                    <span className="font-display font-bold text-accent text-base">
                      {example.solution.includes("Answer:")
                        ? example.solution.split("Answer:")[1].trim()
                        : "Verified by Vedic Algorithm"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft mb-8 text-center">
            <p className="text-xs text-muted-foreground italic">
              Worked examples for this technique are dynamically solved during practice.
            </p>
          </div>
        )}

        {/* Bottom Navigation & CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card shadow-soft">
          <Button
            onClick={() => navigate("/learn")}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Curriculum
          </Button>

          <div className="flex items-center gap-3">
            <Link
              to={`/tutor?lessonId=${lesson.id}&topicId=${lesson.topicId}&prompt=${encodeURIComponent(
                `Can you explain the key Vedic shortcut in "${lesson.title}"?`
              )}`}
            >
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Ask AI Tutor
              </Button>
            </Link>
            <Link to={`/practice?templateId=${primaryTemplateId}&lessonId=${lesson.id}`}>
              <Button size="sm" className="gradient-saffron text-primary-foreground text-xs font-semibold">
                Practice Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
