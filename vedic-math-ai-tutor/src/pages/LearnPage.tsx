import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, Course, Lesson } from "@/lib/api";
import { sutras } from "@/data/vedic-sutras";
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Award,
  GraduationCap,
  Loader2,
  HelpCircle,
  PlayCircle,
  FileText
} from "lucide-react";

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Lesson[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"curriculum" | "sutras">("curriculum");
  const [selectedSutra, setSelectedSutra] = useState(sutras[0]);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await api.getCourses();
      setCourses(coursesData);

      if (coursesData.length > 0) {
        // Fetch full course with modules and topics
        const fullCourse = await api.getCourseFull(coursesData[0].id);
        setSelectedCourse(fullCourse);

        // Auto-expand the first two modules
        if (fullCourse.modules && fullCourse.modules.length > 0) {
          const initialExpanded: Record<number, boolean> = {};
          fullCourse.modules.forEach((mod, idx) => {
            initialExpanded[mod.id] = idx === 0 || idx === 1;
          });
          setExpandedModules(initialExpanded);
        }
      }
    } catch (err: any) {
      console.error("Failed to load curriculum:", err);
      setError(err.message || "Failed to load curriculum. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setSearching(true);
          const results = await api.searchCurriculum(searchQuery.trim());
          setSearchResults(results);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📚</span>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                Vedic Curriculum & Sutras
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Master speed mathematics through structured lessons, sutras, and mental techniques
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg border border-border bg-card p-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "curriculum"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Course Modules
            </button>
            <button
              onClick={() => setActiveTab("sutras")}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "sutras"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              16 Vedic Sutras
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search lessons by technique, sutra, or concept (e.g. 'Nikhilam', 'Multiplication', 'Base Method')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-6 text-sm bg-card border-border shadow-soft rounded-xl"
          />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        {/* Search Results Display */}
        {searchQuery.trim().length >= 2 && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" /> Search Results for "{searchQuery}"
              </h3>
              <span className="text-xs text-muted-foreground">{searchResults.length} lesson(s) found</span>
            </div>

            {searchResults.length === 0 && !searching ? (
              <p className="text-sm text-muted-foreground italic">No matching lessons found. Try another term.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-all shadow-soft"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {lesson.difficulty || "MEDIUM"}
                        </span>
                        {lesson.estimatedMinutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.estimatedMinutes}m
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-foreground text-sm mb-1">{lesson.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {lesson.description || lesson.explanation}
                      </p>
                      {lesson.sutra && (
                        <div className="text-xs text-primary/80 italic mb-3">Sutra: {lesson.sutra}</div>
                      )}
                    </div>
                    <Link to={`/lessons/${lesson.id}`}>
                      <Button size="sm" className="w-full text-xs gradient-saffron text-primary-foreground font-semibold">
                        <PlayCircle className="h-3.5 w-3.5 mr-1" /> Open Lesson
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: CURRICULUM HIERARCHY */}
        {activeTab === "curriculum" && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Loading Vedic Mathematics curriculum...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm font-semibold text-destructive mb-2">{error}</p>
                <Button onClick={loadCurriculum} size="sm" variant="outline">
                  Try Again
                </Button>
              </div>
            ) : selectedCourse ? (
              <div className="space-y-6">
                {/* Course Banner */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft gradient-soft">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                        <span>🕉️</span> Official Course
                      </div>
                      <h2 className="font-display text-2xl font-bold text-foreground">{selectedCourse.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                        {selectedCourse.description || "Master ancient Indian mathematical algorithms for lightning mental arithmetic."}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                      <div>
                        <div className="font-display text-xl font-bold text-foreground">
                          {selectedCourse.modules?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Modules</div>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <div className="font-display text-xl font-bold text-foreground">
                          {selectedCourse.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Topics</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                  {selectedCourse.modules?.map((module, mIdx) => {
                    const isExpanded = expandedModules[module.id];
                    return (
                      <div
                        key={module.id}
                        className="rounded-xl border border-border bg-card overflow-hidden shadow-soft transition-all"
                      >
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-saffron text-primary-foreground font-display font-bold text-sm">
                              {mIdx + 1}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display text-base font-bold text-foreground truncate">
                                {module.title}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {module.topics?.length || 0} Topics • {module.difficulty || "All Levels"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary hidden sm:inline">
                              {isExpanded ? "Collapse" : "Explore"}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {/* Module Topics List */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-border bg-muted/20 p-4 lg:p-6"
                            >
                              <div className="grid gap-3 sm:grid-cols-2">
                                {module.topics?.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-all flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-primary">
                                          {topic.technique || "Vedic Method"}
                                        </span>
                                        {topic.estimatedMinutes && (
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {topic.estimatedMinutes}m
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-display font-bold text-foreground text-sm mb-1">
                                        {topic.title}
                                      </h4>
                                      {topic.sutra && (
                                        <p className="text-xs text-muted-foreground italic mb-2">
                                          Sutra: {topic.sutra}
                                        </p>
                                      )}
                                      {topic.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                          {topic.description}
                                        </p>
                                      )}
                                    </div>

                                    <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                                      {/* If the topic has lessons, link to first lesson; else link to practice */}
                                      <Link
                                        to={`/lessons/${topic.id}`}
                                        className="flex-1"
                                      >
                                        <Button
                                          size="sm"
                                          className="w-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                        >
                                          <BookOpen className="h-3.5 w-3.5 mr-1" /> View Lesson
                                        </Button>
                                      </Link>
                                      <Link to={`/practice?topicId=${topic.id}`}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs font-semibold hover:border-primary"
                                          title="Practice this topic"
                                        >
                                          <PlayCircle className="h-3.5 w-3.5" />
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: CLASSICAL 16 SUTRAS DIRECTORY */}
        {activeTab === "sutras" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sutras List Sidebar */}
            <div className="lg:w-80 shrink-0 space-y-1 bg-card rounded-xl border border-border p-3 max-h-[700px] overflow-y-auto">
              <h3 className="font-display text-sm font-bold text-foreground px-3 py-2">
                16 Core Vedic Sutras
              </h3>
              {sutras.map((sutra) => (
                <button
                  key={sutra.id}
                  onClick={() => setSelectedSutra(sutra)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedSutra.id === sutra.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{sutra.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold text-foreground">{sutra.meaning}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{sutra.name}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Selected Sutra Detailed Card */}
            <div className="flex-1 rounded-xl border border-border bg-card p-6 lg:p-8 shadow-soft">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                {selectedSutra.difficulty.toUpperCase()}
              </div>

              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">
                {selectedSutra.icon} {selectedSutra.name}
              </h2>
              <p className="text-base italic text-primary mb-4 font-medium">"{selectedSutra.meaning}"</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selectedSutra.description}</p>

              {/* Worked Example */}
              <div className="rounded-xl border border-border bg-muted/20 p-5 mb-6">
                <h4 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Worked Example: {selectedSutra.example.problem}
                </h4>
                <div className="space-y-2 mb-4">
                  {selectedSutra.example.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-saffron text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <p className="pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent/10 p-2.5 text-center font-display font-bold text-accent text-sm">
                  Answer: {selectedSutra.example.answer}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/practice`}>
                  <Button className="text-xs font-semibold gradient-saffron text-primary-foreground">
                    <PlayCircle className="h-4 w-4 mr-1.5" /> Practice This Method
                  </Button>
                </Link>
                <Link to={`/tutor?prompt=Teach me how to use the sutra ${encodeURIComponent(selectedSutra.name)}`}>
                  <Button variant="outline" className="text-xs font-semibold">
                    <Sparkles className="h-4 w-4 mr-1.5 text-primary" /> Ask AI Tutor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
