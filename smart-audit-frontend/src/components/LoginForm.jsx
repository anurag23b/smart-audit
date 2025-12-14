import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }
      login(data.access_token, data.user_id);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 border border-slate-200 rounded-xl bg-slate-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Login</h3>
        <span className="text-xs text-slate-500">Existing users</span>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">{error}</p>}
      <div className="space-y-2">
        <label className="text-sm text-slate-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2.5 rounded-lg"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2.5 rounded-lg"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition"
      >
        Log In
      </button>
    </form>
  );
}