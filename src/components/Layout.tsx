import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Syringe,
  BugOff,
  Users,
  Truck,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Seeds Inventory", path: "/seeds", icon: Sprout },
  { name: "Fertilizers Inventory", path: "/fertilizers", icon: FlaskConical },
  { name: "Vet & Chemicals", path: "/vet-chemicals", icon: Syringe },
  { name: "Pesticides", path: "/pesticides", icon: BugOff },
  { name: "Recipients", path: "/recipients", icon: Users },
  { name: "Distribution", path: "/distribution", icon: Truck },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "User Management", path: "/users", icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const userStr = localStorage.getItem("agri_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.username);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("agri_user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Sprout className="h-6 w-6 text-emerald-600 mr-2" />
          <span className="text-lg font-bold text-gray-900">AgriManage</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 mr-3",
                        isActive ? "text-emerald-600" : "text-gray-400",
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between print:hidden">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              "AgriManage"}
          </h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
