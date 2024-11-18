# Contributing to Secure Notes

First off, thank you for considering contributing to Secure Notes! It's people like you that make Secure Notes such a great tool.

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
├── src/                      # Frontend source code
│   ├── app/                  # Next.js pages and routes
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx       # Root layout
│   │   └── s/               # Session routes
│   │       └── [sessionId]/ # Session pages
│   │           ├── page.tsx # Session view
│   │           └── d/       # Document routes
│   │               └── [documentId]/ # Document pages
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── DocumentEditor/  # Document editing component
│   │   ├── DocumentList/    # Document listing component
│   │   ├── MainScreen.tsx  # Main screen component
│   │   ├── NewSessionDialog.tsx
│   │   └── LoadSessionDialog.tsx
│   ├── lib/                # Utility functions
│   │   ├── api.ts         # API client
│   │   ├── crypto.ts      # Encryption utilities
│   │   ├── session.ts     # Session management
│   │   └── utils.ts       # General utilities
│   └── types/             # TypeScript type definitions
│       └── api.ts         # API types
├── backend/               # Flask backend
│   ├── app.py            # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Backend environment variables
├── cursor-directions/    # Cursor IDE reference files
│   ├── instructions.md   # Project instructions
│   ├── sample-crypto-javascript.md
│   └── sample-database-model.md
├── .env.local           # Frontend environment variables
├── package.json         # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── LICENSE             # MIT license
├── README.md           # Project documentation
└── CONTRIBUTING.md     # Contribution guidelines
```

This structure follows these principles:

- Feature-first organization in components
- Route-based organization in app directory
- Clear separation of frontend and backend
- Utility functions grouped by purpose
- Configuration files at root level
- Documentation and reference files clearly separated

## Testing

Please read [testing-instructions.md](testing-instructions.md) for details on how to write tests for the backend.

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing! 🎉
