import "../CSS/Match.css";
import { useNavigate } from "react-router-dom";

function Match() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // plus tard : appel API logout + clear token
    navigate("/");
  };

  return (
    <div className="match-container">

  <div className="top-bar">
    <div className="top-center">
      <span className="top-item active">Match</span>
      <span className="top-item">Messages</span>
      <span className="top-item">Profil</span>
    </div>
      <button className="logout-button">Se déconnecter</button> 
  </div>

    {/* 🎯 Contenu centré */}
    <div className="match-content">
      <h1 className="match-title">💘 Match</h1>

      <p className="match-subtitle">
        Bienvenue ! Ton profil est bien créé 🎉
      </p>

      <div className="match-card">
        <p>🚧 Page Match en cours de construction</p>
        <p>Prochaines étapes :</p>
        <ul>
          <li>Swipe / Match</li>
          <li>Messages</li>
          <li>Profil</li>
        </ul>
      </div>
    </div>
  </div>
  );
}

export default Match;
