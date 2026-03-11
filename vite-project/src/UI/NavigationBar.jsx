import { NavLink, useNavigate } from "react-router-dom";
import "../CSS/NavigationBar.css";
import { useState } from "react";

export default function NavigationBar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId && token) {
        const body = new URLSearchParams();
        body.append("id", userId);

        await fetch("http://127.0.0.1:5000/users/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            token,
          },
          body: body.toString(),
        });
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/");
    } catch (e) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-side-spacer" aria-hidden="true" />
      <div className="top-center">
        <NavLink
          to="/match"
          className={({ isActive }) => (isActive ? "top-item active" : "top-item")}
        >
          Match
        </NavLink>

        <NavLink
          to="/recherche"
          className={({ isActive }) => (isActive ? "top-item active" : "top-item")}
        >
          Recherche
        </NavLink>

        <NavLink
          to="/message"
          className={({ isActive }) => (isActive ? "top-item active" : "top-item")}
        >
          Messages
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "top-item active" : "top-item")}
        >
          Profil
        </NavLink>
      </div>

      <button
        className="logout-button"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "…" : "🚪"}
      </button>
    </div>
  );
}
