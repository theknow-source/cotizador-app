"use client";

import { useState, useEffect, useCallback } from "react";
import { AUTH_KEY, AUTH_PIN } from "@/lib/constants";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    setIsAuthenticated(auth === "true");
  }, []);

  const login = useCallback((pin: string): boolean => {
    if (pin === AUTH_PIN) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
