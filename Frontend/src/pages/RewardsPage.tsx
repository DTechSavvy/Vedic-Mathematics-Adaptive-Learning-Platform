import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import {
  api,
  RewardsOverviewResponse,
  StoreCatalogResponse,
  StoreItem,
  WisdomTreeResponse,
  DailyGoalItem,
  WeeklyMissionItem,
  UserAchievement,
  EnhancedLeaderboardResponse,
  EnhancedLeaderboardEntry,
} from "@/lib/api";
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Loader2,
  ShoppingBag,
  TreePine,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  Coins,
  Gem,
  Star,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Info,
  AlertCircle,
  X,
  BookOpen,
  Check,
  BarChart3,
  Package,
} from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RewardsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("RewardsErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3 my-6">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="font-display text-base font-bold text-foreground">
            {this.props.fallbackTitle || "Rewards Module Error"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {this.state.error?.message || "An unexpected error occurred while rendering rewards."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-soft"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type RewardsTab = "shop" | "tree" | "achievements" | "goals" | "leaderboard";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<RewardsTab>("shop");
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [claimingGoalId, setClaimingGoalId] = useState<string | null>(null);
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [applyModalData, setApplyModalData] = useState<{
    title: string;
    message: string;
    effectType: string;
    payload?: any;
  } | null>(null);
  const [insufficientCoinsModal, setInsufficientCoinsModal] = useState<{
    item: StoreItem;
    neededCoins: number;
    currentCoins: number;
  } | null>(null);

  // Rewards overview & user balances
  const [overview, setOverview] = useState<RewardsOverviewResponse | null>(null);
  // Store items
  const [storeData, setStoreData] = useState<StoreCatalogResponse | null>(null);
  const [selectedStoreCategory, setSelectedStoreCategory] = useState<string>("ALL");
  // Wisdom Tree
  const [wisdomTree, setWisdomTree] = useState<WisdomTreeResponse | null>(null);
  const [selectedBandFilter, setSelectedBandFilter] = useState<number | null>(null);
  // Achievements
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [selectedAchievementCat, setSelectedAchievementCat] = useState<string>("ALL");
  // Goals & Missions
  const [dailyGoals, setDailyGoals] = useState<DailyGoalItem[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMissionItem[]>([]);
  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<EnhancedLeaderboardResponse | null>(null);
  const [leaderboardWindow, setLeaderboardWindow] = useState<"weekly" | "monthly" | "allTime">("allTime");
  const [leaderboardMetric, setLeaderboardMetric] = useState<"score" | "xp" | "accuracy" | "sutras" | "streak">("score");

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, storeRes, treeRes, goalsRes, missionsRes, achRes, lbRes] = await Promise.all([
        api.getRewardsOverview().catch(() => null),
        api.getStoreCatalog().catch(() => null),
        api.getWisdomTree().catch(() => null),
        api.getDailyGoals().catch(() => []),
        api.getWeeklyMissions().catch(() => []),
        api.getAchievements().catch(() => []),
        api.getLeaderboard(leaderboardWindow, leaderboardMetric).catch(() => null),
      ]);

      if (ovRes) setOverview(ovRes);
      if (storeRes) setStoreData(storeRes);
      if (treeRes) setWisdomTree(treeRes);
      setDailyGoals(goalsRes || []);
      setWeeklyMissions(missionsRes || []);
      setAchievements(achRes || []);
      if (lbRes) setLeaderboard(lbRes);
    } catch (err) {
      console.error("Error loading rewards page data:", err);
    } finally {
      setLoading(false);
    }
  }, [leaderboardWindow, leaderboardMetric]);

  useEffect(() => {
    loadAllData();

    // Cross-page reactive listener: updates balances & achievements when practice completes in other tabs
    const handleStateUpdate = () => {
      loadAllData();
    };

    window.addEventListener("vedicmind:state-update", handleStateUpdate);
    return () => {
      window.removeEventListener("vedicmind:state-update", handleStateUpdate);
    };
  }, [loadAllData]);

  // Handle Leaderboard filter changes
  const handleLeaderboardChange = async (
    windowVal: "weekly" | "monthly" | "allTime",
    metricVal: "score" | "xp" | "accuracy" | "sutras" | "streak"
  ) => {
    setLeaderboardWindow(windowVal);
    setLeaderboardMetric(metricVal);
    try {
      const data = await api.getLeaderboard(windowVal, metricVal);
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to filter leaderboard:", err);
    }
  };

  // Handle Item Purchase
  const handlePurchase = async (item: StoreItem) => {
    if (purchasingId) return;
    try {
      setPurchasingId(item.id);
      setPurchaseMessage(null);
      const res = await api.purchaseStoreItem(item.id);
      setPurchaseMessage({ text: res.message, type: "success" });

      // Refresh store catalog & user overview balances
      const [updatedStore, updatedOverview] = await Promise.all([
        api.getStoreCatalog(),
        api.getRewardsOverview(),
      ]);
      setStoreData(updatedStore);
      setOverview(updatedOverview);

      // Broadcast event so navbar, sidebar, and progress update balances immediately
      window.dispatchEvent(new CustomEvent("vedicmind:state-update"));
    } catch (err: any) {
      setPurchaseMessage({
        text: err.message || "Purchase failed. Please check your balance.",
        type: "error",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  // Handle Consumable Item Application / Use
  const handleApplyItem = async (item: StoreItem) => {
    if (applyingId) return;
    try {
      setApplyingId(item.id);
      setPurchaseMessage(null);
      const res = await api.applyStoreItem(item.id);
      setApplyModalData({
        title: item.title,
        message: res.message,
        effectType: res.effectType,
        payload: res.payload,
      });

      // Refresh store catalog & user overview balances
      const [updatedStore, updatedOverview] = await Promise.all([
        api.getStoreCatalog().catch(() => null),
        api.getRewardsOverview().catch(() => null),
      ]);
      if (updatedStore) setStoreData(updatedStore);
      if (updatedOverview) setOverview(updatedOverview);

      window.dispatchEvent(new CustomEvent("vedicmind:state-update"));
    } catch (err: any) {
      setPurchaseMessage({
        text: err.message || "Failed to use consumable item.",
        type: "error",
      });
    } finally {
      setApplyingId(null);
    }
  };

  // Handle Claiming Daily Goal
  const handleClaimGoal = async (goalId: string) => {
    if (claimingGoalId) return;
    try {
      setClaimingGoalId(goalId);
      const res = await api.claimDailyGoalReward(goalId);
      setPurchaseMessage({
        text: `Goal reward claimed! +${res.rewardCoins} V-Coins, +${res.rewardXp} XP!`,
        type: "success",
      });
      setDailyGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, claimed: true } : g))
      );
      api.getRewardsOverview().then((ov) => ov && setOverview(ov)).catch(() => {});
      window.dispatchEvent(new CustomEvent("vedicmind:state-update"));
    } catch (err: any) {
      setPurchaseMessage({
        text: err.message || "Failed to claim goal reward.",
        type: "error",
      });
    } finally {
      setClaimingGoalId(null);
    }
  };

  // Handle Claiming Weekly Mission
  const handleClaimMission = async (missionId: string) => {
    if (claimingMissionId) return;
    try {
      setClaimingMissionId(missionId);
      const res = await api.claimWeeklyMissionReward(missionId);
      setPurchaseMessage({
        text: `Weekly Mission completed! +${res.rewardCoins} V-Coins, +${res.rewardStars} Stars, +${res.rewardXp} XP!`,
        type: "success",
      });
      setWeeklyMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
      );
      api.getRewardsOverview().then((ov) => ov && setOverview(ov)).catch(() => {});
      window.dispatchEvent(new CustomEvent("vedicmind:state-update"));
    } catch (err: any) {
      setPurchaseMessage({
        text: err.message || "Failed to claim mission reward.",
        type: "error",
      });
    } finally {
      setClaimingMissionId(null);
    }
  };

  const userCoins =
    storeData?.userBalances?.coins ??
    (overview as any)?.balances?.coins ??
    overview?.user?.coins ??
    0;
  const userStars =
    storeData?.userBalances?.stars ??
    (overview as any)?.balances?.stars ??
    overview?.user?.stars ??
    0;
  const userStones =
    storeData?.userBalances?.wisdomStones ??
    (overview as any)?.balances?.wisdomStones ??
    overview?.user?.wisdomStones ??
    0;
  const userStreak =
    storeData?.userBalances?.streak ??
    (overview as any)?.balances?.streak ??
    overview?.user?.streak ??
    0;
  const treeLevel = wisdomTree?.currentLevel ?? overview?.wisdomTree?.level ?? 1;
  const treeTitle = wisdomTree?.currentTitle ?? overview?.wisdomTree?.title ?? "Bramhachari Seedling";
  const treeBand = wisdomTree?.currentBand ?? overview?.wisdomTree?.bandName ?? "Seedling";

  // Filter Store items safely (handling both array and object response)
  const rawStoreItems: StoreItem[] = Array.isArray(storeData) ? storeData : storeData?.items || [];
  const filteredStoreItems =
    selectedStoreCategory === "ALL"
      ? rawStoreItems
      : rawStoreItems.filter((it) => {
          const cat = it.category.toUpperCase();
          if (selectedStoreCategory === "TOOLS") return cat === "LEARNING" || cat === "TOOLS";
          if (selectedStoreCategory === "BOOSTS") return cat === "BOOST" || cat === "BOOSTS";
          if (selectedStoreCategory === "THEMES") return cat === "COSMETIC" || cat === "THEMES";
          return cat === selectedStoreCategory;
        });

  // Filter Achievements
  const achievementCategories = Array.from(new Set(achievements.map((a) => a.category)));
  const filteredAchievements =
    selectedAchievementCat === "ALL"
      ? achievements
      : achievements.filter((a) => a.category === selectedAchievementCat);

  return (
    <AppLayout>
      <RewardsErrorBoundary fallbackTitle="Unable to load Rewards page">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header & Identity */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Canonical Vedic Mind Gamification Hub
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              🏆 Vedic Academy Rewards & Honors
            </h1>
            <p className="text-sm text-muted-foreground">
              Earn V-Coins, climb the 100-Level Wisdom Tree, unlock 100 canonical achievements, and test your mastery.
            </p>
          </motion.div>

          <button
            onClick={() => loadAllData()}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Hub
          </button>
        </div>

        {/* Currency & Growth Hero Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 sm:p-5 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">V-Coins</span>
              <Coins className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{userCoins}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Academic practice currency</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-card to-card p-4 sm:p-5 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-yellow-600 dark:text-yellow-400">Speed Stars</span>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{userStars}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Fast accurate mental solving</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-card to-card p-4 sm:p-5 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-cyan-400">Wisdom Stones</span>
              <Gem className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{userStones}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Topic & Sutra completions</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-4 sm:p-5 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">Wisdom Tree</span>
              <TreePine className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">Lv. {treeLevel}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5">
                {treeBand}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 sm:col-span-1 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-card to-card p-4 sm:p-5 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">Study Streak</span>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{userStreak} Days</div>
              <div className="text-xs text-muted-foreground mt-0.5">Daily practice continuity</div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
          {[
            { id: "shop", label: "Rewards Shop", icon: ShoppingBag },
            { id: "tree", label: "Wisdom Tree", icon: TreePine },
            { id: "achievements", label: "Achievements", icon: Award },
            { id: "goals", label: "Goals & Missions", icon: Target },
            { id: "leaderboard", label: "Global Leaderboard", icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RewardsTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notification Banner */}
        {purchaseMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
              purchaseMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <span>{purchaseMessage.text}</span>
            <button
              onClick={() => setPurchaseMessage(null)}
              className="text-xs font-bold underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* TAB 1: REWARDS SHOP                                        */}
        {/* ========================================================== */}
        {activeTab === "shop" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" /> Educational Learning Store
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Acquire pedagogical aids, timed step-by-step reveals, and profile cosmetics.
                  </p>
                </div>
              </div>

              {/* User Consumables Inventory Panel */}
              {(() => {
                const ownedConsumables = rawStoreItems.filter(
                  (it) => it.category.toUpperCase() !== "COSMETIC" && ((it.ownedBalance ?? 0) > 0 || it.owned)
                );
                if (ownedConsumables.length === 0) return null;

                return (
                  <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-amber-500/5 to-emerald-500/5 p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" /> Your Active Inventory & Consumables
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {ownedConsumables.length} item type{ownedConsumables.length > 1 ? "s" : ""} available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {ownedConsumables.map((item) => {
                        const qty = item.ownedBalance ?? (item.owned ? 1 : 0);
                        const isDirectApplicable =
                          item.id.includes("xp_boost") ||
                          item.id.includes("mistake") ||
                          item.id.includes("sutra") ||
                          item.id.includes("insight") ||
                          item.id.includes("practice_pack");

                        return (
                          <div
                            key={`inv-${item.id}`}
                            className="rounded-xl border border-border/80 bg-card/90 p-3 flex flex-col justify-between shadow-xs"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                  {qty} Active
                                </span>
                              </div>
                              <div className="font-display text-xs font-bold text-foreground line-clamp-1">{item.title}</div>
                              <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.description}</div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-border/60 flex items-center gap-1.5">
                              {isDirectApplicable ? (
                                <button
                                  onClick={() => handleApplyItem(item)}
                                  disabled={applyingId === item.id || qty <= 0}
                                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                                >
                                  {applyingId === item.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3 w-3" />
                                  )}
                                  <span>Apply / Use Now</span>
                                </button>
                              ) : (
                                <Link
                                  to="/practice"
                                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all"
                                >
                                  <span>Use in Practice</span>
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {["ALL", "TOOLS", "BOOSTS", "THEMES", "TITLES"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedStoreCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedStoreCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStoreItems.map((item) => {
                  const isCosmetic = item.category.toUpperCase() === "COSMETIC";
                  const ownedQty = item.ownedBalance ?? (item.owned ? 1 : 0);
                  const isOwnedCosmetic = isCosmetic && item.owned;

                  // Determine shortcut action link for consumable educational items
                  let actionLink: { text: string; to: string } | null = null;
                  if (ownedQty > 0) {
                    if (item.id.includes("hint") || item.id.includes("retry") || item.id.includes("practice")) {
                      actionLink = { text: "Use in Practice", to: "/practice" };
                    } else if (item.id.includes("mistake") || item.id.includes("solution")) {
                      actionLink = { text: "Open in Tutor", to: "/tutor?prompt=Explain%20my%20recent%20Vedic%20mistakes" };
                    } else if (item.id.includes("sutra")) {
                      actionLink = { text: "Revise Sutras", to: "/practice?mode=sutra" };
                    } else if (item.id.includes("insight") || item.id.includes("preview")) {
                      actionLink = { text: "View Progress", to: "/progress" };
                    }
                  }

                  const isDirectApplicable =
                    !isCosmetic &&
                    (item.id.includes("xp_boost") ||
                      item.id.includes("mistake") ||
                      item.id.includes("sutra") ||
                      item.id.includes("insight") ||
                      item.id.includes("practice_pack"));

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                        isOwnedCosmetic
                          ? "border-emerald-500/30 bg-emerald-500/5 shadow-soft"
                          : ownedQty > 0
                          ? "border-primary/30 bg-card hover:border-primary/50 shadow-soft"
                          : item.canAfford
                          ? "border-border bg-card hover:border-primary/40 shadow-soft"
                          : "border-border/60 bg-card/60 opacity-80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{item.icon}</span>
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>

                        {/* Ownership Balance Pill */}
                        <div className="mt-3 py-1.5 px-3 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground text-xs font-medium">Ownership:</span>
                          <span className={`font-bold text-xs sm:text-sm ${
                            isOwnedCosmetic
                              ? "text-emerald-600 dark:text-emerald-400"
                              : ownedQty > 0
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}>
                            {isCosmetic
                              ? item.owned
                                ? "Owned ✓"
                                : "Not Owned"
                              : `${ownedQty} Active`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.costCoins > 0 && (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Coins className="h-3.5 w-3.5" /> {item.costCoins}
                              </span>
                            )}
                            {item.costStars && item.costStars > 0 && (
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                                <Star className="h-3.5 w-3.5" /> {item.costStars}
                              </span>
                            )}
                            {item.costStones > 0 && (
                              <span className="flex items-center gap-1 text-xs font-bold text-cyan-500">
                                <Gem className="h-3.5 w-3.5" /> {item.costStones}
                              </span>
                            )}
                          </div>

                          {isOwnedCosmetic ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Owned
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (!item.canAfford) {
                                  const deficit = Math.max(1, item.costCoins - userCoins);
                                  setInsufficientCoinsModal({
                                    item,
                                    neededCoins: deficit,
                                    currentCoins: userCoins,
                                  });
                                } else {
                                  handlePurchase(item);
                                }
                              }}
                              disabled={purchasingId === item.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                item.canAfford
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                  : "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shadow-xs cursor-pointer"
                              }`}
                              title={!item.canAfford ? `Click to see details: Need ${item.costCoins - userCoins} more Sutra Coins` : undefined}
                            >
                              {purchasingId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : !item.canAfford ? (
                                <>
                                  <Lock className="h-3 w-3" />
                                  <span>Need Coins</span>
                                </>
                              ) : (
                                ownedQty > 0 ? "Buy (+1)" : "Buy"
                              )}
                            </button>
                          )}
                        </div>

                        {/* Direct Use button for owned consumables */}
                        {ownedQty > 0 && isDirectApplicable && (
                          <div className="pt-1">
                            <button
                              onClick={() => handleApplyItem(item)}
                              disabled={applyingId === item.id}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                            >
                              {applyingId === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              <span>Use Now ({ownedQty} available)</span>
                            </button>
                          </div>
                        )}

                        {/* Action shortcut if user owns this item */}
                        {actionLink && (
                          <div className="pt-1">
                            <Link
                              to={actionLink.to}
                              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-semibold transition-colors"
                            >
                              <span>{actionLink.text}</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: WISDOM TREE (100 LEVELS)                             */}
        {/* ========================================================== */}
        {activeTab === "tree" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-emerald-500" /> The 100-Level Vedic Wisdom Tree
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A non-linear growth system featuring 10 classical spiritual & academic bands. Earn +250 XP bonuses per mastered topic!
                  </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span className="text-2xl">🌳</span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Active Level</div>
                    <div className="font-display text-sm font-bold">
                      Level {treeLevel}: {treeTitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Level Progress Bar */}
              {wisdomTree && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border mb-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-foreground">
                      Level {wisdomTree.currentLevel} Progress ({wisdomTree.progressPercent}%)
                    </span>
                    <span className="text-muted-foreground">
                      {wisdomTree.xpInCurrentLevel} / {wisdomTree.xpNeededForNextLevel} XP needed for Level {wisdomTree.currentLevel + 1}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${wisdomTree.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                    <span>Active Band: <strong>{wisdomTree.currentBand}</strong></span>
                    <span>Mastered Topics Bonus: <strong>+{wisdomTree.bonusXpEarned} XP</strong></span>
                  </div>
                </div>
              )}

              {/* Band Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
                <button
                  onClick={() => setSelectedBandFilter(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedBandFilter === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All 10 Bands
                </button>
                {[
                  "Seedling (1-10)",
                  "Sprout (11-20)",
                  "Seeker (21-30)",
                  "Disciple (31-40)",
                  "Scholar (41-50)",
                  "Acharya (51-60)",
                  "Vedic Sage (61-70)",
                  "Bodhi Master (71-80)",
                  "Sutra Adept (81-90)",
                  "Vedic Rishi (91-100)",
                ].map((bandLabel, idx) => (
                  <button
                    key={bandLabel}
                    onClick={() => setSelectedBandFilter(idx + 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedBandFilter === idx + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {bandLabel}
                  </button>
                ))}
              </div>

              {/* 100-Level Grid View */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {(wisdomTree?.levels || [])
                  .filter((lvl) => (selectedBandFilter ? lvl.bandNumber === selectedBandFilter : true))
                  .map((lvl) => (
                    <div
                      key={lvl.level}
                      className={`relative rounded-xl border p-2.5 text-center flex flex-col justify-between transition-all ${
                        lvl.isCurrent
                          ? "border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/30"
                          : lvl.isUnlocked
                          ? "border-border bg-card shadow-soft"
                          : "border-border/40 bg-card/30 opacity-50"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Lv. {lvl.level}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium truncate mt-0.5" title={lvl.title}>
                          {lvl.title}
                        </div>
                      </div>

                      <div className="mt-2 text-[9px] font-semibold text-primary/80">
                        {lvl.isCurrent ? "Active" : lvl.isUnlocked ? "✓ Unlocked" : <Lock className="h-3 w-3 mx-auto" />}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: 100 ACHIEVEMENTS                                    */}
        {/* ========================================================== */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold" /> 100 Educational Achievements
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every achievement awards XP, Coins, Stars, and Stones upon idempotent verification.
                  </p>
                </div>

                <div className="text-xs font-semibold text-muted-foreground self-start sm:self-auto">
                  Unlocked:{" "}
                  <strong className="text-foreground">
                    {achievements.filter((a) => a.unlocked).length} / {achievements.length}
                  </strong>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
                <button
                  onClick={() => setSelectedAchievementCat("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedAchievementCat === "ALL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Categories ({achievements.length})
                </button>
                {achievementCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedAchievementCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedAchievementCat === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                      ach.unlocked
                        ? "border-emerald-500/30 bg-emerald-500/5 shadow-soft"
                        : "border-border bg-card/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{ach.icon}</span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            ach.rarity === "MYTHIC"
                              ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                              : ach.rarity === "LEGENDARY"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : ach.rarity === "EPIC"
                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ach.rarity}
                        </span>
                      </div>

                      <h3 className="font-display text-sm font-bold text-foreground">{ach.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{ach.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{ach.unlocked ? "Completed" : "Progress"}</span>
                        <span className="font-medium text-foreground">
                          {ach.currentValue} / {ach.targetValue} ({ach.progressPercentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            ach.unlocked ? "bg-emerald-500" : "bg-primary"
                          }`}
                          style={{ width: `${ach.progressPercentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2.5 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          {ach.rewardXp > 0 && <span>+{ach.rewardXp} XP</span>}
                          {ach.rewardCoins > 0 && (
                            <span className="text-amber-500">+{ach.rewardCoins} 🪙</span>
                          )}
                        </div>
                        {ach.unlocked && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Claimed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: GOALS & MISSIONS                                     */}
        {/* ========================================================== */}
        {activeTab === "goals" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Goals */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Today's Daily Goals
                </h2>
                <span className="text-xs text-muted-foreground">Resets at midnight</span>
              </div>

              <div className="space-y-3">
                {dailyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl border transition-all ${
                      goal.completed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{goal.icon}</span>
                        <span className="font-display text-sm font-bold text-foreground">{goal.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-amber-500">+{goal.rewardCoins} 🪙</span>
                        <span className="text-primary">+{goal.rewardXp} XP</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{goal.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span>{goal.completed ? "✓ Goal Met" : `${Math.round((goal.current / goal.target) * 100)}%`}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          goal.completed ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, Math.round((goal.current / goal.target) * 100))}%` }}
                      />
                    </div>

                    {/* Claim Button when Goal is completed */}
                    {goal.completed && (
                      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Achieved
                        </span>
                        {goal.claimed ? (
                          <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-md bg-muted">
                            Claimed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimGoal(goal.id)}
                            disabled={claimingGoalId === goal.id}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            {claimingGoalId === goal.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            Claim (+{goal.rewardCoins} 🪙)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Missions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Weekly Master Missions
                </h2>
                <span className="text-xs text-muted-foreground">Resets Mondays</span>
              </div>

              <div className="space-y-3">
                {weeklyMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-xl border transition-all ${
                      mission.completed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mission.icon}</span>
                        <span className="font-display text-sm font-bold text-foreground">{mission.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-amber-500">+{mission.rewardCoins} 🪙</span>
                        <span className="text-yellow-500">+{mission.rewardStars} ⭐</span>
                        <span className="text-primary">+{mission.rewardXp} XP</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{mission.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {mission.current} / {mission.target} {mission.unit}
                      </span>
                      <span>{mission.completed ? "✓ Mission Met" : `${Math.round((mission.current / mission.target) * 100)}%`}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          mission.completed ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, Math.round((mission.current / mission.target) * 100))}%` }}
                      />
                    </div>

                    {/* Claim Button when Mission is completed */}
                    {mission.completed && (
                      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Achieved
                        </span>
                        {mission.claimed ? (
                          <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-md bg-muted">
                            Claimed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimMission(mission.id)}
                            disabled={claimingMissionId === mission.id}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            {claimingMissionId === mission.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            Claim (+{mission.rewardCoins} 🪙 +{mission.rewardStars} ⭐)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: MULTI-METRIC GLOBAL LEADERBOARD                      */}
        {/* ========================================================== */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" /> Global Vedic Leaderboard
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-metric ranking with anti-farming weighting. Easy question spamming receives low score weight.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Time Window */}
                  <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted text-xs">
                    {(["allTime", "weekly", "monthly"] as const).map((win) => (
                      <button
                        key={win}
                        onClick={() => handleLeaderboardChange(win, leaderboardMetric)}
                        className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors ${
                          leaderboardWindow === win
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {win === "allTime" ? "All Time" : win}
                      </button>
                    ))}
                  </div>

                  {/* Metric Filter */}
                  <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted text-xs">
                    {(
                      [
                        { id: "score", label: "Balanced Score" },
                        { id: "xp", label: "XP" },
                        { id: "accuracy", label: "Accuracy" },
                        { id: "sutras", label: "Sutras" },
                        { id: "streak", label: "Streak" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleLeaderboardChange(leaderboardWindow, m.id)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          leaderboardMetric === m.id
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current User Rank Callout if available */}
              {leaderboard?.currentUserRank && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-primary">
                      Rank #{leaderboard.currentUserRank.rank}
                    </span>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{leaderboard.currentUserRank.entry.name} (You)</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          <span>{leaderboard.currentUserRank.entry.wisdomTreeEmoji || "🌱"}</span>
                          <span>{leaderboard.currentUserRank.entry.wisdomTreeStage || "Seedling"} (Band {leaderboard.currentUserRank.entry.wisdomTreeBand || 1})</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Learning Score: {leaderboard.currentUserRank.entry.learningScore} pts • Accuracy:{" "}
                        {leaderboard.currentUserRank.entry.accuracy}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-display font-bold text-primary">
                    {leaderboard.currentUserRank.entry.xp} XP
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-3 font-semibold w-16">Rank</th>
                      <th className="pb-3 font-semibold">Scholar</th>
                      <th className="pb-3 font-semibold">Level & Band</th>
                      <th className="pb-3 font-semibold">Accuracy</th>
                      <th className="pb-3 font-semibold">Streak</th>
                      <th className="pb-3 font-semibold text-right">
                        {leaderboardMetric === "score"
                          ? "Learning Score"
                          : leaderboardMetric.toUpperCase()}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(leaderboard?.entries || []).map((entry, idx) => (
                      <tr
                        key={entry.userId}
                        className={`hover:bg-muted/30 transition-colors ${
                          leaderboard?.currentUserRank?.entry?.userId === entry.userId
                            ? "bg-primary/5"
                            : ""
                        }`}
                      >
                        <td className="py-3.5 font-display font-bold">
                          {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${entry.rank}`}
                        </td>
                        <td className="py-3.5">
                          <div className="font-medium text-foreground">{entry.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                              <span>{entry.wisdomTreeEmoji || "🌱"}</span>
                              <span>{entry.wisdomTreeStage || "Seedling"} (Band {entry.wisdomTreeBand || 1})</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]">
                            Lv. {entry.level}
                          </span>
                        </td>
                        <td className="py-3.5 font-semibold text-foreground">
                          {entry.accuracy}%
                        </td>
                        <td className="py-3.5 font-semibold text-orange-500 flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5" /> {entry.streak}d
                        </td>
                        <td className="py-3.5 text-right font-display font-bold text-primary">
                          {leaderboardMetric === "score"
                            ? `${entry.learningScore} pts`
                            : leaderboardMetric === "xp"
                            ? `${entry.xp} XP`
                            : leaderboardMetric === "accuracy"
                            ? `${entry.accuracy}%`
                            : leaderboardMetric === "sutras"
                            ? `${entry.masteredSutrasCount} Sutras`
                            : `${entry.streak}d`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Consumable Application Result Modal */}
        <AnimatePresence>
          {applyModalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">{applyModalData.title}</h3>
                      <p className="text-xs text-muted-foreground">{applyModalData.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setApplyModalData(null)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Dynamic payload rendering depending on effectType */}
                {applyModalData.effectType === "MISTAKE_ANALYSIS" && applyModalData.payload && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                      <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">Error Pattern Audit</div>
                      <div className="text-foreground">{applyModalData.payload.summary}</div>
                    </div>

                    {applyModalData.payload.topMistakeTopics?.length > 0 && (
                      <div className="rounded-xl border border-border p-3.5 space-y-2">
                        <div className="text-xs font-bold text-foreground">Weakest Syllabus Topics:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {applyModalData.payload.topMistakeTopics.map((t: string) => (
                            <span key={t} className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-[11px] font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {applyModalData.payload.pedagogicRecommendation && (
                      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                        <div className="font-bold text-primary mb-1">Pedagogical Recommendation</div>
                        <div className="text-foreground">{applyModalData.payload.pedagogicRecommendation}</div>
                      </div>
                    )}
                  </div>
                )}

                {applyModalData.effectType === "SUTRA_PACK_UNPACKED" && applyModalData.payload && (
                  <div className="space-y-2.5 pt-2 max-h-96 overflow-y-auto pr-1">
                    <div className="text-xs font-bold text-foreground">
                      Canonical Sutra Formula Reference ({applyModalData.payload.totalSutras || 16} Sutras):
                    </div>
                    {applyModalData.payload.sutras?.map((s: any) => (
                      <div key={s.id} className="p-3 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-primary">
                          <span>{s.sanskritName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{s.id}</span>
                        </div>
                        <div className="text-foreground font-medium">{s.englishMeaning}</div>
                        {s.formula && (
                          <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 bg-card px-2 py-0.5 rounded border border-border/50">
                            {s.formula}
                          </div>
                        )}
                        {s.shortcutRule && (
                          <div className="text-[11px] text-muted-foreground">Rule: {s.shortcutRule}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {applyModalData.effectType === "MASTERY_INSIGHT" && applyModalData.payload && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl border border-border bg-card">
                        <div className="text-muted-foreground text-[10px] uppercase font-bold">Overall Mastery</div>
                        <div className="text-lg font-bold text-primary mt-0.5">{applyModalData.payload.overallMasteryScore}%</div>
                      </div>
                      <div className="p-3 rounded-xl border border-border bg-card">
                        <div className="text-muted-foreground text-[10px] uppercase font-bold">Track Tier</div>
                        <div className="text-lg font-bold text-foreground mt-0.5">{applyModalData.payload.learningLevel}</div>
                      </div>
                    </div>

                    {applyModalData.payload.priorityFocusTopics?.length > 0 && (
                      <div className="rounded-xl border border-border p-3.5 space-y-2">
                        <div className="text-xs font-bold text-foreground">Priority Focus Areas:</div>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                          {applyModalData.payload.priorityFocusTopics.map((t: string) => (
                            <li key={t} className="text-foreground">{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">Strategic Advice</div>
                      <div className="text-foreground">{applyModalData.payload.recommendation}</div>
                    </div>
                  </div>
                )}

                {applyModalData.effectType === "XP_BOOST_ACTIVATED" && applyModalData.payload && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="font-bold text-amber-700 dark:text-amber-300 text-sm">2x Boost Active! ⚡</div>
                    <div className="text-foreground">
                      XP multiplier applied for {applyModalData.payload.durationMinutes || 60} minutes.
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Expires at: {new Date(applyModalData.payload.activeUntil).toLocaleTimeString()}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    onClick={() => setApplyModalData(null)}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-soft"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
          {insufficientCoinsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                      {insufficientCoinsModal.item.icon || "🪙"}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Insufficient Sutra Coins
                      </span>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {insufficientCoinsModal.item.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setInsufficientCoinsModal(null)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-2">
                  <p className="leading-relaxed">
                    You don't have enough coins to buy <strong className="text-amber-600 dark:text-amber-400 font-bold">"{insufficientCoinsModal.item.title}"</strong>.
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    You need <span className="text-amber-500 font-extrabold text-base">+{insufficientCoinsModal.neededCoins}</span> more coins!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Your Balance</div>
                    <div className="font-bold text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Coins className="h-3 w-3 text-amber-500" />
                      {insufficientCoinsModal.currentCoins}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-muted/40">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Item Cost</div>
                    <div className="font-bold text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Coins className="h-3 w-3 text-amber-500" />
                      {insufficientCoinsModal.item.costCoins}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Shortfall</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      -{insufficientCoinsModal.neededCoins}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setInsufficientCoinsModal(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    to="/practice"
                    onClick={() => setInsufficientCoinsModal(null)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-soft flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Earn Coins in Practice</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </div>
      </RewardsErrorBoundary>
    </AppLayout>
  );
}
