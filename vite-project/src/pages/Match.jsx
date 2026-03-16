import "../CSS/Match.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLike, createView, deleteLike, getCurrentUser, getMatches, getUserById, getUsersNav } from "../api";

function isAlreadyLiked(user) {
  return Boolean(
    user?.liked ||
    user?.is_liked ||
    user?.isLiked ||
    user?.already_liked ||
    user?.alreadyLiked ||
    user?.has_liked ||
    user?.hasLiked
  );
}

function hasLikedMe(user) {
  return Boolean(
    user?.liked_me ||
    user?.likedMe ||
    user?.has_liked_me ||
    user?.hasLikedMe ||
    user?.liked_you ||
    user?.likedYou
  );
}

function Match() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [currentPictureUrl, setCurrentPictureUrl] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const current = profiles[index];

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const me = await getCurrentUser(token);
        const hasLocation = Boolean(me?.city && String(me.city).trim());
        if (!hasLocation) {
          setLocationBlocked(true);
          return;
        }

        const [data, matches] = await Promise.all([
          getUsersNav(token),
          getMatches(token).catch(() => []),
        ]);
        const connectedIds = (Array.isArray(matches) ? matches : [])
          .map((m) => String(m?.user_id || ""))
          .filter(Boolean);
        const list = (Array.isArray(data) ? data : [])
          .filter((user) => String(user.id) !== String(currentUserId))
          .map((user) => ({
            ...user,
            liked: isAlreadyLiked(user),
            likedMe: hasLikedMe(user),
            connected: connectedIds.includes(String(user.id)),
          }));
        setProfiles(list);
        setIndex(0);
        if (list.length > 0) {
          await createView(token, list[0].id).catch(() => null);
        }
      } catch (err) {
        setError(err?.message || "Impossible de charger les profils.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUserId, navigate]);

  useEffect(() => {
    const sendView = async () => {
      const token = localStorage.getItem("token");
      if (!token || !current) return;
      await createView(token, current.id).catch(() => null);
    };
    sendView();
  }, [current]);

  useEffect(() => {
    const loadCurrentPicture = async () => {
      const token = localStorage.getItem("token");
      if (!token || !current?.id) {
        setCurrentPictureUrl("");
        return;
      }
      try {
        const data = await getUserById(token, current.id);
        const firstPictureUrl = Array.isArray(data?.pictures) ? data.pictures?.[0]?.url : "";
        const raw = firstPictureUrl || data?.picture_url || data?.pictureUrl || "";
        if (!raw) {
          setCurrentPictureUrl("");
          return;
        }
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
          setCurrentPictureUrl(raw);
        } else {
          setCurrentPictureUrl(`http://127.0.0.1:5000${raw.startsWith("/") ? "" : "/"}${raw}`);
        }
      } catch (_) {
        setCurrentPictureUrl("");
      }
    };

    loadCurrentPicture();
  }, [current?.id]);

  const goNext = () => {
    setFeedback("");
    setProfiles((prev) => {
      if (prev.length === 0) return prev;
      const currentIdx = Math.min(index, prev.length - 1);
      const nextProfiles = [
        ...prev.slice(0, currentIdx),
        ...prev.slice(currentIdx + 1),
      ];
      const nextIndex = nextProfiles.length === 0
        ? 0
        : Math.min(currentIdx, nextProfiles.length - 1);
      setIndex(nextIndex);
      return nextProfiles;
    });
  };

  const handlePass = () => {
    if (actionLoading) return;
    goNext();
  };

  const handlePrimaryAction = async () => {
    if (actionLoading || !current) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    setActionLoading(true);
    setError("");
    setFeedback("");
    try {
      if (current.connected || current.liked) {
        await deleteLike(token, current.id);
        setFeedback(current.connected ? "Déconnecté." : "Like retiré.");
      } else {
        const res = await createLike(token, current.id);
        if (res?.is_new_match && res?.match?.id) {
          setFeedback("Connectés.");
        } else {
          setFeedback("Like envoyé.");
        }
      }
      goNext();
    } catch (err) {
      setError(err?.message || "Action impossible.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="match-container">
      <div className="match-content">
        <h2>Découvrir des profils</h2>
        {loading && <p>Chargement des profils...</p>}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}
        {feedback && <p style={{ color: "green" }}>{feedback}</p>}
        {!loading && !current && !error && <p>Plus de profils pour le moment.</p>}
        {!loading && locationBlocked && (
          <div className="location-required-box">
            <h3>Localisation requise</h3>
            <p>
              Ajoute une adresse ou active le GPS dans ton profil pour accéder à Match.
            </p>
            <button className="to-messages-btn" onClick={() => navigate("/profile")}>
              Aller au profil
            </button>
          </div>
        )}

        {!loading && !locationBlocked && current && (
          <div className="profile">
            <div className="photo-container">
              <div className="match-card-picture">
                {currentPictureUrl && (
                  <img
                    src={currentPictureUrl}
                    alt="Photo de profil"
                    className="match-card-image"
                  />
                )}
                <button
                  type="button"
                  className="match-view-profile-btn"
                  onClick={() =>
                    navigate(`/profile/${current.id}`, {
                      state: { from: "match" },
                    })
                  }
                >
                  Voir profil
                </button>
                <p className="match-name">
                  {current.firstname || ""} {current.lastname || ""}
                </p>
                <small>@{current.username}</small>
                <small>Âge: {current.age ?? "N/A"}</small>
                <small>Popularité: {current.popularity ?? 0}</small>
                <div className="match-status-row">
                  {current.likedMe && <span className="liked-me-pill">Vous a liké</span>}
                  {current.connected && <span className="connected-pill">Connectés</span>}
                  {!current.connected && current.liked && (
                    <span className="already-liked-pill">Déjà liké</span>
                  )}
                </div>
              </div>

              <div className="match-actions">
                <button className="icon-btn pass" onClick={handlePass} disabled={actionLoading}>
                  <span className="icon-symbol">✖</span>
                  <span className="icon-label">Passer</span>
                </button>
                <button className="icon-btn match" onClick={handlePrimaryAction} disabled={actionLoading}>
                  <span className="icon-symbol">{current.connected || current.liked ? "↺" : "❤"}</span>
                  <span className="icon-label">
                    {current.connected ? "Déconnecter" : current.liked ? "Unliker" : "Liker"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Match;
