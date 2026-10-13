export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export function getGoogleAuthUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

export function getToken(): string | null {
  return localStorage.getItem("dwanda_token");
}

export function getStoredToken(): string | null {
  return getToken();
}

export function setStoredToken(token: string): void {
  localStorage.setItem("dwanda_token", token);
}

export function clearStoredToken(): void {
  localStorage.removeItem("dwanda_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      credentials: "include",
    });
  } catch {
    throw new Error(
      "Unable to reach the VedicMind backend. Check that the backend is running and VITE_API_URL is correct.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new Event("dwanda:unauthorized"));
    }
    const serverMessage = typeof payload === "string" ? payload : payload?.message;
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(", ")
      : serverMessage || "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface UserProfile {
  id?: number;
  userId?: number;
  email: string;
  name?: string;
  xp?: number;
  level?: number;
  streak?: number;
  coins?: number;
  stars?: number;
  wisdomStones?: number;
  lastActiveDate?: string;
  authProvider?: string;
  learningLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export interface Course {
  id: number;
  title: string;
  description?: string | null;
  order?: number;
  status?: string;
  modules?: Module[];
  createdAt?: string;
}

export interface Module {
  id: number;
  title: string;
  description?: string | null;
  order?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  courseId: number;
  topics?: Topic[];
  course?: Course;
}

export interface QuestionTemplate {
  id: number;
  topicId: number;
  title: string;
  templateType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  minValue?: number;
  maxValue?: number;
  explanation?: string | null;
}

export interface Topic {
  id: number;
  title: string;
  description?: string | null;
  order?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  learningObjectives?: string[];
  sutra?: string | null;
  subSutra?: string | null;
  technique?: string | null;
  estimatedMinutes?: number | null;
  moduleId: number;
  module?: Module;
  lessons?: Lesson[];
  templates?: QuestionTemplate[];
}

export interface LessonExample {
  id: number;
  lessonId: number;
  question: string;
  solution: string;
  explanation?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order: number;
  sutra?: string | null;
  technique?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string | null;
  content: string;
  order: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  learningObjectives?: string[];
  explanation?: string | null;
  steps?: string[] | Record<string, unknown> | null;
  sutra?: string | null;
  subSutra?: string | null;
  technique?: string | null;
  method?: string | null;
  estimatedMinutes?: number | null;
  topicId: number;
  topic?: Topic;
  examples?: LessonExample[];
  prerequisiteLessonId?: number | null;
}

export interface LearningPageSummary {
  id: number;
  slug: string;
  title: string;
  pageType: string;
  order: number;
  estimatedMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isCompleted?: boolean;
  timeSpentSeconds?: number;
}

export interface LearningResourceItem {
  id: number;
  title: string;
  description?: string | null;
  resourceType: string;
  url: string;
  embedUrl?: string | null;
  provider?: string | null;
  authorOrPublisher?: string | null;
  attributionText?: string | null;
  isVerified: boolean;
}

export interface LearningPageDetail extends LearningPageSummary {
  contentMarkdown: string;
  learningObjectives: string[];
  version: number;
  lessonId: number;
  lessonTitle?: string;
  topicTitle?: string;
  resources: LearningResourceItem[];
  progress?: {
    isCompleted: boolean;
    timeSpentSeconds: number;
    lastVisitedAt: string;
    completedAt?: string | null;
  } | null;
  navigation: {
    previousPage: { id: number; slug: string; title: string } | null;
    nextPage: { id: number; slug: string; title: string } | null;
    totalCount: number;
    currentIndex: number;
  };
}

export interface LessonPagesResponse {
  lesson: {
    id: number;
    title: string;
    description?: string | null;
    topicId: number;
    topicTitle: string;
    moduleTitle: string;
    sutra?: string | null;
    technique?: string | null;
  };
  pages: LearningPageSummary[];
  resources: LearningResourceItem[];
  stats: {
    totalPages: number;
    completedPages: number;
    progressPercentage: number;
    totalEstimatedMinutes: number;
  };
  lastVisitedPageId?: number | null;
}

export interface CanonicalSutra {
  id: string;
  order?: number;
  number?: number;
  name?: string;
  sanskritName?: string;
  transliteration?: string;
  meaning?: string;
  englishMeaning?: string;
  shortDescription?: string;
  description?: string;
  mathematicalDomain?: string;
  mathematicalIdea?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
  primaryOperations?: string[];
  algebraicFormula?: string | null;
  traditionalContext?: string | null;
  historicalNote?: string | null;
  curriculumTopicId?: number | null;
  sourceAttribution?: string | null;
  isActive?: boolean;
}

export interface DifficultyAccessItem {
  difficulty: "EASY" | "MEDIUM" | "ADVANCED" | "EXPERT";
  accessible: boolean;
  unlocked: boolean;
  reason?: string;
  requiredAttempts?: number;
  currentAttempts?: number;
}

export interface DifficultyAccessResponse {
  userLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  access: DifficultyAccessItem[];
  unlockedDifficulties: Array<"EASY" | "MEDIUM" | "ADVANCED" | "EXPERT">;
}

export interface GeneratedQuestion {
  questionId: number;
  id?: number;
  question: string;
  templateId: number;
  topicId?: number;
  technique?: string | null;
  sutra?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "ADVANCED" | "EXPERT" | "HARD";
  questionType?: string;
  cognitiveCategory?: string;
  options?: string[];
}

export interface QuestionExplanation {
  steps: string[];
  mistakeDiagnostic?: string;
  visual?: {
    type: string;
    [key: string]: unknown;
  };
}

export interface QuestionSubmissionResult {
  correct: boolean;
  correctAnswer: string;
  feedback: string;
  explanation?: QuestionExplanation;
  technique?: string | null;
  sutra?: string | null;
  earnedXP: number;
  earnedCoins?: number;
  streakBonusXP?: number;
  isDuplicateQuestion?: boolean;
  isDiminishedReward?: boolean;
  totalCoins?: number;
  coins?: number;
  stars?: number;
  wisdomStones?: number;
  level: number;
  streak: number;
  xp?: number;
  topicStatus?: string;
  topicMasteryScore?: number;
  isTopicMastered?: boolean;
  newlyUnlockedAchievements?: string[];
}

export interface UserProgressOverview {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

export interface TopicProgressItem {
  topicId?: number;
  topic: string;
  courseTitle?: string;
  mastery: number;
  completed: boolean;
  status:
    | "NOT_STARTED"
    | "LEARNING"
    | "PRACTICING"
    | "DEVELOPING"
    | "MASTERED"
    | "REVIEW_REQUIRED"
    | "COMPLETED"
    | "IN_PROGRESS";
  contentCompletion?: number;
  contentStatus?: string;
  validPracticeCount?: number;
  totalAttempts?: number;
  correctAttempts?: number;
  accuracy?: number | null;
  recentAccuracy?: number | null;
  difficultyCoverage?: {
    easyAttempts: number;
    easyAccuracy: number;
    mediumAttempts: number;
    mediumAccuracy: number;
    advancedAttempts: number;
    advancedAccuracy: number;
    coveredTiers: number;
  };
  isMastered?: boolean;
  recommendedAction?: string;
}

export interface SutraProgressItem {
  sutraId: string;
  sutraName: string;
  sanskritName: string;
  englishMeaning: string;
  attemptsCount: number;
  correctCount: number;
  accuracy: number | null;
  recentAccuracy?: number | null;
  mastery: number;
  status:
    | "NOT_STARTED"
    | "PRACTICING"
    | "DEVELOPING"
    | "MASTERED"
    | "REVIEW_REQUIRED";
  isMastered?: boolean;
  difficultyCoverage?: string[];
  recommendedAction?: string;
}

export interface DifficultyProgressItem {
  difficulty: "EASY" | "MEDIUM" | "ADVANCED" | "EXPERT";
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  unlocked: boolean;
  available?: boolean;
  reason?: string;
}

export type DifficultyProgressMap = Record<
  "EASY" | "MEDIUM" | "ADVANCED" | "EXPERT",
  DifficultyProgressItem
>;

export interface RecommendationResult {
  recommendation: string;
  weakTopic?: string;
  mastery?: number;
}

export interface SpeedAnalytics {
  averageSpeedSeconds: number;
  averageTime?: number;
  fastestTime?: number;
  slowestTime?: number;
  totalAttempts?: number;
}

export interface MentalAgilityResult {
  score: number;
  mentalAgilityScore?: number;
  accuracy?: number;
  averageTime?: number;
  averageSpeedSeconds?: number;
  speedScore?: number;
}

export interface LeaderboardUser {
  id: number;
  name?: string | null;
  email: string;
  xp: number;
  level: number;
  streak: number;
  coins?: number;
  stars?: number;
  wisdomStones?: number;
  accuracy?: number;
  learningScore?: number;
}

export interface RewardsOverviewResponse {
  user: {
    id: number;
    name: string;
    email: string;
    coins: number;
    stars: number;
    wisdomStones: number;
    xp: number;
    level: number;
    streak: number;
  };
  wisdomTree: {
    level: number;
    title: string;
    bandName: string;
    bandNumber: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    progressPercent: number;
    perk: string;
  };
  stats: {
    completedGoalsCount: number;
    unlockedAchievementsCount: number;
    totalAchievementsCount: number;
    itemsPurchasedCount: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    source: string;
    referenceId?: string;
    createdAt: string;
  }>;
}

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  category: string;
  costCoins: number;
  costStones: number;
  costStars?: number;
  icon: string;
  metadata?: Record<string, unknown> | null;
  canAfford: boolean;
  owned: boolean;
  ownedBalance?: number;
  activeUntil?: string | null;
}

export interface StoreCatalogResponse {
  userBalances: {
    coins: number;
    stars: number;
    wisdomStones: number;
    xp?: number;
    level?: number;
    streak?: number;
  };
  items: StoreItem[];
  entitlements?: Record<string, { balance: number; activeUntil: string | null; isActive: boolean }>;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  purchase: {
    id: string;
    itemId: string;
    costCoins: number;
    costStones: number;
    costStars?: number;
    createdAt: string;
    expiresAt?: string | null;
  };
  newBalances: {
    coins: number;
    stars: number;
    wisdomStones: number;
  };
}

export interface ApplyItemResult {
  success: boolean;
  message: string;
  appliedItem: string;
  effectType: string;
  payload?: any;
  remainingBalance: number;
}

export interface WisdomTreeLevel {
  level: number;
  title: string;
  bandName: string;
  bandNumber: number;
  cumulativeXp: number;
  perk: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface WisdomTreeResponse {
  currentLevel: number;
  currentTitle: string;
  currentBand: string;
  bandNumber: number;
  currentXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  masteredTopicsCount: number;
  bonusXpEarned: number;
  levels: WisdomTreeLevel[];
}

export interface DailyGoalItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  claimed?: boolean;
  rewardXp: number;
  rewardCoins: number;
  icon: string;
}

export interface WeeklyMissionItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  claimed?: boolean;
  rewardXp: number;
  rewardCoins: number;
  rewardStars: number;
  icon: string;
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  unlocked: boolean;
  earnedAt?: string | null;
  rewardXp: number;
  rewardCoins: number;
  rewardStars: number;
  rewardStones: number;
}

