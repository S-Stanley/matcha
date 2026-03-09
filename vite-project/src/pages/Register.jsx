import "../CSS/Register.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { createUser } from "../api";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function passwordIssues(pw) {
  const p = pw || "";
  const issues = [];
  if (p.length < 8) issues.push("8 caractères minimum");
  if (!/[a-z]/.test(p)) issues.push("au moins 1 minuscule");
  if (!/[A-Z]/.test(p)) issues.push("au moins 1 majuscule");
  if (!/[0-9]/.test(p)) issues.push("au moins 1 chiffre");
  if (!/[^A-Za-z0-9]/.test(p)) issues.push("au moins 1 caractère spécial");
  return issues;
}

function validate(form) {
  if (Object.values(form).some((v) => v.trim() === "")) {
    return "Tous les champs sont obligatoires.";
  }

  if (
    form.email.length > 50 ||
    form.username.length > 50 ||
    form.firstname.length > 50 ||
    form.lastname.length > 50 ||
    form.password.length > 50
  ) {
    return "Tous les champs doivent faire moins de 50 caractères.";
  }

  const weak = ["cat", "dog", "password", "123456"];
  if (weak.includes(form.password.toLowerCase())) {
    return "Mot de passe trop faible.";
  }

  if (!isValidEmail(form.email)) {
    return "Email invalide.";
  }

  const issues = passwordIssues(form.password);
  if (issues.length > 0) {
    return "Mot de passe pas assez sécurisé.";
  }

  return null;
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    username: false,
    email: false,
    password: false,
  });

  const images = ["/picture-register2.jpg", "/picture-register3.jpg", "/picture-register4.jpg"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => isValidEmail(form.email), [form.email]);
  const pwIssues = useMemo(() => passwordIssues(form.password), [form.password]);
  const pwOk = pwIssues.length === 0;

  const allFilled = useMemo(() => {
    return (
      form.firstname.trim() &&
      form.lastname.trim() &&
      form.username.trim() &&
      form.email.trim() &&
      form.password.trim()
    );
  }, [form]);

  const canSubmit = useMemo(() => {
    return !loading && allFilled && emailOk && pwOk && !validate(form);
  }, [loading, allFilled, emailOk, pwOk, form]);

  const handleRegister = async () => {
    if (loading) return;

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createUser(form);
      navigate("/CompleteProfile");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={images[index]} alt="register" className="register-image" />
        <p className="register-text">Rencontre maintenant</p>
        <div className="carousel-dots">
          {images.map((_, i) => (
            <div key={i} className={`dot ${index === i ? "active" : ""}`} />
          ))}
        </div>
      </div>

      <div className="register-right">
        <h1 className="login-title">Créer un compte</h1>

        <div className="div-button-connexion">
          <p className="button-connexion">Déjà un compte ?</p>
          <p
            className="button-connexion-color"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            Se connecter
          </p>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          className="login-input"
          name="lastname"
          type="text"
          placeholder="Nom"
          value={form.lastname}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <input
          className="login-input"
          name="firstname"
          type="text"
          placeholder="Prénom"
          value={form.firstname}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <input
          className="login-input"
          name="username"
          type="text"
          placeholder="Pseudo"
          value={form.username}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <input
          className="login-input"
          name="email"
          type="text"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && form.email.trim() !== "" && !emailOk && (
          <p style={{ color: "red", marginTop: 6 }}>Email invalide.</p>
        )}

        <input
          className="login-input"
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && form.password.trim() !== "" && !pwOk && (
          <p style={{ color: "red", marginTop: 6 }}>
            Mot de passe trop faible : {pwIssues.join(", ")}.
          </p>
        )}

        <button className="login-button" onClick={handleRegister} disabled={!canSubmit}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}

export default Register;