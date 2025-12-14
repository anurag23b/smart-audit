import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";

export default function VerifyPage() {
  const { token, logout } = useAuth();
  const [contractHash, setContractHash] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!contractHash.trim()) {
      setError("Please enter a contract hash");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/verify/${contractHash.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error("Verify error:", err);
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-800">🔗 Verify Contract</h1>
        <div className="flex gap-3">
          <Link
            to="/"
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded transition"
          >
            ← Back
          </Link>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Verify Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enter Contract Hash
        </h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Hash (SHA-256)
            </label>
            <input
              type="text"
              value={contractHash}
              onChange={(e) => setContractHash(e.target.value)}
              placeholder="e.g., 4913a9978b0663830da8f0b2c577e531b2ecc007..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Verifying..." : "🔍 Verify Contract"}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-semibold">❌ {error}</p>
        </div>
      )}

      {/* Results Display */}
      {data && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Verification Results
          </h2>

          <div className="p-4 rounded-lg border-2 text-center text-lg font-semibold"
               style={{
                 backgroundColor: data.status ? "#dcfce7" : "#fee2e2",
                 borderColor: data.status ? "#22c55e" : "#ef4444",
                 color: data.status ? "#166534" : "#991b1b"
               }}>
            {data.status ? "✅ Contract Verified" : "❌ Contract Not Found"}
          </div>

          <div className="space-y-3 text-sm text-slate-700">
            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-gray-900 mb-1">Expected Hash:</strong>
              <code className="text-xs break-all">{data.expected_hash}</code>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-gray-900 mb-1">Stored Hash:</strong>
              <code className="text-xs break-all">{data.stored_hash || "N/A"}</code>
            </div>

            {data.tx_hash && data.tx_hash !== "BLOCKCHAIN_FAILED" && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">Blockchain Transaction:</strong>
                <a
                  href={`https://etherscan.io/tx/${data.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {data.tx_hash}
                </a>
              </div>
            )}

            {data.cid && data.cid !== "IPFS_FAILED" && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">IPFS (Pinata) CID:</strong>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${data.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {data.cid}
                </a>
              </div>
            )}

            {data.cid_nft && data.cid_nft !== "NFT_STORAGE_FAILED" && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">IPFS (NFT.Storage) CID:</strong>
                <a
                  href={`https://nftstorage.link/ipfs/${data.cid_nft}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {data.cid_nft}
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">Security Grade:</strong>
                <span className="text-lg font-bold">{data.grade || "N/A"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">CVSS Score:</strong>
                <span className="text-lg font-bold">{data.cvss_score ?? "N/A"}</span>
              </div>
            </div>

            {data.summary && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-2">Summary:</strong>
                <p className="text-xs whitespace-pre-wrap">{data.summary}</p>
              </div>
            )}

            {data.created_at && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-gray-900 mb-1">Created At:</strong>
                <span className="text-xs">{new Date(data.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}