import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";
import { userApi } from "../api/user.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await userApi.profile();
      setUser(res.data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (emailid, password) => {
    const res = await authApi.login({ emailid, password });
    await refreshProfile();
    return res.data;
  };

  const signup = async (firstname, emailid, password) => {
    const res = await authApi.register({ firstname, emailid, password });
    await refreshProfile();
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, booting, login, signup, logout, refreshProfile }),
    [user, booting, login, signup, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}