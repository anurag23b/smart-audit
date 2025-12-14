import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import AuditResult from "../components/AuditResult";
import { jsPDF } from "jspdf";

export default function AuditDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchAudit = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/audit/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAudit(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.detail || "Failed to load audit");
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id, token, navigate]);

  // ✅ FIX: Compute severity counts with null safety
  const sevCounts = useMemo(() => {
    const buckets = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
      Unknown: 0,
    };

    // ✅ Early return if audit not loaded
    if (!audit) return buckets;

    // ✅ Safe array helper
    const safeArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [];
    };

    // Combine and count issues
    const allIssues = [
      ...safeArray(audit.slither_issues),
      ...safeArray(audit.mythril_issues),
    ];

    allIssues.forEach((iss) => {
      if (!iss || typeof iss !== "object") {
        buckets.Unknown++;
        return;
      }
      const sev = String(iss.severity || iss.impact || "Unknown").trim();
      if (buckets[sev] !== undefined) {
        buckets[sev]++;
      } else {
        buckets.Unknown++;
      }
    });

    return buckets;
  }, [audit]); // ✅ Depends on audit, but safely checks inside

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading audit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 p-6">
        <p className="text-xl mb-4">❌ {error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-600 p-6">
        <p className="text-xl mb-4">Audit not found</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // ✅ Helper to safely handle arrays
  const safeArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [];
  };

  // Re-shape data for AuditResult component
  const result = {
    summary: audit.summary || "No summary available",
    grade: audit.security_grade || "N/A",
    cvss_score: audit.cvss_score ?? 0.0,
    tx_hash: audit.tx_hash,
    contract_hash: audit.contract_hash,
    cid: audit.cid,
    cid_nft: audit.cid_nft,
    slither_report: {
      success: safeArray(audit.slither_issues).length >= 0,
      issues: safeArray(audit.slither_issues),
    },
    mythril_report: {
      success: safeArray(audit.mythril_issues).length >= 0,
      issues: safeArray(audit.mythril_issues),
    },
    analysis_status: {
      slither_success: safeArray(audit.slither_issues).length >= 0,
      mythril_success: safeArray(audit.mythril_issues).length >= 0,
    },
  };

  const sevChip = (label, count, color) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}: {count || 0}
    </span>
  );

  const downloadPdf = () => {
    const doc = new jsPDF();
    const line = (txt, y, link) => {
      if (link) {
        doc.textWithLink(txt, 14, y, { url: link });
      } else {
        doc.text(txt, 14, y);
      }
    };

    doc.setFontSize(14);
    doc.text("Smart Audit Report", 14, 16);
    doc.setFontSize(10);

    line(`Contract: ${audit.contract_hash}`, 26);
    line(`Grade: ${audit.security_grade} | CVSS: ${audit.cvss_score ?? "N/A"}`, 33);
    line(`Tx: ${audit.tx_hash}`, 40, `https://etherscan.io/tx/${audit.tx_hash}`);
    line(
      `Pinata CID: ${audit.cid || "N/A"}`,
      47,
      audit.cid ? `https://gateway.pinata.cloud/ipfs/${audit.cid}` : undefined
    );
    line(
      `NFT.Storage CID: ${audit.cid_nft || "N/A"}`,
      54,
      audit.cid_nft ? `https://nftstorage.link/ipfs/${audit.cid_nft}` : undefined
    );
    line(
      `Timestamp: ${audit.created_at ? new Date(audit.created_at).toLocaleString() : "Unknown"}`,
      61
    );
    line(
      `Severity: C ${sevCounts.Critical} | H ${sevCounts.High} | M ${sevCounts.Medium} | L ${sevCounts.Low} | I ${sevCounts.Informational}`,
      68
    );

    const wrap = (txt) => doc.splitTextToSize(txt, 180);
    doc.text("Summary:", 14, 78);
    doc.text(wrap(audit.summary || ""), 14, 84);

    const addIssues = (title, issues, startY) => {
      let y = startY;
      doc.text(title, 14, y);
      y += 6;
      safeArray(issues)
        .slice(0, 10)
        .forEach((iss, idx) => {
          const block = [
            `${idx + 1}. [${iss.severity || iss.impact || "Unknown"}] ${iss.title || iss.check || "Untitled"}`,
            `Desc: ${iss.description || ""}`,
            `Confidence: ${iss.confidence || "Unknown"}${iss.swc_id ? ` | SWC-${iss.swc_id}` : ""}`,
          ];
          const wrapped = block.flatMap((b) => wrap(b));
          doc.text(wrapped, 18, y);
          y += wrapped.length * 6 + 2;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
      return y;
    };

    let yPos = addIssues("Slither Issues:", audit.slither_issues || [], 110);
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    addIssues("Mythril Issues:", audit.mythril_issues || [], yPos + 6);

    doc.save(`audit-${audit.contract_hash}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl font-bold text-blue-800">🔍 Audit Detail</h1>
          <p className="text-sm text-slate-600">Audit ID: {id}</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded transition"
          >
            ← Back
          </Link>
          <button
            onClick={downloadPdf}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition"
          >
            Download PDF
          </button>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow border border-slate-100">
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {sevChip("Critical", sevCounts.Critical, "bg-red-700 text-white")}
          {sevChip("High", sevCounts.High, "bg-red-600 text-white")}
          {sevChip("Medium", sevCounts.Medium, "bg-orange-500 text-white")}
          {sevChip("Low", sevCounts.Low, "bg-yellow-400 text-black")}
          {sevChip("Info", sevCounts.Informational, "bg-slate-200 text-slate-800")}
        </div>
      </div>

      <AuditResult result={result} />

      <div className="bg-white p-6 rounded-2xl shadow border border-slate-100 text-sm text-slate-700 space-y-2">
        <p>
          <strong>Contract Hash:</strong>{" "}
          <code className="bg-slate-100 px-2 py-1 rounded">{audit.contract_hash}</code>
        </p>
        <p>
          <strong>Audit Timestamp:</strong>{" "}
          {audit.created_at ? new Date(audit.created_at).toLocaleString() : "Unknown"}
        </p>
      </div>
    </div>
  );
}