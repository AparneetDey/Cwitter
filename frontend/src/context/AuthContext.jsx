import { createContext, useContext, useState } from "react";
import api from "../utils/axiosApi.util";

const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const register = async (userForm) => {
        try {
            const res = await api.post("/users/register", userForm);

            return res.data;
        } catch (error) {
            throw error;
        }
    }

    const login = async (userForm) => {
        try {
            const res = await api.post("/users/login", userForm);

            return res.data;
        } catch (error) {
            throw error
        }
    }

    const value = {
        user,
        register,
        login
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext);