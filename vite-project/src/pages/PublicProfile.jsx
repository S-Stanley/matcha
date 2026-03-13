import "../CSS/PublicProfile.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createView, getUserById, getUsers } from "../api";

const API_URL = "http://127.0.0.1:5000";

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
        const [detailed, users] = await Promise.all([
          getUserById(token, userId).catch(() => null),
          getUsers(token).catch(() => []),
        ]);
        const basic = (Array.isArray(users) ? users : []).find((u) => String(u.id) === String(userId));
        setProfile(detailed || basic || null);
        await createView(token, userId).catch(() => null);
        if (!detailed && !basic) {
          setError("Profil introuvable.");
        }
      } catch (err) {
        setError(err?.message || "Impossible de charger ce profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, userId]);

  const pictureUrl = profile?.picture_url
    ? (profile.picture_url.startsWith("http://") || profile.picture_url.startsWith("https://")
      ? profile.picture_url
      : `${API_URL}${profile.picture_url.startsWith("/") ? "" : "/"}${profile.picture_url}`)
    : null;
  const profileTags = (() => {
    if (Array.isArray(profile?.tags)) {
      return profile.tags;
    }
    if (profile?.username) {
      try {
        const cached = localStorage.getItem(`profile_tags_${profile.username}`);
        const parsed = cached ? JSON.parse(cached) : [];
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {
        return [];
      }
    }
    return [];
  })();

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
            {pictureUrl ? (
              <img src={pictureUrl} alt="Photo de profil" className="public-photo" />
            ) : (
              <div className="public-avatar">
                {(profile.firstname?.[0] || profile.username?.[0] || "?").toUpperCase()}
              </div>
            )}
            <h2>
              {profile.firstname || ""} {profile.lastname || ""}
            </h2>
            <p className="public-username">@{profile.username || "unknown"}</p>
            <div className="public-info-grid">
              <p className="public-meta"><strong>Nom:</strong> {profile.lastname || "Non renseigné"}</p>
              <p className="public-meta"><strong>Prénom:</strong> {profile.firstname || "Non renseigné"}</p>
              <p className="public-meta"><strong>Pseudo:</strong> @{profile.username || "unknown"}</p>
              <p className="public-meta"><strong>Popularité:</strong> {profile.popularity ?? 0}</p>
            </div>
            <div className="public-tags">
              <strong>Tags:</strong>
              <div className="public-tags-row">
                {profileTags.length > 0
                  ? profileTags.map((tag) => (
                    <span key={tag} className="public-tag">#{tag}</span>
                  ))
                  : <span className="public-no-tags">Aucun tag</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
