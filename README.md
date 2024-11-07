# Secure Notes

A secure, end-to-end encrypted note-taking application built with Next.js and Flask.

## Features

- 🔐 End-to-end encryption using Web Crypto API
- 📝 Markdown-style text editor
- 🔑 Session-based access control
- ⏰ 12-hour session timeout for security
- 🔄 Auto-save and version control
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- TypeScript
- Next.js 14
- Shadcn UI
- Tailwind CSS
- Web Crypto API

### Backend
- Python 3
- Flask
- PostgreSQL
- SQLAlchemy
- Flask-Migrate

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/secure-notes.git
cd secure-notes
```

2. Install frontend dependencies
```bash
npm install
```

3. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables
```bash
# In root directory
cp .env.example .env.local

# In backend directory
cp .env.example .env
```

5. Set up the database
```bash
createdb securenotes
flask db upgrade
```

### Running the Application

1. Start the backend server
```bash
cd backend
source venv/bin/activate
flask run
```

2. In a new terminal, start the frontend
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Security

- All notes are encrypted in the browser before being sent to the server
- The encryption key never leaves your browser
- Sessions automatically expire after 12 hours
- Uses industry-standard AES-GCM encryption

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Cuneyt Mertayak

This means you can:
- ✅ Use this code commercially
- ✅ Modify the code
- ✅ Distribute the code
- ✅ Use the code privately
- ✅ Sublicense the code

With the conditions that you:
- ℹ️ Include the original license
- ℹ️ Include the original copyright notice

And understand that:
- ❗ The software comes with no warranty
- ❗ The author has no liability for damages 