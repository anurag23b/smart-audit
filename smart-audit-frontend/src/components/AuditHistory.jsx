// src/components/AuditHistory.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

export default function AuditHistory() {
  const { token } = useAuth();
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/my-audits`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ Include token
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch audits");
        return res.json();
      })
      .then(setAudits)
      .catch(console.error);
  }, [token]);

  return (
    <div className="mt-8 p-6 bg-white shadow-xl rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">🕘 Your Past Audits</h2>
        <span className="text-xs text-slate-500">Latest 20 entries</span>
      </div>

      {!audits.length ? (
        <p className="text-slate-500 text-sm">No audits found yet. Upload a contract to get started.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Contract</th>
                <th className="px-3 py-3 text-left font-semibold">Grade</th>
                <th className="px-3 py-3 text-left font-semibold">Tx</th>
                <th className="px-3 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-3 py-3 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-mono text-xs">{audit.contract_hash.slice(0, 14)}...</td>
                  <td className="px-3 py-3 font-semibold">{audit.security_grade}</td>
                  <td className="px-3 py-3">
                    <a
                      href={`https://etherscan.io/tx/${audit.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {audit.tx_hash?.slice(0, 14) || "N/A"}...
                    </a>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {audit.created_at ? new Date(audit.created_at).toLocaleString() : "Unknown"}
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/audit/${audit.id}`} className="text-blue-600 hover:text-blue-800 underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
