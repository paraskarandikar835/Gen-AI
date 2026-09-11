import "../auth.form.scss";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const { handleLogin, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            await handleLogin(email, password);

            // Go to home after successful login
            navigate("/");

        } catch (error) {
            console.error(
                "Login failed:",
                error.response?.data?.message || error.message
            );
        }
    };

    return (
        <div className="form-container">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <div className="input-group">
                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>

        </div>
    );
};

export default Login;