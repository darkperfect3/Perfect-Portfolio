import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  import.meta.env.GOOGLE_OAUTH_CLIENT_ID ??
  ""
).trim();

const missingGoogleClientId = GOOGLE_CLIENT_ID === "";
const STORAGE_KEY = "google_id_token";
const GOOGLE_CLIENT_SCRIPT_ID = "google-identity-script";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            container: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

type AuthUser = {
  email: string;
  name: string | null;
  picture: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoaded: boolean;
  hasError: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    let payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padding = payload.length % 4;
    if (padding > 0) {
      payload += "=".repeat(4 - padding);
    }
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getUserFromToken(token: string): AuthUser | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) return null;

  return {
    email,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}

function isTokenValid(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  return exp * 1000 > Date.now() + 30_000;
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available"));
      return;
    }

    const existing = document.getElementById(GOOGLE_CLIENT_SCRIPT_ID);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_CLIENT_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script."));
    document.head.appendChild(script);
  });
}

function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, token);
}

function removeSavedToken(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const initialToken = getSavedToken();
    if (initialToken && isTokenValid(initialToken)) {
      const parsedUser = getUserFromToken(initialToken);
      if (parsedUser) {
        setToken(initialToken);
        setUser(parsedUser);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setAuthTokenGetter(token ? async () => token : null);
    return () => {
      setAuthTokenGetter(null);
    };
  }, [token]);

  useEffect(() => {
    if (missingGoogleClientId || typeof window === "undefined") {
      return;
    }

    loadGoogleScript()
      .then(() => {
        setScriptLoaded(true);
      })
      .catch(() => {
        setHasError(true);
      });
  }, []);

  useEffect(() => {
    if (!scriptLoaded || missingGoogleClientId || typeof window === "undefined") {
      return;
    }

    if (!window.google?.accounts?.id) {
      setHasError(true);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const credential = response?.credential;
        if (!credential) return;

        const parsedUser = getUserFromToken(credential);
        if (!parsedUser) return;

        saveToken(credential);
        setToken(credential);
        setUser(parsedUser);
      },
      ux_mode: "popup",
      auto_select: false,
    });
  }, [scriptLoaded]);

  const signOut = useCallback(() => {
    removeSavedToken();
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoaded, hasError: missingGoogleClientId || hasError, signOut }),
    [user, token, isLoaded, hasError, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const allowedAdminEmails = new Set(
  (
    import.meta.env.VITE_ADMIN_EMAIL ??
    import.meta.env.VITE_ADMIN_EMAILS ??
    import.meta.env.ADMIN_EMAIL ??
    import.meta.env.ADMIN_EMAILS ??
    "officialperfectdev@gmail.com"
  )
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string): boolean {
  return allowedAdminEmails.has(email.trim().toLowerCase());
}

export const isGoogleAuthConfigured = !missingGoogleClientId;
export const authConfigErrorMessage = missingGoogleClientId
  ? "Missing VITE_GOOGLE_CLIENT_ID or GOOGLE_OAUTH_CLIENT_ID environment variable."
  : "";
