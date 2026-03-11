import "../CSS/Message.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteLike, getLikesMe, getMatchMessages, getMatches, getUserById, sendMatchMessage } from "../api";

function normalizeMessage(item) {
  if (Array.isArray(item)) {
    return {
      id: item[0],
      user_id: item[1],
      match_id: item[2],
      content: item[3],
      created_at: item[4],
    };
  }
  return {
    id: item?.id,
    user_id: item?.user_id,
    match_id: item?.match_id,
    content: item?.content,
    created_at: item?.created_at,
  };
}

function extractLikedById(entry) {
  if (!entry) return null;
  if (Array.isArray(entry)) {
    if (entry.length >= 2) return entry[1];
    if (entry.length === 1) {
      const raw = String(entry[0]);
      const match = raw.match(/\(([^,]+),([^)]+)\)/);
      return match?.[2] || null;
    }
  }
  if (typeof entry === "string") {
    const match = entry.match(/\(([^,]+),([^)]+)\)/);
    return match?.[2] || null;
  }
  return entry?.liked_by || entry?.likedBy || null;
}

function Message() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [deletingLikeId, setDeletingLikeId] = useState("");
  const [likes, setLikes] = useState([]);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(true);
  const messagesContainerRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const loadMatches = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const data = await getMatches(token);
        const list = Array.isArray(data) ? data : [];
        setMatches(list);
        const queryMatchId = searchParams.get("matchId");
        if (queryMatchId) {
          setSelectedMatchId(queryMatchId);
        } else if (list.length > 0) {
          const firstMatchId = String(list[0].match_id || list[0].id);
          setSelectedMatchId(firstMatchId);
          setSearchParams({ matchId: firstMatchId });
        }
      } catch (err) {
        setError(err?.message || "Impossible de charger les matchs.");
      } finally {
        setLoadingMatches(false);
      }
    };

    loadMatches();
  }, [navigate, searchParams, setSearchParams]);

  useEffect(() => {
    const loadLikes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoadingLikes(true);
      try {
        const raw = await getLikesMe(token);
        const likerIds = (Array.isArray(raw) ? raw : [])
          .map(extractLikedById)
          .filter(Boolean);
        if (likerIds.length === 0) {
          setLikes([]);
          return;
        }
        const users = await Promise.all(
          likerIds.map((id) =>
            getUserById(token, id).catch(() => ({ id, username: "unknown", firstname: "", lastname: "" }))
          )
        );
        setLikes(users);
      } catch (_) {
        setLikes([]);
      } finally {
        setLoadingLikes(false);
      }
    };
    loadLikes();
  }, []);

  useEffect(() => {
    const loadMessages = async (silent = false) => {
      if (!selectedMatchId) {
        setMessages([]);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!silent) {
        setLoadingMessages(true);
      }
      setError("");
      try {
        const data = await getMatchMessages(token, selectedMatchId);
        const list = Array.isArray(data) ? data.map(normalizeMessage) : [];
        setMessages((prev) => {
          if (prev.length === list.length) {
            const same = prev.every((p, i) => p.id === list[i]?.id && p.content === list[i]?.content);
            if (same) return prev;
          }
          return list;
        });
      } catch (err) {
        setError(err?.message || "Impossible de charger les messages.");
        if (!silent) {
          setMessages([]);
        }
      } finally {
        if (!silent) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadMessages(true);
      }
    }, 2000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsLive(true);
        loadMessages(true);
      } else {
        setIsLive(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [selectedMatchId]);

  const selectedMatch = useMemo(
    () => matches.find((item) => String(item.match_id || item.id) === String(selectedMatchId)),
    [matches, selectedMatchId]
  );

  const openConversation = (matchId) => {
    const next = String(matchId);
    setSelectedMatchId(next);
    setSearchParams({ matchId: next });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (sending || !selectedMatchId) return;
    const content = newMessage.trim();
    if (!content) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setSending(true);
    setError("");
    try {
      const created = await sendMatchMessage(token, selectedMatchId, content);
      setMessages((prev) => [...prev, normalizeMessage(created)]);
      setNewMessage("");
    } catch (err) {
      setError(err?.message || "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteLike = async (likedUserId) => {
    const token = localStorage.getItem("token");
    if (!token || !likedUserId) return;
    setDeletingLikeId(String(likedUserId));
    setError("");
    try {
      await deleteLike(token, likedUserId);
      setLikes((prev) => prev.filter((u) => String(u.id) !== String(likedUserId)));
    } catch (err) {
      setError(err?.message || "Impossible de supprimer ce like.");
    } finally {
      setDeletingLikeId("");
    }
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, selectedMatchId]);

  return (
    <div className="message-container">
      <div className="message-content">
        <div className="chat-layout">
          <div className="conversation-panel">
            <h3>Conversations</h3>
            {loadingMatches && <p>Chargement...</p>}
            {!loadingMatches && matches.length === 0 && <p>Aucun match.</p>}
            {!loadingMatches &&
              matches.map((conv) => (
                <div
                  key={conv.match_id || conv.id}
                  className={`conversation-item ${String(conv.match_id || conv.id) === String(selectedMatchId) ? "active" : ""}`}
                  onClick={() => openConversation(conv.match_id || conv.id)}
                >
                  <div className="conversation-avatar">
                    {(conv.firstname?.[0] || conv.username?.[0] || "?").toUpperCase()}
                  </div>

                  <div className="conversation-info">
                    <p className="conversation-name">
                      {conv.firstname || ""} {conv.lastname || ""}
                    </p>
                    <p className="conversation-last">@{conv.username || "unknown"}</p>
                  </div>
                </div>
              ))}

            <div className="likes-section">
              <h4>Mes likes</h4>
              {loadingLikes && <p>Chargement...</p>}
              {!loadingLikes && likes.length === 0 && <p>Aucun like.</p>}
              {!loadingLikes &&
                likes.map((u) => (
                  <div key={u.id} className="like-row">
                    <span>
                      {(u.firstname || u.lastname)
                        ? `${u.firstname} ${u.lastname}`.trim()
                        : `@${u.username || "unknown"}`}
                    </span>
                    <button
                      type="button"
                      className="like-delete-btn"
                      onClick={() => handleDeleteLike(u.id)}
                      disabled={deletingLikeId === String(u.id)}
                    >
                      {deletingLikeId === String(u.id) ? "..." : "Supprimer"}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              {selectedMatch ? (
                <div className="chat-header-row">
                  <p>
                    Conversation avec {selectedMatch.firstname || ""} {selectedMatch.lastname || ""} (@{selectedMatch.username})
                  </p>
                  <div className="chat-header-actions">
                    <span className={`live-dot ${isLive ? "on" : "off"}`} />
                    <button
                      type="button"
                      className="chat-profile-btn"
                      onClick={() => navigate(`/profile/${selectedMatch.user_id || selectedMatch.id}`)}
                    >
                      Voir profil
                    </button>
                  </div>
                </div>
              ) : (
                <p>Sélectionne un match</p>
              )}
            </div>

            {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}

            <div ref={messagesContainerRef} className="chat-messages">
              {loadingMessages && <p>Chargement des messages...</p>}
              {!loadingMessages && messages.length === 0 && selectedMatchId && (
                <p>Aucun message pour le moment.</p>
              )}
              {!loadingMessages &&
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${String(msg.user_id) === String(currentUserId) ? "mine" : "theirs"}`}
                  >
                    <p>{msg.content}</p>
                  </div>
                ))}
            </div>

            <form className="chat-input-row" onSubmit={handleSend}>
              <input
                className="chat-input"
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedMatchId || sending}
              />
              <button className="chat-send" type="submit" disabled={!selectedMatchId || sending}>
                {sending ? "..." : "Envoyer"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
