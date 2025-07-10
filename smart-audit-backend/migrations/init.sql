-- migrations/init.sql

CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    contract_hash VARCHAR(66) UNIQUE NOT NULL, -- 64-byte SHA256 hash + 0x prefix if any
    security_grade VARCHAR(2) NOT NULL CHECK (security_grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
    summary TEXT NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
