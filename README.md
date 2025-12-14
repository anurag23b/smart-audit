# Smart Audit – AI-Powered Smart Contract Auditor

![Tests](https://img.shields.io/github/actions/workflow/status/anurag/smart-audit/ci.yml?label=Tests&logo=github)

## Overview
Hybrid Slither/Mythril + LLM pipeline to audit Solidity contracts, grade risk (CVSS), pin reports to IPFS (Pinata + NFT.Storage), and record results on-chain. Authenticated dashboard with history, detailed audit views, and verification by contract hash.

## Architecture (text sketch)
- Frontend (React + Vite) → FastAPI backend
- Static analyzers: Slither, Mythril (skipped on ARM by default; use amd64 emulation for full analysis)
- LLM post-processing via OpenRouter
- Storage: Postgres, Redis
- IPFS: Pinata + NFT.Storage (dual pin)
- On-chain: AuditScore.sol recorded via Web3 provider

## Setup
1) Copy env templates and fill in secrets:
```
cp env.example .env
cp smart-audit-backend/env.example smart-audit-backend/.env.backend
```
2) Start services:
- ARM/M1 default (LLM-only if static tools fail): `docker-compose up --build`
- Full Slither/Mythril via amd64 emulation: `DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose up --build`

## Environment variables
- `.env`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `VITE_API_URL`
- `smart-audit-backend/.env.backend`: `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `WEB3_PROVIDER`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`, `PINATA_JWT`, `PINATA_GATEWAY`, `NFT_STORAGE_TOKEN`, `OPENROUTER_API_KEY`, `FORCE_ANALYSIS_ON_ARM` (optional)

## Notes
- On ARM (M1/M2) static tools are skipped by default; results will be LLM-only. Force run with `FORCE_ANALYSIS_ON_ARM=true`, but expect failures.
- Keep secrets out of version control; use the env files above.
- IPFS: results are pinned to Pinata; if `NFT_STORAGE_TOKEN` is set, also pinned to NFT.Storage and the CID is returned in the upload response.

## Deployment
- Local: see setup above.
- CI: `.github/workflows/ci.yml` runs backend compile, frontend build, docker builds.
- Postgres migration: apply `smart-audit-backend/migrations/add_issues_columns.sql` to add issue JSON columns and `cid_nft` if your DB was created before this update.

## Screenshots
- Dashboard, Audit Detail, Verification (add your captures here)

## License
MIT

