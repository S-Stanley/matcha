const API_URL = "http://127.0.0.1:5000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function postForm(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(payload).toString(),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(text || "Erreur serveur", response.status);
  }

  return data;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(text || "Erreur serveur", response.status);
  }

  return data;
}

export async function createUser(form) {
  const payload = {
    email: form.email?.trim() || "",
    password: form.password || "",
    username: form.username?.trim() || "",
    firstname: form.firstname?.trim() || "",
    lastname: form.lastname?.trim() || "",
  };

  return postForm("/users", payload);
}

export async function confirmSignup({ username, confirmCode }) {
  const payload = {
    username: username?.trim() || "",
    confirm_code: confirmCode?.trim() || "",
  };

  return postForm("/users/signup/confirm", payload);
}

export async function loginUser({ username, password }) {
  const payload = {
    username: username?.trim() || "",
    password: password || "",
  };

  return postForm("/users/login", payload);
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function patchCurrentUser(token, payload) {
  const response = await fetch(`${API_URL}/users`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token,
    },
    body: new URLSearchParams(payload).toString(),
  });
  return parseResponse(response);
}

export async function patchProfilePicture(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/users/picture`, {
    method: "PATCH",
    headers: {
      token,
    },
    body: formData,
  });
  return parseResponse(response);
}

export async function deleteProfilePicture(token, pictureId) {
  const response = await fetch(`${API_URL}/users/picture/${pictureId}`, {
    method: "DELETE",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function requestPasswordChange({ username, password }) {
  const payload = {
    username: username?.trim() || "",
    password: password || "",
  };

  return postForm("/users/password/change/request", payload);
}

export async function confirmPasswordChange({ username, confirmCode }) {
  const payload = {
    username: username?.trim() || "",
    confirm_code: confirmCode?.trim() || "",
  };

  return postForm("/users/password/change/confirm", payload);
}

export async function getMatches(token) {
  const response = await fetch(`${API_URL}/matches`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function getMatchMessages(token, matchId) {
  const response = await fetch(`${API_URL}/matches/${matchId}/message`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function sendMatchMessage(token, matchId, content) {
  const response = await fetch(`${API_URL}/matches/${matchId}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token,
    },
    body: new URLSearchParams({ content }).toString(),
  });
  return parseResponse(response);
}

export async function getUsers(token, filters = null) {
  const query = new URLSearchParams();
  if (filters && typeof filters === "object") {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_URL}/users${suffix}`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function getUsersNav(token, filters = null) {
  const query = new URLSearchParams();
  if (filters && typeof filters === "object") {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_URL}/users/nav${suffix}`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function createLike(token, likedUserId) {
  const response = await fetch(`${API_URL}/likes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token,
    },
    body: new URLSearchParams({ liked_user: likedUserId }).toString(),
  });
  return parseResponse(response);
}

export async function deleteLike(token, likedUserId) {
  const response = await fetch(`${API_URL}/likes/${likedUserId}`, {
    method: "DELETE",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function createView(token, profileUserId) {
  const response = await fetch(`${API_URL}/views/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token,
    },
    body: new URLSearchParams({ profileUserId }).toString(),
  });
  return parseResponse(response);
}

export async function getViewsMe(token) {
  const response = await fetch(`${API_URL}/views/me`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function getLikesMe(token) {
  const response = await fetch(`${API_URL}/likes`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function getUserById(token, userId) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function getUserNotifications(token) {
  const response = await fetch(`${API_URL}/users/me/notifications`, {
    method: "GET",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function markAllNotificationsAsRead(token) {
  const response = await fetch(`${API_URL}/users/me/notifications`, {
    method: "PATCH",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function toggleUserTag(token, tagName) {
  const response = await fetch(`${API_URL}/users/tag/${encodeURIComponent(tagName)}`, {
    method: "PATCH",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function blockUser(token, blockedUserId) {
  const response = await fetch(`${API_URL}/users/${blockedUserId}/block`, {
    method: "POST",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}

export async function reportUser(token, reportedUserId) {
  const response = await fetch(`${API_URL}/users/${reportedUserId}/report`, {
    method: "POST",
    headers: {
      token,
    },
  });
  return parseResponse(response);
}
