import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-x-hidden bg-gray-100 dark:bg-gray-900">
      
      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10">
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;