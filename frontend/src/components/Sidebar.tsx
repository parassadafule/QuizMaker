import React from "react";
import { Link } from "react-router-dom";
import { FaBook, FaChartBar, FaList, FaPlus, FaCog, FaPlay, FaUser, FaBookOpen, FaCheckCircle } from "react-icons/fa";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function SidebarItem({ active, label, icon, to, themeColor, onClick, } : { active?: boolean; label: string; icon: React.ReactNode; to: string; themeColor: string; onClick?: () => void;}) 
{
  return (
    <Link to={to} onClick={onClick}
      className={classNames(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium",
        active
          ? `bg-${themeColor}-50 text-${themeColor}-700`
          : "text-slate-700 hover:bg-slate-100",
      )}>
      <span
        className={classNames(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          active ? "bg-white" : "bg-slate-50 group-hover:bg-white",
        )}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

interface SidebarProps {
  userRole?: "admin" | "student";
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export default function Sidebar({ userRole = "admin", isMobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const isAdmin = userRole === "admin";
  const themeColor = isAdmin ? "emerald" : "blue";
  const portalName = isAdmin ? "QuizMaster" : "Student Portal";

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={onMobileMenuClose}/>
      )}

      <aside className={classNames(
        "min-h-screen w-72 border-r border-slate-200 bg-white p-5 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full",
        "md:fixed md:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-${themeColor}-50 text-${themeColor}-700`}>
              {isAdmin ? <FaBook className="h-5 w-5" /> : <FaBookOpen className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">{portalName}</p>
            </div>
          </div>
          <button onClick={onMobileMenuClose} aria-label="Close menu"
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            ✕
          </button>
        </div>

        <nav className="mt-6 space-y-1">
          {isAdmin ? (
            <>
              <SidebarItem themeColor={themeColor} label="Dashboard" icon={<FaChartBar className="h-5 w-5" />} to="/admin/dashboard" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="My Quizzes" icon={<FaList className="h-5 w-5" />} to="/admin/my-quizzes" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="Create New" icon={<FaPlus className="h-5 w-5" />} to="/admin/create-quiz" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="Evaluate Answers" icon={<FaCheckCircle className="h-5 w-5" />} to="/admin/evaluate-answers" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="Teacher Profile" icon={<FaCog className="h-5 w-5" />} to="/admin/profile" onClick={onMobileMenuClose} />
            </>
          ) : (
            <>
              <SidebarItem themeColor={themeColor} label="Join Quiz" icon={<FaPlay className="h-5 w-5" />} to="/student/join-quiz" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="My Results" icon={<FaChartBar className="h-5 w-5" />} to="/student/my-results" onClick={onMobileMenuClose} />
              <SidebarItem themeColor={themeColor} label="Student Profile" icon={<FaUser className="h-5 w-5" />} to="/student/profile" onClick={onMobileMenuClose} />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}