export interface EnhancedLeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  stars: number;
  wisdomStones: number;
  accuracy: number;
  attemptsCount: number;
  masteredTopicsCount: number;
  masteredSutrasCount: number;
  learningScore: number;
  wisdomTreeStage?: string;
  wisdomTreeEmoji?: string;
  wisdomTreeBand?: number;
}

export interface EnhancedLeaderboardResponse {
  window: "weekly" | "monthly" | "allTime";
  metric: "score" | "xp" | "accuracy" | "sutras" | "streak";
  totalParticipants: number;
  entries: EnhancedLeaderboardEntry[];
  currentUserRank?: {
    rank: number;
    entry: EnhancedLeaderboardEntry;
  } | null;
}

export interface MasteryOverviewResponse {
  user: UserProfile;
  overview: UserProgressOverview;
  recommendation: RecommendationResult;
  topics: {
    total: number;
    mastered: number;
    developing: number;
    practicing: number;
    items: TopicProgressItem[];
  };
  sutras: {
    total: number;
    mastered: number;
    items: SutraProgressItem[];
  };
  difficulty: DifficultyProgressMap;
  speed: SpeedAnalytics;
  mentalAgility: MentalAgilityResult;
}

export interface TutorMessagePayload {
  message: string;
  conversationId?: string;
  courseId?: number;
  moduleId?: number;
  topicId?: number;
  mode?: "HINT" | "GUIDED" | "EXPLAIN" | "CHECK_ANSWER" | "SOLUTION" | "PRACTICE" | "CONCEPT";
  image?: {
    data: string; // Base64 encoded string (without data URL prefix)
    mimeType: string; // image/jpeg, image/png, image/webp
    fileName?: string;
  };
}

