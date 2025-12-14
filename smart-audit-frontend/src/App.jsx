// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import UploadForm from "./components/UploadForm";
import AuditResult from "./components/AuditResult";
import AuditHistory from "./components/AuditHistory";
import AuthPage from "./pages/AuthPage";
import AuditDetailPage from "./pages/AuditDetailPage";
import VerifyPage from "./pages/VerifyPage";

function Dashboard() {
  const { logout } = useAuth();
  const [result, setResult] = React.useState(null);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">🔎 Smart Contract Auditor</h1>
        <div className="flex gap-3">
          {/* ✅ ADDED: Verify button */}
          <Link 
            to="/verify" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            🔍 Verify
          </Link>
          <button 
            onClick={logout} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>
      <UploadForm onResult={setResult} />
      <AuditResult result={result} />
      <AuditHistory />
    </div>
  );
}

export default function App() {
  const { token } = useAuth();

  if (!token) return <AuthPage />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/audit/:id" element={<AuditDetailPage />} />
      {/* ✅ FIXED: Removed :contractHash param */}
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}