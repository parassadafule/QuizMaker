import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import PrivateRouter from "./components/PrivateRouter";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./Routes/Admin/Dashboard";
import CreateQuiz from "./Routes/Admin/CreateQuiz";
import QuizEdit from "./Routes/Admin/QuizEdit";
import QuizList from "./Routes/Admin/QuizList";
import EvaluateShortAnswers from "./Routes/Admin/EvaluateShortAnswers";
import QuizShare from "./Routes/Admin/QuizShare";
import QuizResults from "./Routes/Admin/QuizResults";
import AdminProfile from "./Routes/Admin/Profile";

import JoinQuiz from "./Routes/Student/JoinQuiz";
import QuizAttempt from "./Routes/Student/QuizAttempt";
import Result from "./Routes/Student/Result";
import MyResults from "./Routes/Student/MyResults";
import StudentProfile from "./Routes/Student/Profile";

import Login from "./Routes/Auth/Login";
import Register from "./Routes/Auth/Register";
import RoleSelection from "./Routes/Auth/RoleSelection";


function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar userRole="admin" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuClose={closeMobileMenu}/>
        <main className="flex-1 md:ml-72 pt-20">
          <Header userRole="admin" onMobileMenuToggle={toggleMobileMenu}/>
          <Routes>
            <Route element={<PrivateRouter />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-quizzes" element={<QuizList />} />
              <Route path="quiz-edit/:id/update" element={<QuizEdit />} />
              <Route path="create-quiz" element={<CreateQuiz />} />
              <Route path="evaluate-answers" element={<EvaluateShortAnswers />} />
              <Route path="quiz-share" element={<QuizShare />} />
              <Route path="quiz-results" element={<QuizResults />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );    
}

function StudentLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar userRole="student" isMobileMenuOpen={isMobileMenuOpen} onMobileMenuClose={closeMobileMenu}/>
        <main className="flex-1 md:ml-72 pt-20">
          <Header userRole="student" onMobileMenuToggle={toggleMobileMenu} />
          <Routes>
            <Route element={<PrivateRouter />}>
              <Route path="join-quiz" element={<JoinQuiz />} />
              <Route path="result/:quizId" element={<Result />} />
              <Route path="my-results" element={<MyResults />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/student/*" element={<StudentLayout />} />

        <Route path="/student/quiz-attempt/:quizId" element={<QuizAttempt />} />

        <Route path="/" element={
          <div className="min-h-screen bg-slate-50">
            <RoleSelection />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
