import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AuthPage from "./pages/AuthPage";
import AuditDetailPage from "./pages/AuditDetailPage";
import VerifyPage from "./pages/VerifyPage";
import UploadForm from "./components/UploadForm";
import AuditResult from "./components/AuditResult";
import AuditHistory from "./components/AuditHistory";

function Dashboard() {
  const { token, logout } = useAuth();
  const [result, setResult] = useState(null);

  if (!token) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <nav className="bg-white shadow mb-6 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Smart Audit</h1>
        <div>
          <Link to="/verify" className="mr-4 text-blue-600">Verify</Link>
          <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <UploadForm onResult={setResult} />
        {result && <AuditResult result={result} />}
        <AuditHistory />
      </div>
    </div>
  );
}

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={token ? <Navigate to="/" /> : <AuthPage />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/audit/:id" element={<AuditDetailPage />} />
      <Route path="/verify" element={<VerifyPage />} />
    </Routes>
  );
}

export default App;