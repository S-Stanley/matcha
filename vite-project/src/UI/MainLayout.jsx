import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import "../CSS/NavigationBar.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <NavigationBar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
