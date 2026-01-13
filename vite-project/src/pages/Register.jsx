import "../CSS/Register.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createUser } from "../api";

function validate(form) {
    if (Object.values(form).some(v => v.trim() === "")) {
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

    return null;
}

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
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (loading) return;
    
        // 🔒 Validation FRONT stricte (indispensable ici)
        if (
            !form.email ||
            !form.password ||
            !form.username ||
            !form.firstname ||
            !form.lastname
        ) {
            setError("Tous les champs sont obligatoires.");
            return;
        }
    
        const validationError = validate(form);
        if (validationError) {
            setError(validationError);
            return;
        }
    
        setError(null);
        setLoading(true);
    
        try {
            await createUser(form);
            navigate("/");
        } catch (err) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
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

                <button className="login-button" onClick={handleRegister} disabled={loading}>
                    {loading ? "Création..." : "Créer mon compte"}
                </button>
            </div>
        </div>
    );
}

export default Register;
