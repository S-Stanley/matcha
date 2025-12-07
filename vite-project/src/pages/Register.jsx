import "../CSS/Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    return (
        <div className="register-container">

            <div className="register-left">
                <img src="/picture-register2.jpg" alt="register" className="register-image" />
                <p className="register-text">Rencontre maintenant</p>
            </div>


            <div className="register-right">
                <h1 className="login-title">Créer un compte</h1>

                <div className="div-button-connexion">
                    <p className="button-connexion">Déjà un compte ?</p>
                    <p className="button-connexion-color" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                        Se connecter
                    </p>
                </div>

                <input className="login-input" type="text" placeholder="Email" />
                <input className="login-input" type="password" placeholder="Mot de passe" />

                <button className="login-button">Créer mon compte</button>
            </div>
        </div>
    );
}

export default Register;
