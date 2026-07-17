import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Sidebar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: "👥",
    },
    {
      name: "Departments",
      path: "/departments",
      icon: "🏢",
    },
    {
      name: "Payroll & Salary",
      path: "/payroll",
      icon: "💰",
    },
  ];

  // Dark Mode Apply
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">

      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-blue-600">
          EMS
        </h1>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Employee Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >

            <span className="text-lg">
              {item.icon}
            </span>

            <span className="font-medium">
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>

      {/* Bottom Options */}
      <div className="mt-auto space-y-2 pt-6">

        {/* Dark / Light Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <span className="text-lg">
            {darkMode ? "☀️" : "🌙"}
          </span>

          <span className="font-medium">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <span className="text-lg">
            🚪
          </span>

          <span className="font-medium">
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;