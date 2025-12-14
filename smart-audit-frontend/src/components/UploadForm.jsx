import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

export default function UploadForm({ onResult }) {
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const { token } = useAuth();

	const handleUpload = async (e) => {
		e.preventDefault();
		if (!file || !token) {
			alert("File or token missing!");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		setUploading(true);

		try {
			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/upload`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (onResult) onResult(response.data);
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Upload failed!");
		} finally {
			setUploading(false);
		}
	};

	return (
		<form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow-md space-y-4">
			<h2 className="text-xl font-semibold">📄 Upload Solidity Contract</h2>

			<input
				type="file"
				accept=".sol"
				onChange={(e) => setFile(e.target.files?.[0] || null)}
				className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
			/>

			<button
				type="submit"
				disabled={uploading}
				className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
			>
				{uploading ? "Uploading..." : "Audit Contract"}
			</button>
		</form>
	);
}