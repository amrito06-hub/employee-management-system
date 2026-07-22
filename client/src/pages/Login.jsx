import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server se connection nahi ho pa raha.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">

      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-sm"
      >

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Employee Management
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-3 mb-4 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-3 mb-6 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  );
}

export default Login;