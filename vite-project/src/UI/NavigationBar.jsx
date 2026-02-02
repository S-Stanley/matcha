import { NavLink } from "react-router-dom";
import "../CSS/NavigationBar.css";

export default function NavigationBar() {
  return (
    <div className="top-bar">
      <div className="top-center">

        <NavLink
          to="/match"
          className={({ isActive }) => isActive ? "top-item active" : "top-item"}
        >
          Match
        </NavLink>

        <NavLink
          to="/recherche"
          className={({ isActive }) => isActive ? "top-item active" : "top-item"}
        >
          Recherche
        </NavLink>

        <NavLink
          to="/message"
          className={({ isActive }) => isActive ? "top-item active" : "top-item"}
        >
          Messages
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => isActive ? "top-item active" : "top-item"}
        >
          Profil
        </NavLink>

      </div>

      <button className="logout-button">
        Se déconnecter
      </button>
    </div>
  );
}
    