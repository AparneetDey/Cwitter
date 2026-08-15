import { createContext, useContext, useState } from "react";
import api from "../utils/axiosApi.util";

const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const register = async (userForm) => {
        try {
            const res = await api.post("/users/register", userForm);

            await getCurrentUser();
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);
            
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    const login = async (userForm) => {
        try {
            const res = await api.post("/users/login", userForm);

            await getCurrentUser();
            localStorage.setItem("accessToken", res.data.data.accessToken);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);

            return res.data;
        } catch (error) {
            throw error
        }
    }

    const forgotPassword = async (email) => {
        try {
            const res = await api.post("/users/forgot-password", {email});
        } catch (error) {
            
			console.log(error);
            throw error
        }
    }

    const getCurrentUser = async () => {
        try {
            const res = await api.get("/users/current-user");

            setUser(res.data.data.user);
        } catch (error) {
            throw error
        }
    }

    const value = {
        user,
        isAuthenticated: !!user,
        register,
        login,
        forgotPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext);