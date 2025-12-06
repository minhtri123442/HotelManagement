import Dashboard from "./dashboard";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* Sidebar có width cố định */}
      <div className="h-full">
        <Dashboard />
      </div>

      {/* Nội dung chiếm toàn bộ phần còn lại */}
      <div className="flex-1 h-full bg-gray-100 overflow-y-auto p-8">
        <Outlet />
      </div>

    </div>
  );
}
