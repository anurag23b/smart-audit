// src/pages/AuthPage.jsx
import React from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="text-white space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Smart Contract Security</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            🔐 Smart Audit Platform
          </h1>
          <p className="text-blue-100 text-lg">
            Upload Solidity contracts, run Slither/Mythril analysis, get LLM-backed
            summaries, and pin results on-chain via Pinata.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-blue-100">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">JWT Auth</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Slither</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Mythril</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">LLM Summary</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">Pinata/IPFS</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Access your dashboard</h2>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              Secure by design
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <LoginForm />
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}