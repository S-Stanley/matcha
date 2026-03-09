import "../CSS/Profile.css";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api";

const API_TO_GENDER = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHERS: "Autre",
  "DO NOT PRONONCE": "Ne se prononce pas",
};

const API_TO_PREFERENCE = {
  MALE: "Hommes",
  FEMALE: "Femmes",
  BOTH: "Les deux",
};

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    sexualPreference: "",
    bio: "",
    tags: ["sport", "cinema"],
    popularity: 42,
    location: {
      city: "Paris",
      gpsEnabled: false,
    },
    photos: [
      { id: 1, url: null, isProfile: true },
      { id: 2, url: null, isProfile: false },
      { id: 3, url: null, isProfile: false },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const views = [
    { username: "User42", date: "2026-01-20" },
    { username: "Emma", date: "2026-01-22" },
  ];

  const likes = [
    { username: "Lucas", date: "2026-01-21" },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Non connecté.");
        setLoading(false);
        return;
      }

      try {
        const me = await getCurrentUser(token);
        setProfile((prev) => ({
          ...prev,
          firstName: me.firstname || "",
          lastName: me.lastname || "",
          email: me.email || "",
          gender: API_TO_GENDER[me.gender] || "Non renseigné",
          sexualPreference: API_TO_PREFERENCE[me.preference] || "Non renseigné",
          bio: me.bio || "",
        }));
      } catch (err) {
        setError(err?.message || "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n’est pas supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((prev) => ({
          ...prev,
          location: {
            gpsEnabled: true,
            city: "Quartier détecté (GPS)",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
      },
      () => {
        alert("Autorisation GPS refusée");
      }
    );
  };

  return (
    <div className="myprofile-container">
      <div className="myprofile-content">
        {loading && <p>Chargement du profil...</p>}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
        <div className="myprofile">

          <div className="photo-container">
            <div className="myprofile-card-picture">
              {profile.photos.find(p => p.isProfile && p.url) ? (
                <img
                  src={profile.photos.find(p => p.isProfile).url}
                  alt="Photo de profil"
                />
              ) : (
                <p>PHOTO DE PROFIL</p>
              )}
            </div>
          </div>

          <div className="myprofile-card-description">
            <h2>
              {profile.firstName} {profile.lastName}
            </h2>

            <p className="popularity">
              ⭐ Popularité : {profile.popularity}
            </p>

            <p><strong>Genre :</strong> {profile.gender}</p>
            <p><strong>Préférences :</strong> {profile.sexualPreference}</p>
            <p><strong>Email :</strong> {profile.email}</p>

            <p className="bio">{profile.bio}</p>

            <div className="tags">
              {profile.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>

            <div className="location">
              <p>
                <strong>Localisation :</strong>{" "}
                {profile.location.city}
              </p>

              {!profile.location.gpsEnabled && (
                <button onClick={requestGPSLocation}>
                  Activer GPS
                </button>
              )}
            </div>

            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Fermer" : "Modifier le profil"}
            </button>
          </div>

          <div className="myprofile-stats">
            <h3>Activité</h3>

            <div>
              <strong>Consultations :</strong>
              <ul>
                {views.map((view, i) => (
                  <li key={i}>
                    {view.username} – {view.date}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Likes reçus :</strong>
              <ul>
                {likes.map((like, i) => (
                  <li key={i}>
                    {like.username} – {like.date}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
