import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem("token") || null);
	const [userId, setUserId] = useState(() => localStorage.getItem("userId") || null);

	useEffect(() => {
		if (token) {
			localStorage.setItem("token", token);
			localStorage.setItem("userId", userId);
		} else {
			localStorage.removeItem("token");
			localStorage.removeItem("userId");
		}
	}, [token, userId]);

	const login = (newToken, newUserId) => {
		setToken(newToken);
		setUserId(newUserId);
	};

	const logout = () => {
		setToken(null);
		setUserId(null);
	};

	return (
		<AuthContext.Provider value={{ token, userId, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);