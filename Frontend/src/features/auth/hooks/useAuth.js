import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    const {
        user,
        setUser,
        loading,
        setLoading
    } = context;


    const handleLogin = async (email, password) => {

        setLoading(true);

        try {

            const data = await login({
                email,
                password
            });

            console.log("Login response:", data);

            // IMPORTANT
            setUser(data.user);

            return data;

        } catch (error) {

            throw error;

        } finally {

            setLoading(false);

        }
    };


    const handleRegister = async (
        username,
        email,
        password
    ) => {

        setLoading(true);

        try {

            const data = await register({
                username,
                email,
                password
            });

            setUser(data.user);

            return data;

        } catch (error) {

            throw error;

        } finally {

            setLoading(false);

        }
    };


    const handleLogout = async () => {

        setLoading(true);

        try {

            await logout();

            setUser(null);

        } finally {

            setLoading(false);

        }
    };


    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    };
};