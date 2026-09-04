import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const accuracyData = [
  { sutra: "Nikhilam", accuracy: 92 },
  { sutra: "Urdhva", accuracy: 78 },
  { sutra: "Ekadhikena", accuracy: 95 },
  { sutra: "Paraavartya", accuracy: 65 },
  { sutra: "Yavadunam", accuracy: 50 },
  { sutra: "Anurupye", accuracy: 30 },
];

const speedData = [
  { day: "Mon", speed: 45 },
  { day: "Tue", speed: 52 },
  { day: "Wed", speed: 48 },
  { day: "Thu", speed: 61 },
  { day: "Fri", speed: 58 },
  { day: "Sat", speed: 72 },
  { day: "Sun", speed: 80 },
];

export default function ProgressPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">📈 Your Progress</h1>
          <p className="mb-8 text-sm text-muted-foreground">Track your Vedic Math mastery</p>
        </motion.div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Total Problems Solved", value: "127", emoji: "✍️" },
            { label: "Average Accuracy", value: "87%", emoji: "🎯" },
            { label: "Speed Improvement", value: "+42%", emoji: "⚡" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-4 shadow-soft text-center"
            >
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-5 shadow-soft"
          >
            <h3 className="mb-4 font-display font-semibold text-foreground">Sutra Accuracy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sutra" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-5 shadow-soft"
          >
            <h3 className="mb-4 font-display font-semibold text-foreground">Speed Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="speed" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weak areas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5"
        >
          <h3 className="mb-3 font-display font-semibold text-foreground">📌 Revision Suggestions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Anurupye Shunyamanyat</strong> — accuracy at 30%. Review the sutra and practice more problems.</li>
            <li>• <strong className="text-foreground">Yavadunam</strong> — accuracy at 50%. Try the step-by-step practice mode.</li>
            <li>• <strong className="text-foreground">Paraavartya Yojayet</strong> — getting better! A few more sessions should master it.</li>
          </ul>
        </motion.div>
      </div>
    </AppLayout>
  );
}
