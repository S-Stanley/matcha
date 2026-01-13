import "../CSS/Home.css";

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">🏠 Home</h1>

      <p className="home-subtitle">
        Bienvenue ! Ton profil est bien créé 🎉
      </p>

      <div className="home-card">
        <p>🚧 Page Home en cours de construction</p>
        <p>Prochaines étapes :</p>
        <ul>
          <li>Swipe / Match</li>
          <li>Messages</li>
          <li>Profil</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
