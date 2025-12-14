import React from "react";
import ExportReport from "./ExportReport";

export default function AuditModal({ audit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-3xl w-full shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Audit Details</h2>
            <p className="text-sm text-slate-500">Full context from this recorded audit</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div className="space-y-2">
            <p><strong>Contract Hash:</strong> <span className="font-mono">{audit.contract_hash}</span></p>
            <p><strong>Security Grade:</strong> <span className="font-semibold">{audit.security_grade}</span></p>
            <p><strong>CVSS Score:</strong> {audit.cvss_score ?? "N/A"}</p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Transaction Hash:</strong>{" "}
              <a href={`https://etherscan.io/tx/${audit.tx_hash}`} target="_blank" rel="noreferrer" className="text-blue-600">
                {audit.tx_hash}
              </a>
            </p>
            <p>
              <strong>IPFS (Pinata) CID:</strong>{" "}
              {audit.cid ? (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${audit.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  {audit.cid}
                </a>
              ) : "N/A"}
            </p>
            <p><strong>Date:</strong> {audit.created_at ? new Date(audit.created_at).toLocaleString() : "Unknown"}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 max-h-64 overflow-auto whitespace-pre-wrap">
          {audit.summary}
        </div>

        <div className="flex items-center justify-between pt-2">
          <ExportReport audit={audit} />
          <button onClick={onClose} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}