import { createContext, useState } from "react";
import api from "../utils/axiosApi.util";

const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const register = async (userForm) => {
        try {
            const res = await api.post("/users/register", userForm);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

    const value = {
        register
    }
}