import React, { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Registration successful! Now log in.");
    } else {
      alert(data.detail || "Registration failed");
    }
  };

  return (
    <form onSubmit={register} className="space-y-4 p-5 border border-slate-200 rounded-xl bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Register</h3>
        <span className="text-xs text-slate-500">New users</span>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-2.5 rounded-lg"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          className="w-full border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-2.5 rounded-lg"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition"
      >
        Register
      </button>
    </form>
  );
}