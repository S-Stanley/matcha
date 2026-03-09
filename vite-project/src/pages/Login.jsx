import "../CSS/Login.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

      navigate("/match");
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
        <h1 className="login-title">Se connecter</h1>

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

          <p className="forgotpassword-button" style={{ cursor: "pointer" }}>
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
      </div>
    </div>
  );
}

export default Login;
