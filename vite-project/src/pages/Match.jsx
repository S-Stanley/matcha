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
      <span className="top-item">Recherche</span>
      <span className="top-item">Messages</span>
      <span className="top-item">Profil</span>
    </div>
      <button className="logout-button">Se déconnecter</button> 
  </div>
    <div className="match-content">
      <div className="profil">
        <div className="photo-container">
          <div className="match-card-picture">
            <p>PHOTO</p>
          </div>

          <div className="match-actions">
            <button className="icon-btn pass">✖</button>
            <button className="icon-btn match">❤</button>
          </div>
        </div>

        <div className="match-card-description">
          <p>DESCRIPTION</p>
        </div>
      </div>
    </div>
  </div>
  );
}

export default Match;
