import { Outlet } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import "../CSS/NavigationBar.css";
import AppFooter from "./AppFooter";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header>
        <NavigationBar />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
