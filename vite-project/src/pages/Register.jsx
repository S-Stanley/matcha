import "../CSS/Register.css";

function Register() {
    return (
        <div className="login-container">
          <div className="login-box">
            <h1 className="login-title">Inscription</h1>
    
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
    
            <button className="login-button">Confirmez</button>
          </div>
        </div>
      );
  }
  
  export default Register;
  