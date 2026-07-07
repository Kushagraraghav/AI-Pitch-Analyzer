# AI-Augmented Startup Pitch Analyzer

## Overview
A production-ready starter project for an AI-augmented startup pitch analyzer with complete authentication, role-based access control, and protected frontend routes.

## Included Authentication Features
- Registration for Founder and Investor roles
- Login with JWT issuance
- Password hashing with bcrypt
- Protected API routes via middleware
- Profile page
- Role-based navigation and access

## Project Structure

### Frontend
- src/
  - App.jsx
  - main.jsx
  - components/
  - context/
  - pages/
  - api/
  - utils/

### Backend
- backend/
  - app.py
  - requirements.txt
  - .env.example
  - controllers/
  - middleware/
  - models/
  - routes/
  - services/
  - utils/

## Installation

### Frontend
```bash
cd "c:\Users\piyus\OneDrive\Desktop\internship"
npm install
```

### Backend
```bash
cd "c:\Users\piyus\OneDrive\Desktop\internship\backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Run

### Frontend
```bash
cd "c:\Users\piyus\OneDrive\Desktop\internship"
npm run dev
```

### Backend
```bash
cd "c:\Users\piyus\OneDrive\Desktop\internship\backend"
venv\Scripts\activate
set FLASK_APP=app.py
set FLASK_ENV=development
flask run
```
