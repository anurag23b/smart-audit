-- migrations/init.sql

CREATE TABLE IF NOT EXISTS user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
    contract_hash VARCHAR(66) UNIQUE NOT NULL,
    security_grade VARCHAR(2) NOT NULL CHECK (security_grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
    summary TEXT NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
