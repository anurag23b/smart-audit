-- Adds JSONB columns for tool issues and cid_nft to audit table
ALTER TABLE IF EXISTS audit
    ADD COLUMN IF NOT EXISTS slither_issues JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS mythril_issues JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS cid_nft TEXT;

