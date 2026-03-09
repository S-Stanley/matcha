import "../CSS/Login.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  confirmPasswordChange,
  getCurrentUser,
  loginUser,
  requestPasswordChange,
} from "../api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState("login");
  const [resetUsername, setResetUsername] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetCode, setResetCode] = useState("");

  const isProfileComplete = (user) => {
    return Boolean(user?.bio && user.bio.trim()) && Boolean(user?.gender) && Boolean(user?.preference);
  };

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser({ username, password });
      if (!data?.id || !data?.token) {
        throw new Error("Réponse login inattendue.");
      }

      localStorage.setItem("userId", data.id);
      localStorage.setItem("token", data.token);

      try {
        const me = await getCurrentUser(data.token);
        navigate(isProfileComplete(me) ? "/match" : "/completeprofile");
      } catch (_) {
        navigate("/match");
      }
    } catch (err) {
      if (err?.status === 401) {
        setError("Identifiants invalides ou compte non confirmé.");
      } else if (err?.message === "Error") {
        setError("Erreur serveur pendant la connexion.");
      } else {
        setError(err?.message || "Erreur lors de la connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRequest = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!resetUsername.trim() || !resetPassword.trim()) {
      setError("Username et nouveau mot de passe sont obligatoires.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await requestPasswordChange({
        username: resetUsername,
        password: resetPassword,
      });
      if (!data?.requested) {
        throw new Error("Impossible d'envoyer la demande.");
      }
      setMessage("Code envoyé. Saisis le code reçu pour confirmer.");
      setAuthStep("confirm-reset");
    } catch (err) {
      setError(err?.message || "Erreur pendant la demande.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordConfirm = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!resetCode.trim()) {
      setError("Le code de confirmation est obligatoire.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await confirmPasswordChange({
        username: resetUsername,
        confirmCode: resetCode,
      });
      if (!data?.Updated) {
        throw new Error("Code invalide.");
      }
      setMessage("Mot de passe mis à jour. Tu peux te connecter.");
      setAuthStep("login");
      setPassword("");
      setResetPassword("");
      setResetCode("");
    } catch (err) {
      setError(err?.message || "Erreur pendant la confirmation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/picture-register2.jpg"
          alt="register"
          className="register-image"
        />
        <p className="register-text">Rencontre maintenant</p>
      </div>

      <div className="login-right">
        <h1 className="login-title">
          {authStep === "login" ? "Se connecter" : "Mot de passe oublié"}
        </h1>

        <div className="div-button-register">
          <p className="button-register">Pas encore de compte ?</p>
          <p
            className="button-register-color"
            onClick={() => navigate("/register")}
            style={{ cursor: "pointer" }}
          >
            S'inscrire
          </p>
        </div>

        {authStep === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <input
              className="login-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="login-input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {message && <p style={{ color: "green", marginTop: 8 }}>{message}</p>}
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}

            <p
              className="forgotpassword-button"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setError("");
                setMessage("");
                setAuthStep("request-reset");
                setResetUsername(username);
              }}
            >
              Mot de passe oublié ?
            </p>

            <button
              type="submit"
              className="login-button"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}

        {authStep === "request-reset" && (
          <form className="login-form" onSubmit={handlePasswordRequest}>
            <input
              className="login-input"
              type="text"
              placeholder="Username"
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Nouveau mot de passe"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />

            {message && <p style={{ color: "green", marginTop: 8 }}>{message}</p>}
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}

            <button
              type="submit"
              className="login-button"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer le code"}
            </button>

            <button
              type="button"
              className="login-button"
              onClick={() => {
                setError("");
                setMessage("");
                setAuthStep("login");
              }}
            >
              Retour connexion
            </button>
          </form>
        )}

        {authStep === "confirm-reset" && (
          <form className="login-form" onSubmit={handlePasswordConfirm}>
            <input
              className="login-input"
              type="text"
              placeholder="Username"
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
            />
            <input
              className="login-input"
              type="text"
              placeholder="Code de confirmation"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />

            {message && <p style={{ color: "green", marginTop: 8 }}>{message}</p>}
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}

            <button
              type="submit"
              className="login-button"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
              disabled={loading}
            >
              {loading ? "Confirmation..." : "Confirmer"}
            </button>

            <button
              type="button"
              className="login-button"
              onClick={() => {
                setError("");
                setMessage("");
                setAuthStep("request-reset");
              }}
            >
              Revenir à la demande
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
