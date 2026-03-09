import "../CSS/CompleteProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, patchCurrentUser } from "../api";

const GENDER_TO_API = {
  Homme: "MALE",
  Femme: "FEMALE",
  Autre: "OTHERS",
};

const API_TO_GENDER = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHERS: "Autre",
  "DO NOT PRONONCE": "Autre",
};

const PREFERENCE_TO_API = {
  Homme: "MALE",
  Femme: "FEMALE",
  "Les deux": "BOTH",
};

const API_TO_PREFERENCE = {
  MALE: "Homme",
  FEMALE: "Femme",
  BOTH: "Les deux",
};

function CompleteProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userBase, setUserBase] = useState(null);

  const [answers, setAnswers] = useState({
    gender: "",
    preference: "",
    bio: "",
    hobby: [],
    photos: [],
  });

  // --- LISTE DES ÉTAPES ---
  const steps = [
    { question: "Quel est votre genre ?", key: "gender", type: "choices", options: ["Homme", "Femme", "Autre"] },
    { question: "Quel genre recherchez-vous ?", key: "preference", type: "choices", options: ["Homme", "Femme", "Les deux"] },
    { question: "Dites-en plus sur vous", key: "bio", type: "textarea" },
    { question: "Choisissez vos loisirs", key: "hobby", type: "multi", options: ["Sport", "Jeux vidéo", "Voyages", "Cinéma", "Cuisine"] },
    { question: "Ajoutez vos photos", key: "photos", type: "photos" },
    { question: "Résumé de votre profil", key: "summary", type: "summary" } // <-- NOUVELLE ÉTAPE
  ];

  const current = steps[step];

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const me = await getCurrentUser(token);
        setUserBase({
          email: me.email || "",
          firstname: me.firstname || "",
          lastname: me.lastname || "",
          username: me.username || "",
        });
        setAnswers((prev) => ({
          ...prev,
          bio: me.bio || "",
          gender: API_TO_GENDER[me.gender] || "",
          preference: API_TO_PREFERENCE[me.preference] || "",
        }));
      } catch (err) {
        setError("Impossible de charger ton profil. Reconnecte-toi.");
      } finally {
        setLoadingUser(false);
      }
    };

    bootstrap();
  }, [navigate]);

  // --- SELECT SIMPLE ---
  const handleSelect = (value) => {
    if (error) setError("");
    setAnswers({ ...answers, [current.key]: value });
  };

  // --- SELECT MULTIPLE ---
  const handleMultiSelect = (value) => {
    if (error) setError("");
    const arr = answers[current.key];
    const updated = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setAnswers({ ...answers, [current.key]: updated });
  };

  // --- TEXTAREA ---
  const handleChange = (e) => {
    if (error) setError("");
    setAnswers({ ...answers, [current.key]: e.target.value });
  };

  // --- UPLOAD PHOTOS (max 5) ---
  const handlePhotoUpload = (e) => {
    const files = [...e.target.files];
    if (answers.photos.length + files.length > 5) {
      alert("Maximum 5 photos.");
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setAnswers({ ...answers, photos: [...answers.photos, ...previews] });
  };

  const removePhoto = (i) => {
    setAnswers({
      ...answers,
      photos: answers.photos.filter((_, index) => index !== i)
    });
  };

  // --- NAVIGATION ---
  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // --- CONFIRMATION FINALE ---
  const confirmProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userBase) {
      setError("Session invalide. Reconnecte-toi.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await patchCurrentUser(token, {
        email: userBase.email,
        firstname: userBase.firstname,
        lastname: userBase.lastname,
        username: userBase.username,
        bio: answers.bio,
        gender: GENDER_TO_API[answers.gender],
        preference: PREFERENCE_TO_API[answers.preference],
      });
      navigate("/match", { replace: true });
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="completeprofile-container">
        <div className="completeprofile-page">
          <h1 className="completeprofile-title">Chargement du profil...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="completeprofile-container">
      <div className="completeprofile-page">

        {/* TITLE */}
        <h1 className="completeprofile-title">{current.question}</h1>
        {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

        {/* --- RÉSUMÉ FINAL --- */}
        {current.type === "summary" && (
          <div className="summary-box">

            <div className="summary-info1">
              <div className="summary-item">
                <h3>Genre</h3>
                <p>{answers.gender}</p>
              </div>

              <div className="summary-item">
                <h3>Préférence</h3>
                <p>{answers.preference}</p>
              </div>
            </div>

            <div className="summary-item">
              <h3>Bio</h3>
              <p>{answers.bio}</p>
            </div>

            <div className="summary-item">
              <h3>Loisirs</h3>
              <div className="hobby-badges">
                {answers.hobby.map((h) => (
                  <span key={h} className="hobby-badge">{h}</span>
                ))}
              </div>
            </div>


            <div className="summary-item">
              <h3>Photos</h3>
              <div className="summary-photo-grid">
                {answers.photos.map((src, i) => (
                  <img key={i} src={src} alt="" className="summary-photo" />
                ))}
              </div>
            </div>

            <button className="confirm-button" onClick={confirmProfile} disabled={saving}>
              {saving ? "Envoi..." : "CONFIRMER"}
            </button>
          </div>
        )}

        {/* --- CHOICES --- */}
        {current.type === "choices" && (
          <div className="choices-container">
            {current.options.map((op) => (
              <div
                key={op}
                className={`choice-circle ${answers[current.key] === op ? "selected" : ""}`}
                onClick={() => handleSelect(op)}
              >
                {op}
              </div>
            ))}
          </div>
        )}

        {/* --- MULTI --- */}
        {current.type === "multi" && (
          <div className="choices-container">
            {current.options.map((op) => (
              <div
                key={op}
                className={`choice-circle ${answers[current.key].includes(op) ? "selected" : ""}`}
                onClick={() => handleMultiSelect(op)}
              >
                {op}
              </div>
            ))}
          </div>
        )}

        {/* --- TEXTAREA --- */}
        {current.type === "textarea" && (
          <textarea
            value={answers[current.key]}
            onChange={handleChange}
            className="step-input"
          />
        )}

        {/* --- PHOTOS --- */}
        {current.type === "photos" && (
          <>
            <label className="upload-box">
              + Ajouter une photo
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />
            </label>

            <div className="photo-preview-grid">
              {answers.photos.map((src, i) => (
                <div key={i} className="photo-preview">
                  <img src={src} alt="" />
                  <button className="remove-photo" onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- BUTTONS --- */}
        {current.type !== "summary" && (
          <div className="step-buttons">
            {step > 0 && <button className="prev-button" onClick={prevStep}>Retour</button>}
            <button
              className="next-button"
              onClick={nextStep}
              disabled={
                current.type === "multi"
                  ? answers[current.key].length === 0
                  : current.type === "photos"
                    ? answers.photos.length === 0
                    : !answers[current.key]
              }
            >
              {step === steps.length - 2 ? "Terminer" : "Suivant"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default CompleteProfile;
