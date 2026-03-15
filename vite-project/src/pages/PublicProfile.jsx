import "../CSS/PublicProfile.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blockUser, createView, deleteLike, getLikesMe, getMatches, getUserById, getUsers, reportUser } from "../api";

const API_URL = "http://127.0.0.1:5000";

function PublicProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [relation, setRelation] = useState({
    likedByMe: false,
    likedYou: false,
    connected: false,
  });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const [detailed, users, likesMe, matches] = await Promise.all([
          getUserById(token, userId).catch(() => null),
          getUsers(token).catch(() => []),
          getLikesMe(token).catch(() => []),
          getMatches(token).catch(() => []),
        ]);
        const basic = (Array.isArray(users) ? users : []).find((u) => String(u.id) === String(userId));
        setProfile(detailed || basic || null);
        const likerIds = (Array.isArray(likesMe) ? likesMe : []).map((row) => {
          if (Array.isArray(row)) return String(row[1] || "");
          if (typeof row === "string") {
            const m = row.match(/\(([^,]+),([^)]+)\)/);
            return String(m?.[2] || "");
          }
          return String(row?.liked_by || row?.likedBy || "");
        });
        const connectedIds = (Array.isArray(matches) ? matches : [])
          .map((m) => String(m?.user_id || ""))
          .filter(Boolean);
        setRelation({
          likedByMe: Boolean(detailed?.isLiked),
          likedYou: likerIds.includes(String(userId)),
          connected: connectedIds.includes(String(userId)),
        });
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

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [userId]);

  const pictureUrl = profile?.picture_url
    ? (profile.picture_url.startsWith("http://") || profile.picture_url.startsWith("https://")
      ? profile.picture_url
      : `${API_URL}${profile.picture_url.startsWith("/") ? "" : "/"}${profile.picture_url}`)
    : null;
  const pictureUrls = (Array.isArray(profile?.pictures) ? profile.pictures : [])
    .map((p) => p?.url)
    .filter(Boolean)
    .map((url) =>
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`
    );
  const currentPictureUrl = pictureUrls[selectedPhotoIndex] || pictureUrl || "";
  const lastLoginLabel = (() => {
    if (!profile?.last_login) return "Inconnue";
    const date = new Date(profile.last_login);
    if (Number.isNaN(date.getTime())) return String(profile.last_login);
    const diffMs = Date.now() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return "Connecté";
    if (diffHours < 2) return "Il y a 1h";
    if (diffHours < 3) return "Il y a 2h";
    return "Il y a plus de 2h";
  })();

  const handleReport = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile?.id) return;
    setActionLoading("report");
    setActionMessage("");
    try {
      await reportUser(token, profile.id);
      setActionMessage("Profil signalé.");
    } catch (err) {
      setActionMessage(err?.message || "Signalement impossible.");
    } finally {
      setActionLoading("");
    }
  };

  const handleBlock = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile?.id) return;
    setActionLoading("block");
    setActionMessage("");
    try {
      await blockUser(token, profile.id);
      setActionMessage("Profil bloqué.");
      navigate("/message", { replace: true });
    } catch (err) {
      setActionMessage(err?.message || "Blocage impossible.");
    } finally {
      setActionLoading("");
    }
  };

  const handleUnlike = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile?.id) return;
    setActionLoading("unlike");
    setActionMessage("");
    try {
      await deleteLike(token, profile.id);
      setRelation((prev) => ({ ...prev, likedByMe: false, connected: false }));
      setActionMessage("Like retiré.");
    } catch (err) {
      setActionMessage(err?.message || "Unliker impossible.");
    } finally {
      setActionLoading("");
    }
  };

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
            {currentPictureUrl ? (
              <img src={currentPictureUrl} alt="Photo de profil" className="public-photo" />
            ) : (
              <div className="public-avatar">
                {(profile.firstname?.[0] || profile.username?.[0] || "?").toUpperCase()}
              </div>
            )}
            {pictureUrls.length > 1 && (
              <div className="public-photo-thumbs">
                {pictureUrls.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    className={`public-photo-thumb ${index === selectedPhotoIndex ? "active" : ""}`}
                    onClick={() => setSelectedPhotoIndex(index)}
                  >
                    <img src={url} alt={`Photo ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
            <h2>
              {profile.firstname || ""} {profile.lastname || ""}
            </h2>
            <p className="public-popularity-badge">
              Note de popularité: <strong>{profile.popularity ?? 0}</strong>
            </p>
            <div className="public-info-grid">
              <p className="public-meta"><strong>Nom:</strong> {profile.lastname || "Non renseigné"}</p>
              <p className="public-meta"><strong>Prénom:</strong> {profile.firstname || "Non renseigné"}</p>
              <p className="public-meta"><strong>Pseudo:</strong> @{profile.username || "unknown"}</p>
              <p className="public-meta"><strong>Âge:</strong> {profile.age ?? "Non renseigné"}</p>
              <p className="public-meta"><strong>Popularité:</strong> {profile.popularity ?? 0}</p>
              <p className="public-meta public-meta-full"><strong>Dernière connexion:</strong> {lastLoginLabel}</p>
            </div>
            <div className="public-status-row">
              {relation.likedYou && <span className="public-status-pill liked-you">Vous a liké</span>}
              {relation.connected && <span className="public-status-pill connected">Connectés</span>}
            </div>
            <div className="public-actions">
              {relation.likedByMe && (
                <button
                  type="button"
                  className="public-action-btn unlike"
                  onClick={handleUnlike}
                  disabled={actionLoading === "unlike"}
                >
                  {actionLoading === "unlike" ? "..." : "Unliker"}
                </button>
              )}
              <button
                type="button"
                className="public-action-btn report"
                onClick={handleReport}
                disabled={actionLoading === "report"}
              >
                {actionLoading === "report" ? "..." : "Signaler"}
              </button>
              <button
                type="button"
                className="public-action-btn block"
                onClick={handleBlock}
                disabled={actionLoading === "block"}
              >
                {actionLoading === "block" ? "..." : "Bloquer"}
              </button>
            </div>
            {actionMessage && <p className="public-action-message">{actionMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
