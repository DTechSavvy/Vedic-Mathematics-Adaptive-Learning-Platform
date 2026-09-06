const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message || "Request failed.";
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
  lastActiveDate?: string;
  authProvider?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string | null;
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
  metadata?: any;
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
  steps?: string[] | null;
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

export interface GeneratedQuestion {
  id: number;
  question: string;
  templateId: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface QuestionSubmissionResult {
  correct: boolean;
  correctAnswer: string;
  feedback: string;
  explanation: string;
  earnedXP: number;
  level: number;
  streak: number;
}

export interface UserProgressOverview {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

export interface TopicProgressItem {
  topic: string;
  mastery: number;
  completed: boolean;
}

export interface RecommendationResult {
  recommendation: string;
  weakTopic?: string;
  mastery?: number;
}

export interface SpeedAnalytics {
  averageSpeedSeconds: number;
  totalAttempts?: number;
}

export interface MentalAgilityResult {
  score: number;
  accuracy?: number;
  averageSpeedSeconds?: number;
}

export interface LeaderboardUser {
  id: number;
  name?: string | null;
  email: string;
  xp: number;
  level: number;
  streak: number;
}

export interface TutorMessagePayload {
  message: string;
  conversationId?: string;
  courseId?: number;
  moduleId?: number;
  topicId?: number;
  mode?: "HINT" | "GUIDED" | "EXPLAIN" | "CHECK_ANSWER" | "SOLUTION" | "PRACTICE" | "CONCEPT";
}

export interface StructuredTutorResponse {
  conversationId: string;
  messageId: string;
  intent: string;
  mode: string;
  response: string;
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
  register: (data: { name: string; email: string; password: string }) =>
    request<{ access_token: string; user?: UserProfile; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user?: UserProfile }>("/auth/login", {
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

  // Questions & Practice
  generateQuestion: (templateId: number) =>
    request<GeneratedQuestion>(`/questions/generate/${templateId}`),

  submitAnswer: (questionId: number, answer: string) =>
    request<QuestionSubmissionResult>("/questions/submit", {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    }),

  // Progress & Analytics
  getProgressMe: () => request<UserProgressOverview>("/progress/me"),
  getProgressTopics: () => request<TopicProgressItem[]>("/progress/topics"),
  getRecommendation: () => request<RecommendationResult>("/progress/recommendation"),
  getSpeedAnalytics: () => request<SpeedAnalytics>("/progress/speed"),
  getMentalAgility: () => request<MentalAgilityResult>("/progress/mental-agility"),
  getLeaderboard: () => request<LeaderboardUser[]>("/leaderboard"),

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
};
