import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Register
export async function register({ username, email, password }) {
    try {
        const response = await api.post("/api/auth/register", {
            username,
            email,
            password
        });

        return response.data;

    } catch (err) {
        console.error("Register error:", err);
        throw err;
    }
}

// Login
export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email,
            password
        });

        return response.data;

    } catch (err) {
        console.error("Login error:", err);
        throw err;
    }
}

// Logout
export async function logout() {
    try {
        const response = await api.post("/api/auth/logout");

        return response.data;

    } catch (err) {
        console.error("Logout error:", err);
        throw err;
    }
}

// Get current user
export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me");

        return response.data;

    } catch (err) {
        console.error("Get user error:", err);
        throw err;
    }
}