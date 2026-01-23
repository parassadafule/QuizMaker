import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { clearToken } from "../utils/auth.ts";

interface HeaderProps {
  userRole?: "admin" | "student";
  onMobileMenuToggle?: () => void;
}

const handleLogOut = () => {
  clearToken();
  window.location.href = '/';
};

export default function Header({ userRole = "admin", onMobileMenuToggle }: HeaderProps) {
  const isAdmin = userRole === "admin";
  const dashboardTitle = isAdmin ? "Dashboard Overview" : "Student Dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200 bg-white md:left-72">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onMobileMenuToggle} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100">
            <FaBars className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-slate-900 md:text-base">
            {dashboardTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleLogOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <FaSignOutAlt className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}