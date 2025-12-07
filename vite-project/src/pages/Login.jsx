import "../CSS/Login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Connexion</h1>

        <input
          className="login-input"
          type="text"
          placeholder="Email"
        />

        <input
          className="login-input"
          type="password"
          placeholder="Mot de passe"
        />

        <p className="forgotpassword-button" onClick={() => alert("Tu as cliqué")} style={{cursor:"pointer"}}>
            Mot de passe oublié ?
        </p>

        <button className="login-button">Se connecter</button>
        <p className="forgotpassword-button" onClick={() => alert("Tu as cliqué")} style={{cursor:"pointer"}}>
            Pas encore de compte ? S'inscrire
        </p>
      </div>
    </div>
  );
}

export default Login;
