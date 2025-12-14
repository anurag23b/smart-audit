import React, { useState } from "react";
import axios from "axios";

export default function VerifyHash() {
	const [taskId, setTaskId] = useState("");
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleVerify = async (e) => {
		e.preventDefault();
		if (!taskId) return;
		setLoading(true);
		setResult(null);
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/verify/${taskId}`
			);
			setResult(response.data);
		} catch (err) {
			console.error(err);
			alert("Verification failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-xl shadow-md mt-6 space-y-4">
			<h2 className="text-xl font-semibold text-gray-800">✅ Verify Contract Hash</h2>

			<form onSubmit={handleVerify} className="flex gap-4 items-center">
				<input
					type="text"
					value={taskId}
					onChange={(e) => setTaskId(e.target.value)}
					placeholder="Enter contract hash"
					className="flex-grow p-2 border rounded-md"
				/>

				<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
					{loading ? "Verifying..." : "Verify"}
				</button>
			</form>

			{result && (
				<div className="text-sm mt-4 space-y-2 text-gray-700">
					<p>
						<strong>Status:</strong> {result.status ? "✅ Verified" : "❌ Not Found"}
					</p>
					<p>
						<strong>Expected Hash:</strong> <code>{result.expected_hash}</code>
					</p>
					<p>
						<strong>Stored Hash:</strong> <code>{result.stored_hash}</code>
					</p>
				</div>
			)}
		</div>
	);
}