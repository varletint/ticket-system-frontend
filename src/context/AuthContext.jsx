import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(user);

    return user;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { user, accessToken, refreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(user);

    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  // Role checks
  const isOrganizer = user?.role === "organizer";
  const isValidator = user?.role === "validator";
  const isAdmin = user?.role === "admin";
  const isBuyer = user?.role === "buyer";
  const isApprovedOrganizer =
    isOrganizer && user?.organizerProfile?.platformStatus === "approved";
  const hasPaystack = user?.organizerProfile?.paystack?.isActive;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isOrganizer,
    isValidator,
    isAdmin,
    isBuyer,
    isApprovedOrganizer,
    hasPaystack,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
