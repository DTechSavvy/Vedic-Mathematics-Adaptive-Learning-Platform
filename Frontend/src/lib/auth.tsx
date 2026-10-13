import { createContext, useContext, useMemo, useState } from "react";

export type AuthContextType = {
  token: string | null;
  user: { id?: number; email?: string; name?: string } | null;
  login: (token: string, user?: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getStoredToken() {
  return localStorage.getItem("dwanda_token");
}

export function setStoredToken(token: string) {
  localStorage.setItem("dwanda_token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("dwanda_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<any>(null);

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
