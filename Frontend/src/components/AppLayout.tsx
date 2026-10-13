import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Trophy,
  BarChart3,
  Dumbbell,
  LogOut,
  Coins,
  Flame,
  TreePine,
} from "lucide-react";
import { useAuth } from "@/App";
import { api, RewardsOverviewResponse } from "@/lib/api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Dumbbell },
  { to: "/tutor", label: "AI Tutor", icon: MessageCircle },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/rewards", label: "Rewards", icon: Trophy },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [rewardsInfo, setRewardsInfo] = useState<RewardsOverviewResponse | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const fetchLiveState = useCallback(async () => {
    try {
      const res = await api.getRewardsOverview();
      setRewardsInfo(res);
    } catch {
      // Graceful fallback if unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchLiveState();

    const handleSync = () => {
      fetchLiveState();
    };

    window.addEventListener("vedicmind:state-update", handleSync);
    return () => {
      window.removeEventListener("vedicmind:state-update", handleSync);
    };
  }, [fetchLiveState]);

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate("/auth", { replace: true });
  };

  const userCoins = rewardsInfo?.user?.coins ?? 0;
  const userStreak = rewardsInfo?.user?.streak ?? 0;
  const treeLevel = rewardsInfo?.wisdomTree?.level ?? 1;
  const treeBand = rewardsInfo?.wisdomTree?.bandName ?? "Seedling";
  const progressPercent = rewardsInfo?.wisdomTree?.progressPercent ?? 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex h-full overflow-hidden">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="text-2xl transform group-hover:scale-105 transition-transform select-none">
              🕉️
            </span>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              VedicMind
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Live Wisdom Tree & User Stats Widget (Stationary Bottom) */}
        <div className="shrink-0 border-t border-border p-4 space-y-3">
          <Link
            to="/rewards"
            className="block rounded-xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <TreePine className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Wisdom Tree
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Lv. {treeLevel}
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5">
              <span className="truncate">{treeBand}</span>
              <span className="flex items-center gap-1 text-orange-500 font-semibold">
                <Flame className="h-3 w-3" /> {userStreak}d
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕉️</span>
            <span className="font-display font-bold text-foreground">VedicMind</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/rewards"
              className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>{userCoins}</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              aria-label="Log out"
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex shrink-0 border-t border-border bg-card lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                location.pathname === item.to ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Confirmation Popup Modal */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0">
              <LogOut className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="font-display text-xl font-bold text-foreground">
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Your practice progress, masteries, and streak are safely saved. You will need to sign back in to continue your Vedic mathematics training.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-border hover:bg-muted font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
