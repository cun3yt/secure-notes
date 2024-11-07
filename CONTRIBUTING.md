# Contributing to Secure Notes

First off, thank you for considering contributing to Secure Notes! It's people like you that make Secure Notes such a great tool.

## Development Environment

### Recommended IDE

We recommend using [Cursor](https://cursor.sh/) IDE for development. Cursor is an AI-powered code editor that:

- Understands the codebase context
- Provides intelligent code completion
- Helps with code generation and refactoring
- Has built-in pair programming features

#### Setting up Cursor

1. Download and install Cursor from https://cursor.sh/
2. Open the project folder in Cursor
3. Cursor will automatically recognize the project structure and provide relevant suggestions

#### Cursor Directions

We provide sample files to help it understand the implementation:

- `cursor-directions/instructions.md`: Instructions on how to use Cursor to understand the codebase. It is used initially to understand the codebase. It is safe to ignore for future contributions.
- `cursor-directions/sample-crypto-javascript.md`: Examples of encryption/decryption operations to direct Cursor to the relevant code. Again, safe to ignore for future contributions.
- `cursor-directions/sample-database-model.md`: Database schema and model relationships to direct Cursor to the relevant code. Again, safe to ignore for future contributions.

These files serve as reference implementations and should be consulted when making changes to related functionality.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git commit -m "feat: add some feature"
   ```

   Please follow [Conventional Commits](https://www.conventionalcommits.org/) specification

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Guidelines

We follow the Conventional Commits specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code
- Follow the ESLint configuration
- Use async/await instead of Promises
- Use functional components with hooks for React

### Python Style Guide

- Follow PEP 8
- Use type hints where possible
- Use f-strings for string formatting
- Follow Flask best practices

## Project Structure

```
secure-notes/
├── src/                    # Frontend source code
│   ├── app/               # Next.js pages and routes
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── backend/               # Flask backend
│   ├── app.py            # Main application file
│   └── requirements.txt   # Python dependencies
└── sample/               # Sample implementation files
    ├── crypto-javascript.md
    └── database-model.md
```

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing! 🎉
