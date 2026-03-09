import "../CSS/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);

      const res = await fetch("http://127.0.0.1:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        throw new Error("Identifiants invalides.");
      }

      const data = await res.json();
      if (!data?.id || !data?.token) {
        throw new Error("Réponse login inattendue.");
      }

      localStorage.setItem("userId", data.id);
      localStorage.setItem("token", data.token);

      navigate("/match");
    } catch (e) {
      setError(e?.message || "Erreur lors de la connexion.");
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

        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}

        <p className="forgotpassword-button" style={{ cursor: "pointer" }}>
          Mot de passe oublié ?
        </p>

        <button
          className="login-button"
          onClick={handleLogin}
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}

export default Login;
