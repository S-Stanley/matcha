import "../CSS/CompleteProfile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CompleteProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

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

  // --- SELECT SIMPLE ---
  const handleSelect = (value) => {
    setAnswers({ ...answers, [current.key]: value });
  };

  // --- SELECT MULTIPLE ---
  const handleMultiSelect = (value) => {
    const arr = answers[current.key];
    const updated = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setAnswers({ ...answers, [current.key]: updated });
  };

  // --- TEXTAREA ---
  const handleChange = (e) => {
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
  const confirmProfile = () => {
    console.log("Profil final :", answers);
    navigate("/match", { replace: true });
  };
  

  return (
    <div className="completeprofile-container">
      <div className="completeprofile-page">

        {/* TITLE */}
        <h1 className="completeprofile-title">{current.question}</h1>

        {/* --- RÉSUMÉ FINAL --- */}
        {current.type === "summary" && (
          <div className="summary-box">

            <div class="summary-info1">
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

            <button className="confirm-button" onClick={confirmProfile}>
              CONFIRMER
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
                  <img src={src} />
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
