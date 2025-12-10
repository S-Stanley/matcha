import "../CSS/Register.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState(null);

    const images = [
        "/picture-register2.jpg",
        "/picture-register3.jpg",
        "/picture-register4.jpg",
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // -------------------------------
    // 🔥 Fonction pour envoyer le formulaire
    // -------------------------------
    const handleRegister = async () => {

        // --- VALIDATIONS FRONTEND ---
        if (Object.values(form).some(v => v.trim() === "")) {
            return setError("Tous les champs sont obligatoires.");
        }

        if (form.email.length > 50 || form.username.length > 50) {
            return setError("Email et pseudo doivent faire moins de 50 caractères.");
        }

        const weakPasswords = ["cat", "dog", "password", "123456"];
        if (weakPasswords.includes(form.password.toLowerCase())) {
            return setError("Mot de passe trop faible.");
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams(form).toString(),
            });

            const data = await response.json();

            if (!response.ok) {
                return setError(data.error || "Erreur serveur");
            }

            // 🎉 Succès : rediriger vers login
            navigate("/");

        } catch (err) {
            console.error(err);
            setError("Impossible de contacter le serveur");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

                <input className="login-input" name="lastname" type="text" placeholder="Nom" onChange={handleChange} />
                <input className="login-input" name="firstname" type="text" placeholder="Prénom" onChange={handleChange} />
                <input className="login-input" name="username" type="text" placeholder="Pseudo" onChange={handleChange} />
                <input className="login-input" name="email" type="text" placeholder="Email" onChange={handleChange} />
                <input className="login-input" name="password" type="password" placeholder="Mot de passe" onChange={handleChange} />

                <button className="login-button" onClick={handleRegister}>
                    Créer mon compte
                </button>
            </div>
        </div>
    );
}

export default Register;
