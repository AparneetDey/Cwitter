import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axiosApi.util";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const res = await api.get("/users/current-user");
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const register = async (userForm) => {
    try {
      const res = await api.post("/users/register", userForm);
      if (res.data?.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
      }
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
      } else {
        await getCurrentUser();
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (userForm) => {
    try {
      const res = await api.post("/users/login", userForm);
      if (res.data?.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.data.accessToken);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
      }
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
      } else {
        await getCurrentUser();
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.delete("/users/logout");
    } catch (error) {
      console.log(error);
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/users/forgot-password", { email });
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    forgotPassword,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);