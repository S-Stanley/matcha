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
