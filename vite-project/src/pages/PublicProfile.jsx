import "../CSS/PublicProfile.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createView, getUserById } from "../api";

function PublicProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const data = await getUserById(token, userId);
        setProfile(data);
        await createView(token, userId).catch(() => null);
      } catch (err) {
        setError(err?.message || "Impossible de charger ce profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, userId]);

  return (
    <div className="public-profile-container">
      <div className="public-profile-card">
        <button className="public-profile-back" onClick={() => navigate(-1)}>
          Retour
        </button>

        {loading && <p>Chargement...</p>}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && profile && (
          <>
            <div className="public-avatar">
              {(profile.firstname?.[0] || profile.username?.[0] || "?").toUpperCase()}
            </div>
            <h2>
              {profile.firstname || ""} {profile.lastname || ""}
            </h2>
            <p className="public-username">@{profile.username || "unknown"}</p>
            <p className="public-id">ID: {profile.id}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
