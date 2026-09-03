const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("dwanda_token");
}

export function getStoredToken() {
  return getToken();
}

export function setStoredToken(token: string) {
  localStorage.setItem("dwanda_token", token);
}

export function clearStoredToken() {
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

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ access_token: string; user?: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user?: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getProfile: () => request<{ email?: string; name?: string; userId?: number }>("/auth/profile"),
};
