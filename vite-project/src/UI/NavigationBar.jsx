import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../CSS/NavigationBar.css";
import { useEffect, useRef, useState } from "react";
import {
  getUserNotifications,
  getUserById,
  getUsers,
  markAllNotificationsAsRead,
} from "../api";

const NOTIFICATIONS_REFRESH_MS = 5000;
const NOTIFICATIONS_HISTORY_LIMIT = 50;

function normalizeNotification(raw) {
  if (Array.isArray(raw)) {
    return {
      id: raw[0],
      type: raw[1],
      from_user_id: raw[2],
      created_at: raw[3],
    };
  }
  return {
    id: raw?.id,
    type: raw?.type,
    from_user_id: raw?.from_user_id || raw?.fromUserId,
    created_at: raw?.created_at || raw?.createdAt,
  };
}

function toTimestamp(value) {
  const ts = Date.parse(value || "");
  return Number.isNaN(ts) ? 0 : ts;
}

function getNotificationKey(item) {
  if (item?.id) return `id:${item.id}`;
  return `fallback:${item?.type || "UNKNOWN"}:${item?.from_user_id || "unknown"}:${item?.created_at || "unknown"}`;
}

function getStorageKey(userId) {
  return `notifications_history_${userId || "unknown"}`;
}

function loadNotificationsHistory(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeNotification);
  } catch {
    return [];
  }
}

function saveNotificationsHistory(userId, list) {
  if (!userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
  } catch {
    // Ignore storage errors and keep UI functional.
  }
}

function mergeNotifications(existing, incoming) {
  const byKey = new Map();
  [...incoming, ...existing].forEach((item) => {
    const normalized = normalizeNotification(item);
    byKey.set(getNotificationKey(normalized), normalized);
  });
  return Array.from(byKey.values())
    .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
    .slice(0, NOTIFICATIONS_HISTORY_LIMIT);
}

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifUsersById, setNotifUsersById] = useState({});
  const notifRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const notificationsRef = useRef([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      historyLoadedRef.current = false;
      setNotifications([]);
      notificationsRef.current = [];
      return;
    }
    const history = loadNotificationsHistory(userId);
    setNotifications(history);
    notificationsRef.current = history;
    historyLoadedRef.current = true;
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token) {
        setNotifLoading(false);
        setNotifications([]);
        setNotifUsersById({});
        setUnreadCount(0);
        notificationsRef.current = [];
        historyLoadedRef.current = false;
        return;
      }
      if (userId && !historyLoadedRef.current) {
        const history = loadNotificationsHistory(userId);
        setNotifications(history);
        notificationsRef.current = history;
        historyLoadedRef.current = true;
      }
      setNotifLoading(true);
      try {
        const [data, userList] = await Promise.all([
          getUserNotifications(token),
          getUsers(token).catch(() => []),
        ]);
        const unreadList = (Array.isArray(data) ? data : []).map(normalizeNotification);
        setUnreadCount(unreadList.length);
        const mergedNotifications = mergeNotifications(notificationsRef.current, unreadList);
        setNotifications(mergedNotifications);
        notificationsRef.current = mergedNotifications;
        if (userId) {
          saveNotificationsHistory(userId, mergedNotifications);
        }
        const usersMap = {};
        (Array.isArray(userList) ? userList : []).forEach((u) => {
          usersMap[String(u.id)] = u;
        });

        const mergedForUserLookup = mergedNotifications;
        const uniqueFromIds = [...new Set(mergedForUserLookup.map((n) => n.from_user_id).filter(Boolean))];
        if (uniqueFromIds.length > 0) {
          const users = await Promise.all(
            uniqueFromIds.map((id) =>
              getUserById(token, id).catch(() => usersMap[String(id)] || {
                id,
                username: "unknown",
                firstname: "",
                lastname: "",
              })
            )
          );
          const map = {};
          users.forEach((u) => {
            map[String(u.id)] = u;
          });
          setNotifUsersById(map);
        } else {
          setNotifUsersById({});
        }
      } catch {
        // Keep locally cached notifications visible even if API fails.
      } finally {
        setNotifLoading(false);
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, NOTIFICATIONS_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpenNotifications = async () => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);
    if (!notifOpen && unreadCount > 0) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await markAllNotificationsAsRead(token);
          setUnreadCount(0);
        } catch {
          // Ignore backend errors, keep dropdown usable.
        }
      }
    }
  };

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
      <div className="top-left-controls" ref={notifRef}>
        <button
          className="notif-button"
          onClick={handleOpenNotifications}
          aria-label="Notifications"
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount}</span>
          )}
        </button>
        {notifOpen && (
          <div className="notif-dropdown">
            <h4>Notifications</h4>
            {notifLoading && <p>Chargement...</p>}
            {!notifLoading && notifications.length === 0 && <p>Aucune notification.</p>}
            {!notifLoading &&
              notifications.map((n) => {
                const fromUser = notifUsersById[String(n.from_user_id)];
                const fromLabel = fromUser
                  ? ((fromUser.firstname || fromUser.lastname)
                    ? `${fromUser.firstname} ${fromUser.lastname}`.trim()
                    : `@${fromUser.username}`)
                  : "Un utilisateur";
                return (
                  <div key={getNotificationKey(n)} className="notif-item">
                    <p className="notif-text">
                      {n.type || "Notification"} - {fromLabel}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <div className="top-center">
        <NavLink
          to="/match"
          className={({ isActive }) =>
            isActive ||
            (location.pathname.startsWith("/profile/") && location.state?.from === "match")
              ? "top-item active"
              : "top-item"
          }
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
          className={({ isActive }) =>
            isActive ||
            (location.pathname.startsWith("/profile/") && location.state?.from === "message")
              ? "top-item active"
              : "top-item"
          }
        >
          Messages
        </NavLink>

        <NavLink
          to="/profile"
          end
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
