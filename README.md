# පරීක්ෂණ ඇගයීම් කිරීම් බ්‍යුරෝව | Examination Evaluation Bureau

🇱🇰 **Sri Lanka Scholarship Examination Platform for Grades 2-5**

A comprehensive trilingual (Sinhala, Tamil, English) examination management system for Sri Lankan scholarship exams, built with modern technologies and mobile-first design.

## ✨ Features

- **Paper 1 (MCQ)**: Auto-graded with 60-min timer & instant results
- **Paper 2 (Written)**: Photo upload with teacher marking (10-skill rubric)
- **Trilingual**: සිංහල, தமிழ், English with language toggle
- **Mobile-Optimized**: Works seamlessly on smartphones
- **Child-Friendly UI**: Colorful, engaging design with government aesthetics
- **Multi-Role**: Students, Parents, Teachers, Admins
- **Progress Tracking**: Detailed analytics with Recharts visualization

## 🛠 Tech Stack

**Backend**: FastAPI, MongoDB, Python 3.9+, JWT Auth
**Frontend**: React 18, i18next, Recharts, Framer Motion, Shadcn/UI

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python create_sample_data.py  # Seed database
python server.py  # Runs on :8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start  # Runs on :3000
```

## 👤 Test Credentials

- **Admin**: admin@exambureau.com / admin123
- **Teacher**: teacher@exambureau.com / teacher123
- **Student (Grade 4)**: student4@test.com / student423
- **Parent (Grade 4)**: parent4@test.com / parent423

## 📱 Mobile-First Design

Optimized for students using parents' smartphones with:
- Touch-friendly 48px minimum button height
- Responsive layouts for all screen sizes
- Proper viewport configuration
- Child-friendly UI with emojis and colors

## 🎨 Design (Sri Lankan Flag Colors)

- **Maroon** (#8D153A): Primary actions
- **Green** (#137B10): Success states
- **Saffron** (#E68100): Highlights
- **Gold** (#F4C430): Decorative

## 📞 Support

**GitHub**: [Issues](https://github.com/tecsrilankaworldwide/examination-bureau-app/issues)

---

**Built with ❤️ for Sri Lankan students**
