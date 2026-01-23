# QuizMaker

A comprehensive web application for creating, managing, and taking quizzes. Built with Django REST Framework for the backend and React with TypeScript for the frontend.

## Description

QuizMaker is a full-stack web application that allows users to create, edit, and share quizzes. It supports multiple question types including multiple-choice, true/false, and short answer questions. The application features user authentication, role-based access (admin and student), quiz attempts tracking, and result evaluation.

This project was developed as part of a sponsored initiative, inspired by popular quiz tools like Google Forms, Typeform, and Quizizz.

## Features

### Core Functionality
- **User Authentication**: JWT-based authentication for secure access
- **Role-Based Access**: Separate interfaces for quiz creators (admins) and quiz takers (students)
- **Quiz Creation**: Create quizzes with multiple question types
- **Question Types**: Multiple-choice, true/false, and short answer questions
- **Quiz Management**: Edit, delete, and share quizzes
- **Quiz Taking**: Interactive quiz interface with real-time scoring
- **Results Tracking**: Store and display quiz results and scores
- **Admin Dashboard**: View quiz takers, scores, and manage quizzes

### Technical Features
- Responsive design using Tailwind CSS
- RESTful API with Django REST Framework
- PostgreSQL database for data persistence
- CORS enabled for frontend-backend communication
- TypeScript for type-safe frontend development

## Tech Stack

### Backend
- **Python 3.x**
- **Django 5.2.9**
- **Django REST Framework 3.16.1**
- **PostgreSQL 18**
- **JWT Authentication** (djangorestframework-simplejwt 5.5.1)
- **CORS Headers** (django-cors-headers 4.9.0)
- **Pillow** for image handling

### Frontend
- **React 19.2.0** with TypeScript 5.9.3
- **Vite** for build tooling
- **Tailwind CSS 4.1.18** for styling
- **React Router 7.11.0** for navigation
- **React Icons** for UI icons

## Prerequisites

Before running this application, make sure you have the following installed:

- **Python 3.8+**
- **Node.js 16+** and npm
- **PostgreSQL 18**
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/quizmaker.git
cd quizmaker
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Database Setup
1. Create a PostgreSQL database named `quizmaker`
2. Create a `.env` file in the `backend` directory with the following variables:
```
DJANGO_SECRET_KEY=your-secret-key-here
DATABASE_NAME=quizmaker
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

#### Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Backend
```bash
cd backend
# Activate virtual environment if not already
venv\Scripts\activate 

python manage.py runserver
```
The backend will run on `http://localhost:8000`

### Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (default Vite port)

## API Documentation

The API provides endpoints for:
- User authentication (login/register)
- Quiz CRUD operations
- Question management
- Quiz attempts and scoring
- User profiles

### Base URL
`http://localhost:8000/api/`

### Authentication
Uses JWT tokens. Include `Authorization: Bearer <token>` in headers for protected endpoints.

## Project Structure

```
quizmaker/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── quizmaker/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   └── server/
│       ├── settings.py
│       ├── urls.py
│       └── wsgi.py
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── Routes/
│   │   │   ├── Admin/
│   │   │   └── Student/
│   │   └── utils/
│   └── public/
└── README.md
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend linting
cd frontend
npm run lint
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend (collect static files)
cd backend
python manage.py collectstatic
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Google Forms, Typeform, and Quizizz
- Built as part of a sponsored development project
- Thanks to the Django and React communities for excellent documentation and tools