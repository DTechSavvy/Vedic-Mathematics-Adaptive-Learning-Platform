import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api, getStoredToken, setStoredToken, clearStoredToken } from "@/lib/api";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LearnPage from "./pages/LearnPage";
import PracticePage from "./pages/PracticePage";
import TutorPage from "./pages/TutorPage";
import ProgressPage from "./pages/ProgressPage";
import RewardsPage from "./pages/RewardsPage";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound";

type AuthContextType = {
  token: string | null;
  user: { id?: number; email?: string; name?: string } | null;
  login: (token: string, user?: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dwanda_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, nextUser?: any) => {
    setStoredToken(newToken);
    setToken(newToken);
    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem("dwanda_user", JSON.stringify(nextUser));
    }
  };

  const logout = () => {
    clearStoredToken();
    localStorage.removeItem("dwanda_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const google = params.get("google");

    if (token) {
      const userEmail = params.get("userEmail") || "";
      login(token, { email: userEmail });
      window.history.replaceState({}, "", "/auth");
      navigate(isAuthenticated ? "/dashboard" : "/dashboard");
    }

    if (google === "error") {
      const message = params.get("message") || "Google login failed.";
      window.localStorage.setItem("dwanda_error", message);
      window.history.replaceState({}, "", "/auth");
    }
  }, [login, navigate, isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
      <Route path="/courses" element={<Navigate to="/learn" replace />} />
      <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
      <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
      <Route path="/tutor" element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
      <Route path="/ai-tutor" element={<Navigate to="/tutor" replace />} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
