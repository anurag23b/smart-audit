import React, { useState } from "react";

const safe = (value) => {
  if (!value) return "N/A";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};


const getBadgeColor = (grade) => {
  if (!grade || grade.startsWith("N/A")) return "bg-gray-500";
  switch (grade) {
    case "A+":
    case "A":
      return "bg-green-600";
    case "B+":
    case "B":
      return "bg-yellow-500";
    case "C":
      return "bg-orange-500";
    case "D":
    case "F":
      return "bg-red-600";
    default:
      return "bg-gray-500";
  }
};

export default function AuditResult({ result }) {
  const [tab, setTab] = useState("summary");

  if (!result) return null;

  const {
    summary,
    grade = "N/A",
    cvss_score = 0.0,
    tx_hash,
    contract_hash,
    slither_report,
    mythril_report,
    cid,
    cid_nft,
    analysis_status,
  } = result;

  // Check if reports have actual issues
  const hasSlitherIssues = slither_report?.success && slither_report?.issues?.length > 0;
  const hasMythrilIssues = mythril_report?.success && mythril_report?.issues?.length > 0;
  const toolsBothFailed = !slither_report?.success && !mythril_report?.success;
  const anyToolFailed = !slither_report?.success || !mythril_report?.success;
  const slitherCount = slither_report?.issues?.length || 0;
  const mythrilCount = mythril_report?.issues?.length || 0;

  const countBySeverity = (issues = []) => {
    const buckets = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0,
      Unknown: 0,
    };
    issues.forEach((iss) => {
      const sev = (iss.severity || iss.impact || "Unknown").trim();
      if (buckets[sev] !== undefined) buckets[sev] += 1;
      else buckets.Unknown += 1;
    });
    return buckets;
  };

  const slitherSeverity = countBySeverity(slither_report?.issues || []);
  const mythrilSeverity = countBySeverity(mythril_report?.issues || []);

  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const renderIssuesTable = (toolName, report) => {
    if (!report?.success) {
      return (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-800 font-semibold">⚠️ {toolName} Analysis Failed</p>
          <p className="text-sm text-red-700 mt-2">{report?.error || "Unknown error occurred"}</p>
        </div>
      );
    }

    if (!report?.issues?.length) {
      return (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-800">✅ No issues found by {toolName}</p>
        </div>
      );
    }

    const sevColor = (sev) => {
      switch (sev) {
        case "Critical":
          return "bg-red-700 text-white";
        case "High":
          return "bg-red-600 text-white";
        case "Medium":
          return "bg-orange-500 text-white";
        case "Low":
          return "bg-yellow-400 text-black";
        case "Informational":
          return "bg-slate-200 text-slate-800";
        default:
          return "bg-gray-300 text-gray-800";
      }
    };

    return (
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Severity</th>
              <th className="px-3 py-2 text-left font-semibold">Title</th>
              <th className="px-3 py-2 text-left font-semibold">Description</th>
              <th className="px-3 py-2 text-left font-semibold">Confidence</th>
              {toolName === "Mythril" && <th className="px-3 py-2 text-left font-semibold">SWC</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.issues.map((issue, idx) => {
              const sev = issue.severity || issue.impact || "Unknown";
              return (
                <tr
                  key={`${toolName}-${idx}`}
                  className="align-top odd:bg-slate-50 hover:bg-slate-100"
                >
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${sevColor(sev)}`}>
                      {sev}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    {safe(issue.title || issue.check || "Untitled")}
                  </td>

                  <td className="px-3 py-2 text-slate-700">
                    {safe(issue.description)}
                  </td>

                  <td className="px-3 py-2 text-slate-600">
                    {safe(issue.confidence || "Unknown")}
                  </td>
                  {toolName === "Mythril" && (
                    <td className="px-3 py-2 text-slate-600">
                      {issue.swc_id ? `SWC-${issue.swc_id}` : "-"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (tab) {
      case "summary":
        return (
          <div className="space-y-3">
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">{summary}</pre>
            {/* Analysis Status */}
            {analysis_status && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700">
                  <strong>📊 Analysis Status:</strong>
                </p>
                <p className="text-sm">
                  Slither: {analysis_status.slither_success ? "✅ Success" : "❌ Failed"}
                </p>
                <p className="text-sm">
                  Mythril: {analysis_status.mythril_success ? "✅ Success" : "❌ Failed"}
                </p>
              </div>
            )}
          </div>
        );
      case "slither":
        return renderIssuesTable("Slither", slither_report);
      case "mythril":
        return renderIssuesTable("Mythril", mythril_report);
      default:
        return null;
    }
  };

  return (
    <div id="audit-report" className="mt-6 p-6 bg-white shadow-2xl rounded-2xl space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">🔍 Audit Report</h2>

      {/* Tab Navigation */}
      <div className="flex gap-3 border-b pb-3 mb-4">
        <button
          onClick={() => setTab("summary")}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            tab === "summary"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          LLM Summary
        </button>
        <button
          onClick={() => setTab("slither")}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            tab === "slither"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Slither Report {slither_report?.success ? `✅ (${slitherCount})` : "⚠️"}
        </button>
        <button
          onClick={() => setTab("mythril")}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            tab === "mythril"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Mythril Report {mythril_report?.success ? `✅ (${mythrilCount})` : "⚠️"}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">{renderTabContent()}</div>

      {/* Analysis failure warning */}
      {toolsBothFailed && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <p className="text-sm text-yellow-800 font-semibold">
            Static analysis tools failed on this machine (likely ARM/M1). Showing LLM-only summary.
            Run with DOCKER_DEFAULT_PLATFORM=linux/amd64 for full Slither/Mythril results.
          </p>
        </div>
      )}

      {/* Security Grade Badge */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
        <span
          className={`text-white px-6 py-2 rounded-full text-lg font-bold ${getBadgeColor(grade)}`}
        >
          Security Grade: {grade}
        </span>
        <span className="text-gray-700 font-semibold">
          CVSS Score: {cvss_score?.toFixed ? cvss_score.toFixed(1) : "0.0"}/10.0
          {anyToolFailed && "(capped due to tool failure)"}
        </span>
        <span className="text-sm text-gray-600">
          Slither issues: {slitherCount} • Mythril issues: {mythrilCount}
        </span>
        {(hasSlitherIssues || hasMythrilIssues) && (
          <span className="text-sm text-gray-600">
            Sev counts — S: {slitherSeverity.Critical + mythrilSeverity.Critical}C /{" "}
            {slitherSeverity.High + mythrilSeverity.High}H /{" "}
            {slitherSeverity.Medium + mythrilSeverity.Medium}M /{" "}
            {slitherSeverity.Low + mythrilSeverity.Low}L /{" "}
            {slitherSeverity.Informational + mythrilSeverity.Informational}I
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded">
        <p>
          <strong>📦 Contract Hash:</strong>{" "}
          <code className="bg-gray-200 px-2 py-1 rounded text-xs">{contract_hash}</code>
          <button
            onClick={() => copy(contract_hash)}
            className="ml-2 text-xs text-blue-700 underline"
          >
            Copy
          </button>
        </p>
        <p>
          <strong>🔗 Blockchain Tx:</strong>{" "}
          {tx_hash && tx_hash !== "BLOCKCHAIN_FAILED" ? (
            <>
              <a
                href={`https://etherscan.io/tx/${tx_hash}`}
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tx_hash?.slice(0, 20)}...
              </a>
              <button
                onClick={() => copy(tx_hash)}
                className="ml-2 text-xs text-blue-700 underline"
              >
                Copy
              </button>
            </>
          ) : (
            "N/A"
          )}
        </p>
        {cid && cid !== "IPFS_FAILED" && (
          <p>
            <strong>📁 IPFS (Pinata) CID:</strong>{" "}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {cid.slice(0, 20)}...
            </a>
            <button onClick={() => copy(cid)} className="ml-2 text-xs text-blue-700 underline">
              Copy
            </button>
          </p>
        )}
        {cid_nft && cid_nft !== "NFT_STORAGE_FAILED" && (
          <p>
            <strong>📁 IPFS (NFT.Storage) CID:</strong>{" "}
            <a
              href={`https://nftstorage.link/ipfs/${cid_nft}`}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {cid_nft.slice(0, 20)}...
            </a>
            <button
              onClick={() => copy(cid_nft)}
              className="ml-2 text-xs text-blue-700 underline"
            >
              Copy
            </button>
          </p>
        )}
      </div>
    </div>
  );
}