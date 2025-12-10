import "../CSS/Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
        <div className="login-left">
            <img src="/picture-register2.jpg" alt="register" className="register-image" />
            <p className="register-text">Rencontre maintenant</p>
        </div>

        <div className="login-right">
            <h1 className="login-title">Se connecter</h1>
            <div className="div-button-register">
                <p className="button-register">Pas encore de compte ?</p>
                <p className="button-register-color" onClick={() => navigate("/register")} style={{ cursor: "pointer" }}>
                    S'inscrire
                </p>
            </div>
            

            <input className="login-input" type="text" placeholder="Email" />
            <input className="login-input" type="password" placeholder="Mot de passe" />

            <p className="forgotpassword-button" style={{cursor:"pointer"}}>
                Mot de passe oublié ?
            </p>

            <button className="login-button" onClick={() => navigate("/CompleteProfile")} style={{ cursor: "pointer" }}>
                    Se connecter
            </button>
        </div>
    </div>
  );
}

export default Login;
