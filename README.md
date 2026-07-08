# 🚀 AI-Augmented Startup Pitch Analyzer

An intelligent full-stack web application that leverages AI to analyze startup pitches, providing actionable insights for both **Founders** and **Investors**. Founders can submit their pitch decks and receive in-depth AI-powered evaluations, while Investors can browse startups and explore detailed analysis reports.

🌐 **Live Demo**: [ai-pitch-analyzer-sooty.vercel.app](https://ai-pitch-analyzer-sooty.vercel.app/)

---

## ✨ Features

### 👤 For Founders
- 📄 Upload pitch decks (PDF)
- 🤖 Get AI-powered analysis including:
  - Executive Summary
  - Problem & Solution Evaluation
  - Target Market & Business Model Assessment
  - Funding Ask Analysis
- 📊 View detailed dashboard with scores and feedback
- 📈 Track analysis progress in real time

### 💼 For Investors
- 🔍 Browse submitted startups
- 📋 View full AI-generated analysis reports
- 📊 SWOT Analysis, TAM/SAM/SOM breakdown
- 🏆 Overall Score & Funding Readiness Score
- 💡 Strategic Recommendations & Due Diligence Questions
- 🆚 Competitor Analysis (Direct & Indirect)

### 🔐 Authentication
- Secure JWT-based authentication
- Role-based access control (Founder / Investor)
- Protected routes on both frontend and backend

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router v6 | Client-side Routing |
| Tailwind CSS | Styling |
| Chart.js + react-chartjs-2 | Data Visualization |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|---|---|
| Flask | Python Web Framework |
| Flask-SQLAlchemy | ORM / Database |
| Flask-JWT-Extended | Authentication |
| Flask-CORS | Cross-Origin Requests |
| OpenAI API | AI Analysis Engine |
| PyMuPDF | PDF Processing |
| Gunicorn | Production Server |
| PostgreSQL / SQLite | Database |

---

## 📁 Project Structure

```
internship/
├── backend/                  # Flask backend
│   ├── app.py                # Main Flask application
│   ├── extensions.py         # DB, JWT, CORS extensions
│   ├── requirements.txt      # Python dependencies
│   ├── routes/               # API route blueprints
│   │   ├── auth_routes.py
│   │   ├── startup_routes.py
│   │   ├── analysis_routes.py
│   │   └── health_routes.py
│   ├── models/               # Database models
│   ├── controllers/          # Business logic
│   ├── services/             # AI & external services
│   └── utils/                # Helper utilities
│
├── src/                      # React frontend
│   ├── App.jsx               # Root component & routing
│   ├── main.jsx              # Entry point
│   ├── pages/                # Application pages
│   │   ├── HomePage.jsx
│   │   ├── FounderPage.jsx
│   │   ├── FounderDashboardPage.jsx
│   │   ├── InvestorPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── auth/             # Login & Register
│   ├── components/           # Reusable UI components
│   ├── context/              # Auth context (global state)
│   ├── api/                  # API call helpers
│   └── utils/                # Utility functions
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- An OpenAI API key

---

### Backend Setup

```bash
# Navigate to backend
cd internship/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and fill in your values

# Run the Flask server
flask run
```

The backend will be running at `http://localhost:5000`

---

### Frontend Setup

```bash
# Navigate to project root
cd internship

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///app.db
OPENAI_API_KEY=your-openai-api-key
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/health` | Health check |
| GET | `/api/startups` | List all startups |
| POST | `/api/startups` | Submit a new startup pitch |
| GET | `/api/startups/:id` | Get startup details |
| POST | `/api/startups/:id/analyze` | Trigger AI analysis |
| GET | `/api/startups/:id/analysis` | Get analysis results |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Founder** | Submit pitch decks, view own analysis dashboard |
| **Investor** | Browse all startups, view full analysis reports |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for the AI analysis engine
- [Flask](https://flask.palletsprojects.com/) for the lightweight backend framework
- [React](https://react.dev/) for the modern UI framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tool