export interface SmartSuggestion {
  type: string;
  title: string;
  description: string;
  action: 'ASK_TUTOR' | 'OPEN_TOPIC' | 'PRACTICE_TOPIC';
  prompt: string;
  topicId?: number;
  sutraId?: string;
  priority: number;
}

export interface VoiceTranscriptionResult {
  transcript: string;
  language: string;
  durationMs: number;
}

export interface StructuredImageUnderstanding {
  isImageReadable: boolean;
  containsMathematics: boolean;
  isVedicMathRelevant: boolean;
  detectedContentType?: string;
  detectedTopic?: string;
  detectedSutra?: string;
  extractedText?: string;
  mathematicalExpression?: string;
  confidence: 'high' | 'medium' | 'low';
  ambiguities?: string[];
  requiresClarification: boolean;
  clarificationPrompt?: string;
}

export interface StructuredTutorResponse {
  conversationId: string;
  messageId: string;
  intent: string;
  mode: string;
  response: string;
  imageUnderstanding?: StructuredImageUnderstanding | null;
  math?: {
    expression?: string | null;
    studentAnswer?: string | null;
    correctAnswer?: string | null;
    isCorrect?: boolean | null;
  } | null;
  sourceRefs?: Array<{
    title: string;
    sutra?: string | null;
    technique?: string | null;
    source?: string | null;
  }>;
  suggestedActions: string[];
}

