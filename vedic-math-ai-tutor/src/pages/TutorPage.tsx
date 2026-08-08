import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: `🙏 **Namaste! I'm your Vedic Mathematics AI Tutor.**

I'm here to help you master the ancient art of Vedic Math! I can:

- 📚 **Teach you any of the 16 Vedic Sutras** with step-by-step explanations
- 🔢 **Solve problems** using Vedic methods and show you every step
- ❓ **Answer your doubts** — just ask me anything about Vedic Mathematics!
- 💡 **Give you tips** for faster mental calculations

What would you like to learn today? Try asking:
- *"Teach me the Nikhilam sutra"*
- *"How do I multiply 97 × 96 using Vedic math?"*
- *"What is Urdhva-Tiryagbhyam?"*`,
  },
];

// Local AI responses for demo (will be replaced with Cloud AI)
function getLocalResponse(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes("nikhilam") || lower.includes("97") || lower.includes("96")) {
    return `## Nikhilam Navatashcaramam Dashatah
**"All from 9 and the last from 10"**

This sutra is perfect for multiplying numbers close to a base (like 10, 100, 1000).

### Example: 97 × 96

**Step 1:** Choose base = 100

**Step 2:** Find deficiencies:
- 97 → deficit = 3 (100 - 97)
- 96 → deficit = 4 (100 - 96)

**Step 3:** Cross-subtract (either way gives the same result):
- 97 - 4 = **93** ← left part
- OR 96 - 3 = **93** ✓

**Step 4:** Multiply deficiencies:
- 3 × 4 = **12** ← right part

**Answer: 93|12 = 9312** ✅

> 💡 **Pro tip:** This works amazingly well for numbers near 100, 1000, etc. Try 998 × 997 yourself!

Would you like to practice this sutra or learn another one?`;
  }
  
  if (lower.includes("urdhva") || lower.includes("vertically") || lower.includes("crosswise")) {
    return `## Urdhva-Tiryagbhyam
**"Vertically and Crosswise"**

This is the most versatile sutra — it works for ALL multiplications!

### Example: 23 × 14

Think of it in three steps:

**Step 1 — Vertical (ones):**
3 × 4 = 12 → write 2, carry 1

**Step 2 — Crosswise (tens):**
(2 × 4) + (3 × 1) = 8 + 3 = 11 + carry 1 = 12 → write 2, carry 1

**Step 3 — Vertical (hundreds):**
2 × 1 = 2 + carry 1 = 3

**Answer: 322** ✅

> 🧠 **Mental math hack:** With practice, you can do this entirely in your head, left to right!

Want me to walk through a harder example?`;
  }

  if (lower.includes("square") || lower.includes("ekadhik") || lower.includes("ending in 5")) {
    return `## Ekadhikena Purvena
**"By one more than the previous one"**

The fastest way to square numbers ending in 5!

### Example: 75²

**Step 1:** The last two digits are always **25**

**Step 2:** Take the digit(s) before 5: **7**

**Step 3:** Multiply by one more than itself: 7 × 8 = **56**

**Answer: 56|25 = 5625** ✅

### Try these:
- 35² = 3×4 | 25 = **1225**
- 85² = 8×9 | 25 = **7225**
- 115² = 11×12 | 25 = **13225**

> ⚡ You can calculate these in under 2 seconds with practice!

Shall I teach you another squaring trick?`;
  }

  if (lower.includes("teach") || lower.includes("learn") || lower.includes("start")) {
    return `Great enthusiasm! 🔥 Here are the sutras I can teach you:

### Beginner Level
1. 🔢 **Nikhilam** — Multiply numbers near a base
2. ✖️ **Urdhva-Tiryagbhyam** — Universal multiplication
3. 5️⃣ **Ekadhikena Purvena** — Square numbers ending in 5

### Intermediate Level
4. ➗ **Paraavartya Yojayet** — Division made easy
5. ² **Yavadunam** — Quick squaring technique

### Advanced Level
6. 📐 **Anurupye Shunyamanyat** — Simultaneous equations

Which one catches your eye? Just tell me the name or number!`;
  }

  return `That's a great question! 🤔

Let me help you with that. In Vedic Mathematics, we approach problems differently — using mental shortcuts derived from 16 ancient sutras.

Here's what I suggest:
1. **Tell me the specific problem** you want to solve, and I'll show you the Vedic method
2. **Ask me about a sutra** and I'll explain it with examples
3. **Say "teach me"** to see all available sutras

The beauty of Vedic Math is that it makes complex calculations feel like magic! ✨

What would you like to explore?`;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getLocalResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-saffron">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-foreground">Vedic AI Tutor</h1>
            <div className="flex items-center gap-1 text-xs text-accent">
              <Sparkles className="h-3 w-3" />
              <span>Online — ready to help</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant" ? "gradient-saffron" : "bg-secondary"
              }`}>
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <User className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "assistant"
                  ? "bg-card border border-border shadow-soft"
                  : "gradient-indigo text-secondary-foreground"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-saffron">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about Vedic Mathematics..."
              className="flex-1"
            />
            <Button type="submit" variant="hero" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            💡 Try: "Teach me Nikhilam" or "How to square 75?"
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
