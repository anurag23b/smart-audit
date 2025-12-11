# Contributing to Smart Audit

Thank you for your interest in contributing to Smart Audit! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/smart-audit.git
   cd smart-audit
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

See the main [README.md](README.md) for detailed setup instructions.

### Quick Setup

1. Set up environment variables (copy from `.env.example` files)
2. Start services with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Code Style

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints where possible
- Format with `black` or `autopep8`
- Maximum line length: 100 characters
- Run linting before committing:
  ```bash
  cd smart-audit-backend
  flake8 app
  ```

### JavaScript/React (Frontend)

- Follow ESLint configuration
- Use functional components with hooks
- Prefer named exports over default exports for utilities
- Run linting before committing:
  ```bash
  cd smart-audit-frontend
  npm run lint
  ```

### Solidity (Contracts)

- Follow Solidity Style Guide
- Use SPDX license identifiers
- Maximum line length: 100 characters
- Format with `forge fmt`:
  ```bash
  cd smart-audit-backend/smart-audit-chain
  forge fmt
  ```

## Testing

### Backend Tests

```bash
cd smart-audit-backend
pytest tests/ --cov=app
```

### Frontend Tests

```bash
cd smart-audit-frontend
npm test
```

### Contract Tests

```bash
cd smart-audit-backend/smart-audit-chain
forge test
```

## Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
- `feat(audit): add support for multiple contract versions`
- `fix(auth): resolve JWT expiration issue`
- `docs(readme): update API documentation`

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** locally
4. **Update CHANGELOG.md** with your changes
5. **Create a PR** with a clear description:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Screenshots (if UI changes)

## Project Structure

- `smart-audit-backend/`: FastAPI backend application
- `smart-audit-frontend/`: React frontend application
- `smart-audit-backend/smart-audit-chain/`: Foundry smart contracts
- `docs/`: Documentation and images

## Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Additional test coverage
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🔒 Security enhancements
- 🌐 Support for additional static analysis tools

## Questions?

Open an issue for discussion or questions about contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

Thank you for contributing to Smart Audit! 🎉
