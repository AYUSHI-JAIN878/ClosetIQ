import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("closetiq_user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error("Saved user error:", error);

      localStorage.removeItem("closetiq_user");

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {
      const token = localStorage.getItem("closetiq_token");

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (!mounted) return;

        if (response?.user) {
          setUser(response.user);

          localStorage.setItem(
            "closetiq_user",
            JSON.stringify(response.user)
          );
        } else {
          throw new Error("Invalid user response.");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);

        if (!mounted) return;

        localStorage.removeItem("closetiq_token");
        localStorage.removeItem("closetiq_user");

        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    verifyUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("Please enter your email.");
    }

    if (!password) {
      throw new Error("Please enter your password.");
    }

    const response = await api.post("/auth/login", {
      email: cleanEmail,
      password,
    });

    if (!response?.token || !response?.user) {
      throw new Error(
        response?.message ||
          "Login failed. Invalid response from server."
      );
    }

    localStorage.setItem(
      "closetiq_token",
      response.token
    );

    localStorage.setItem(
      "closetiq_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const response = await api.post("/auth/register", {
      name: cleanName,
      email: cleanEmail,
      password,
    });

    if (!response?.token || !response?.user) {
      throw new Error(
        response?.message ||
          "Registration failed."
      );
    }

    localStorage.setItem(
      "closetiq_token",
      response.token
    );

    localStorage.setItem(
      "closetiq_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem("closetiq_token");
    localStorage.removeItem("closetiq_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}