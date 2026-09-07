import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  api,
  getStoredToken,
  StructuredTutorResponse,
  TutorConversationSummary
} from "@/lib/api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  History,
  PlusCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  math?: any;
  sourceRefs?: any[];
}

const INITIAL_GREETING: Message = {
  role: "assistant",
  content: `🙏 **Namaste! I'm your Vedic Mathematics AI Tutor.**

I'm here to help you master ancient Indian speed mathematics with contextual guidance:

- 📚 **Explore the 16 Sutras & 13 Sub-Sutras** with step-by-step algorithms
- 🔢 **Solve complex mental calculations** without manual longhand
- 💡 **Diagnose calculation mistakes** and learn alternative shortcuts
- ✍️ **Get Socratic hints** without spoiling final answers

What would you like to explore today?`,
};

export default function TutorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const promptParam = searchParams.get("prompt");
  const topicIdParam = searchParams.get("topicId");
  const lessonIdParam = searchParams.get("lessonId");
  const courseIdParam = searchParams.get("courseId");
  const moduleIdParam = searchParams.get("moduleId");

  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  // History Drawer state
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<TutorConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initialPromptSent = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  // Handle inbound prompt from Lesson or Practice
  useEffect(() => {
    if (promptParam && !initialPromptSent.current) {
      initialPromptSent.current = true;
      handleSend(promptParam);
    }
  }, [promptParam]);

  const loadConversationHistory = async () => {
    try {
      setLoadingHistory(true);
      const list = await api.getTutorConversations(20);
      setConversations(list);
    } catch (err) {
      console.warn("Could not fetch conversation history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    try {
      setIsTyping(true);
      const conv = await api.getTutorConversation(id);
      setConversationId(conv.id);

      if (conv.messages && conv.messages.length > 0) {
        const mapped: Message[] = conv.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        setMessages(mapped);
      }
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([INITIAL_GREETING]);
    setSuggestedActions([]);
    setInput("");
    setShowHistory(false);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setIsTyping(true);
    setSuggestedActions([]);

    try {
      const response: StructuredTutorResponse = await api.sendTutorMessage({
        message: textToSend,
        conversationId: conversationId || undefined,
        courseId: courseIdParam ? Number(courseIdParam) : undefined,
        moduleId: moduleIdParam ? Number(moduleIdParam) : undefined,
        topicId: topicIdParam ? Number(topicIdParam) : undefined,
      });

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response,
          math: response.math,
          sourceRefs: response.sourceRefs,
        },
      ]);

      if (Array.isArray(response.suggestedActions) && response.suggestedActions.length > 0) {
        setSuggestedActions(response.suggestedActions);
      }

      // Refresh conversation list in background
      loadConversationHistory();
    } catch (err: any) {
      console.error("AI Tutor message failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.message ||
            "I encountered a momentary issue processing your request. Please ensure the backend is connected.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.toLowerCase().includes("practice")) {
      navigate("/practice");
    } else {
      handleSend(action);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen relative overflow-hidden bg-background">
        {/* Main Chat Column */}
        <div className="flex flex-1 flex-col h-full min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-saffron text-primary-foreground shadow-soft">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  VedicMind AI Tutor <Sparkles className="h-4 w-4 text-primary" />
                </h1>
                <p className="text-xs text-muted-foreground">
                  {conversationId ? `Active Session (${conversationId.slice(0, 8)}...)` : "Live Socratic Math Mentor"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleNewConversation}
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
                title="Start a new conversation"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" /> New Session
              </Button>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                size="sm"
                variant="ghost"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                title="View previous conversations"
              >
                <History className="h-4 w-4 mr-1.5" /> History
              </Button>
            </div>
          </div>

          {/* Context Banner if opened from a specific topic/lesson */}
          {(topicIdParam || lessonIdParam) && (
            <div className="border-b border-primary/20 bg-primary/5 px-6 py-2 flex items-center justify-between text-xs text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Context-Aware Session: Linked to active Vedic lesson
              </span>
              <span className="text-[10px] text-muted-foreground">Tutor has curriculum context</span>
            </div>
          )}

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-saffron text-primary-foreground shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm shadow-soft ${
                    msg.role === "user"
                      ? "gradient-saffron text-primary-foreground font-medium rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none leading-relaxed"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Math Feedback Badge if provided */}
                  {msg.math && msg.math.expression && (
                    <div className="mt-3 rounded-lg bg-muted/40 p-2 text-xs font-mono border border-border flex items-center justify-between">
                      <span>Expression: {msg.math.expression}</span>
                      {msg.math.isCorrect !== undefined && (
                        <span className={msg.math.isCorrect ? "text-accent font-bold" : "text-destructive font-bold"}>
                          {msg.math.isCorrect ? "✓ Verified" : "✗ Discrepancy"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-saffron text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-muted-foreground ml-2">Vedic Tutor is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Action Chips */}
          {suggestedActions.length > 0 && (
            <div className="border-t border-border bg-card/60 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Suggested:
              </span>
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action)}
                  className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="border-t border-border bg-card p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 max-w-4xl mx-auto"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a Vedic sutra, problem, or mental shortcut (e.g. 'How do I multiply 98 × 97?')..."
                disabled={isTyping}
                className="flex-1 rounded-xl border-border bg-muted/20 text-sm focus:border-primary shadow-soft h-12"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="gradient-saffron text-primary-foreground font-semibold rounded-xl h-12 px-6 shadow-soft shrink-0"
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Conversation History Drawer */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-card p-4 shadow-xl z-20 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-3">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" /> Previous Sessions
                </h3>
                <Button
                  onClick={() => setShowHistory(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleNewConversation}
                size="sm"
                className="w-full mb-3 text-xs gradient-saffron text-primary-foreground font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Start New Session
              </Button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingHistory ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mb-2" />
                    Loading history...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">
                    No past sessions found. Your conversations will be saved here automatically!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                        conversationId === conv.id
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="truncate font-medium text-foreground mb-1">
                        {conv.title || "Vedic Mathematics Session"}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                        <span>{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                        <MessageSquare className="h-3 w-3" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
