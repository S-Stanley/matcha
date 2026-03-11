import "../CSS/Match.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLike, createView, getUsers } from "../api";

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
        const data = await getUsers(token);
        const list = (Array.isArray(data) ? data : [])
          .filter((user) => String(user.id) !== String(currentUserId))
          .map((user) => ({
            ...user,
            liked: isAlreadyLiked(user),
            likedMe: hasLikedMe(user),
          }));
        setProfiles(list);
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

  const goNext = () => {
    setFeedback("");
    if (index + 1 >= profiles.length) return;
    setIndex((prev) => prev + 1);
  };

  const handlePass = () => {
    if (actionLoading) return;
    goNext();
  };

  const handleLike = async () => {
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
      const res = await createLike(token, current.id);
      if (res?.is_new_match && res?.match?.id) {
        setFeedback("Nouveau match. Va dans Messages pour discuter.");
      } else {
        setFeedback("Like envoyé.");
      }
      goNext();
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le like.");
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

        {!loading && current && (
          <div className="profile">
            <div className="photo-container">
              <div className="match-card-picture">
                <p>
                  {current.firstname || ""} {current.lastname || ""}
                </p>
                <small>@{current.username}</small>
                {current.likedMe && <span className="liked-me-pill">T'a liké</span>}
              </div>

              <div className="match-actions">
                <button className="icon-btn pass" onClick={handlePass} disabled={actionLoading}>
                  ✖
                </button>
                <button className="icon-btn match" onClick={handleLike} disabled={actionLoading}>
                  ❤
                </button>
              </div>
            </div>

            <div className="match-card-description">
              <div>
                <p className="desc-title">Pseudo</p>
                <p>@{current.username}</p>
              </div>
              <div>
                <p className="desc-title">Prénom</p>
                <p>{current.firstname || "N/A"}</p>
              </div>
              <div>
                <p className="desc-title">Nom</p>
                <p>{current.lastname || "N/A"}</p>
              </div>
              <button className="to-messages-btn" onClick={() => navigate("/message")}>
                Voir mes matchs/messages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Match;
