# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Comprehensive project cleanup and structure validation
- Improved `.gitignore` with comprehensive patterns for Python, Node, Docker artifacts
- Enhanced workflow files with conditional test execution
- Updated environment variable templates (root, backend, frontend)
- Complete README.md with architecture diagram, screenshots, API documentation
- CONTRIBUTING.md with contribution guidelines
- Updated docker-compose.yml with correct healthcheck configuration
- Support for dual IPFS pinning (Pinata + NFT.Storage)

### Fixed
- Docker Compose healthcheck using environment variables correctly
- Workflow files now handle missing test directories gracefully
- Removed placeholder deployment steps from workflows
- Environment variable consistency across all configuration files

### Changed
- README.md restructured with comprehensive documentation
- Environment variable naming standardized

## Previous Releases

### [Earlier]
- Added vulnerability persistence (Slither/Mythril issues, dual CIDs) and detail API.
- UI: Detail page, vuln tables with severity, copy buttons, PDF export, verification page.
- Dual IPFS pinning (Pinata + NFT.Storage).
- CI workflow for backend/frontend/docker builds.
- Docs refreshed with architecture diagram, envs, ARM guidance, placeholders for screenshots.