export interface TutorMessageItem {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  mode?: string | null;
  createdAt: string;
}

export interface TutorConversationSummary {
  id: string;
  title: string;
  topicId?: number | null;
  moduleId?: number | null;
  courseId?: number | null;
  createdAt: string;
  updatedAt: string;
  messages?: TutorMessageItem[];
}

// ==========================================
// Centralized API Object
// ==========================================

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; learningLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }) =>
    request<{ access_token: string; user?: UserProfile; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user?: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: { email: string }) =>
    request<{ success: boolean; message: string; resetCode?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: { email: string; resetCode: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => request<UserProfile>("/auth/profile"),

  // Courses & Curriculum
  getCourses: () => request<Course[]>("/courses"),
  getCourse: (id: number) => request<Course>(`/courses/${id}`),
  getCourseFull: (id: number) => request<Course>(`/courses/${id}/full`),
  getCourseModules: (courseId: number) => request<Module[]>(`/courses/${courseId}/modules`),

  // Modules
  getModule: (id: number) => request<Module>(`/modules/${id}`),
  getModuleFull: (id: number) => request<Module>(`/modules/${id}/full`),
  getModuleTopics: (moduleId: number) => request<Topic[]>(`/modules/${moduleId}/topics`),

  // Topics
  getTopic: (id: number) => request<Topic>(`/topics/${id}`),
  getTopicFull: (id: number) => request<Topic>(`/topics/${id}/full`),
  getTopicLessons: (topicId: number) => request<Lesson[]>(`/topics/${topicId}/lessons`),
  getTopicCurriculum: (topicId: number) => request<Topic>(`/curriculum/topics/${topicId}`),
  searchCurriculum: (q: string) => request<Lesson[]>(`/curriculum/search?q=${encodeURIComponent(q)}`),

  // Lessons
  getLesson: (id: number) => request<Lesson>(`/lessons/${id}`),
  getLessonContent: (id: number) => request<Lesson>(`/lessons/${id}/content`),

  // Canonical Sutras
  getSutras: () => request<CanonicalSutra[]>("/sutras"),
  getSutra: (sutraId: string) => request<CanonicalSutra>(`/sutras/${encodeURIComponent(sutraId)}`),

  // Questions & Practice
  getDifficultyAccess: () => request<DifficultyAccessResponse>("/questions/difficulty-access"),

  generateQuestion: (templateId: number, difficulty?: string, questionType?: string) => {
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (questionType && questionType !== "ALL") params.set("questionType", questionType);
    const qs = params.toString();
    return request<GeneratedQuestion>(`/questions/generate/${templateId}${qs ? `?${qs}` : ""}`);
  },

  generateTopicQuestion: (topicId: number, difficulty?: string, questionType?: string) => {
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (questionType && questionType !== "ALL") params.set("questionType", questionType);
    const qs = params.toString();
    return request<GeneratedQuestion>(`/questions/generate/topic/${topicId}${qs ? `?${qs}` : ""}`);
  },

  generateSutraQuestion: (sutraId: string, difficulty?: string, questionType?: string) => {
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (questionType && questionType !== "ALL") params.set("questionType", questionType);
    const qs = params.toString();
    return request<GeneratedQuestion>(
      `/questions/generate/sutra/${encodeURIComponent(sutraId)}${qs ? `?${qs}` : ""}`
    );
  },

  submitAnswer: (questionId: number, answer: string) =>
    request<QuestionSubmissionResult>("/questions/submit", {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    }),

  // Progress & Analytics
  getProgressMe: () => request<UserProgressOverview>("/progress/me"),
  getProgressOverview: () => request<MasteryOverviewResponse>("/progress/overview"),
  getProgressTopics: () => request<TopicProgressItem[]>("/progress/topics"),
  getProgressSutras: () => request<SutraProgressItem[]>("/progress/sutras"),
  getProgressDifficulty: () => request<DifficultyProgressMap>("/progress/difficulty"),
  getRecommendation: () => request<RecommendationResult>("/progress/recommendation"),
  getSpeedAnalytics: () => request<SpeedAnalytics>("/progress/speed"),
  getMentalAgility: () => request<MentalAgilityResult>("/progress/mental-agility"),
  getLeaderboard: (window?: string, metric?: string) => {
    const params = new URLSearchParams();
    if (window) params.set("window", window);
    if (metric) params.set("metric", metric);
    const qs = params.toString();
    return request<EnhancedLeaderboardResponse>(`/leaderboard${qs ? `?${qs}` : ""}`);
  },

  // Gamification & Rewards
  getRewardsOverview: () => request<RewardsOverviewResponse>("/rewards/overview"),
  getStoreCatalog: () => request<StoreCatalogResponse>("/rewards/store"),
  purchaseStoreItem: (itemId: string) =>
    request<PurchaseResult>("/rewards/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId }),
    }),
  getEntitlements: () => request<Record<string, { balance: number; activeUntil: string | null; isActive: boolean }>>("/rewards/entitlements"),
  applyStoreItem: (itemId: string, metadata?: Record<string, any>) =>
    request<ApplyItemResult>("/rewards/apply-item", {
      method: "POST",
      body: JSON.stringify({ itemId, metadata }),
    }),
  useHintToken: (questionId: number) =>
    request<{ success: boolean; remainingHints: number; hint: string; shortcutRule: string; topic?: string }>("/rewards/use-hint", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    }),
  useSolutionToken: (questionId: number) =>
    request<{ success: boolean; remainingSolutions: number; solutionSteps: string[]; fullAnswer: string; shortcutRule?: string }>("/rewards/use-solution", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    }),
  useRetryToken: (questionId?: number) =>
    request<{ success: boolean; remainingRetries: number; message: string }>("/rewards/use-retry", {
      method: "POST",
      body: JSON.stringify({ questionId }),
    }),
  getWisdomTree: () => request<WisdomTreeResponse>("/rewards/wisdom-tree"),
  getDailyGoals: () => request<DailyGoalItem[]>("/rewards/goals/daily"),
  claimDailyGoalReward: (goalId: string) =>
    request<{ success: boolean; claimedGoalId: string; rewardXp: number; rewardCoins: number; currentXp: number; currentCoins: number }>("/rewards/goals/claim", {
      method: "POST",
      body: JSON.stringify({ goalId }),
    }),
  getWeeklyMissions: () => request<WeeklyMissionItem[]>("/rewards/missions/weekly"),
  claimWeeklyMissionReward: (missionId: string) =>
    request<{ success: boolean; claimedMissionId: string; rewardXp: number; rewardCoins: number; rewardStars: number; currentXp: number; currentCoins: number; currentStars: number }>("/rewards/missions/claim", {
      method: "POST",
      body: JSON.stringify({ missionId }),
    }),
  getAchievements: () => request<UserAchievement[]>("/achievements"),
  evaluateAchievements: () =>
    request<{ newlyUnlocked: string[]; achievements: UserAchievement[] }>("/achievements/evaluate", {
      method: "POST",
    }),

  // State & Lessons
  getAuthoritativeState: () => request<any>("/progress/state"),
  getDashboardOverview: () => request<any>("/dashboard/overview"),
  getLessonProgress: (lessonId: number) => request<any>(`/lessons/${lessonId}/progress`),
  startLesson: (lessonId: number) => request<any>(`/lessons/${lessonId}/start`, { method: "POST" }),
  completeLesson: (lessonId: number) => request<any>(`/lessons/${lessonId}/complete`, { method: "POST" }),
  getLessonPages: (lessonId: number) => request<LessonPagesResponse>(`/lessons/${lessonId}/pages`),
  getPageDetails: (lessonId: number, pageIdOrSlug: string | number) =>
    request<LearningPageDetail>(`/lessons/${lessonId}/pages/${pageIdOrSlug}`),
  startLearningPage: (lessonId: number, pageId: number) =>
    request<any>(`/lessons/${lessonId}/pages/${pageId}/start`, { method: "POST" }),
  completeLearningPage: (lessonId: number, pageId: number, timeSpentSeconds: number = 0) =>
    request<any>(`/lessons/${lessonId}/pages/${pageId}/complete`, {
      method: "POST",
      body: JSON.stringify({ timeSpentSeconds }),
    }),
  resumeLesson: (lessonId: number) => request<any>(`/lessons/${lessonId}/resume`, { method: "POST" }),
  getTopicResources: (topicId: number) => request<LearningResourceItem[]>(`/topics/${topicId}/resources`),

  // AI Tutor
  sendTutorMessage: (payload: TutorMessagePayload) =>
    request<StructuredTutorResponse>("/ai-tutor/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTutorConversations: (limit: number = 20) =>
    request<TutorConversationSummary[]>(`/ai-tutor/conversations?limit=${limit}`),

  getTutorConversation: (id: string) =>
    request<TutorConversationSummary>(`/ai-tutor/conversations/${id}`),

  deleteTutorConversation: (id: string) =>
    request<{ success: boolean; message: string }>(`/ai-tutor/conversations/${id}`, {
      method: "DELETE",
    }),

  clearAllTutorConversations: () =>
    request<{ success: boolean; count: number; message: string }>("/ai-tutor/conversations", {
      method: "DELETE",
    }),

  getTutorSuggestions: () =>
    request<SmartSuggestion[]>("/ai-tutor/suggestions"),

  transcribeVoice: async (audioBlob: Blob): Promise<VoiceTranscriptionResult> => {
    const formData = new FormData();
    const ext = audioBlob.type.includes("wav")
      ? "recording.wav"
      : audioBlob.type.includes("ogg")
      ? "recording.ogg"
      : audioBlob.type.includes("mp4")
      ? "recording.mp4"
      : "recording.webm";
    formData.append("audio", audioBlob, ext);
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/ai-tutor/voice/transcribe`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Voice transcription failed" }));
      throw new Error(err.message || "Voice transcription failed");
    }
    return res.json();
  },
};

