import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { sutras } from "@/data/vedic-sutras";
import { ChevronRight } from "lucide-react";

export default function LearnPage() {
  const [selectedSutra, setSelectedSutra] = useState(sutras[0]);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen">
        {/* Sutra list */}
        <div className="w-80 overflow-y-auto border-r border-border bg-card p-4 hidden md:block">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Vedic Sutras</h2>
          <div className="space-y-1">
            {sutras.map((sutra) => (
              <button
                key={sutra.id}
                onClick={() => setSelectedSutra(sutra)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  selectedSutra.id === sutra.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xl">{sutra.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{sutra.meaning}</div>
                  <div className={`text-xs ${
                    sutra.difficulty === 'beginner' ? 'text-accent' :
                    sutra.difficulty === 'intermediate' ? 'text-primary' : 'text-destructive'
                  }`}>{sutra.difficulty}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Sutra detail */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div key={selectedSutra.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Mobile selector */}
            <div className="mb-4 md:hidden">
              <select
                value={selectedSutra.id}
                onChange={(e) => setSelectedSutra(sutras.find(s => s.id === e.target.value)!)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                {sutras.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.meaning}</option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              {selectedSutra.difficulty}
            </div>

            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
              {selectedSutra.icon} {selectedSutra.name}
            </h1>
            <p className="mb-6 text-lg italic text-primary">"{selectedSutra.meaning}"</p>
            <p className="mb-8 text-muted-foreground leading-relaxed">{selectedSutra.description}</p>

            {/* Example */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft mb-6">
              <h3 className="mb-4 font-display text-lg font-bold text-foreground">
                📖 Worked Example: {selectedSutra.example.problem}
              </h3>
              <div className="space-y-3">
                {selectedSutra.example.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-saffron text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <p className="pt-1 text-foreground">{step}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-accent/10 p-3 text-center">
                <span className="font-display text-xl font-bold text-accent">
                  Answer: {selectedSutra.example.answer}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-display font-semibold text-foreground">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Practice this sutra mentally before writing — speed comes with visualization</li>
                <li>• Start with simpler numbers and gradually increase difficulty</li>
                <li>• Combine with other sutras for even faster calculations</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
