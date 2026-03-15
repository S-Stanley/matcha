import "../CSS/CompleteProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, patchCurrentUser, patchProfilePicture, toggleUserTag } from "../api";

const GENDER_TO_API = {
  Homme: "MALE",
  Femme: "FEMALE",
  Autre: "OTHERS",
  "Ne se prononce pas": "DO NOT PRONONCE",
};

const API_TO_GENDER = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHERS: "Autre",
  "DO NOT PRONONCE": "Ne se prononce pas",
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
    age: "",
    bio: "",
    tags: [],
    photos: [],
  });
  const [photoFiles, setPhotoFiles] = useState([]);

  const steps = [
    { question: "Quel est votre genre ?", key: "gender", type: "choices", options: ["Homme", "Femme", "Autre", "Ne se prononce pas"] },
    { question: "Quel genre recherchez-vous ?", key: "preference", type: "choices", options: ["Homme", "Femme", "Les deux"] },
    { question: "Quel est votre âge ?", key: "age", type: "number" },
    { question: "Dites-en plus sur vous", key: "bio", type: "textarea" },
    { question: "Choisissez vos tags", key: "tags", type: "multi", options: ["sport", "cinema", "musique", "voyage", "cuisine", "jeux", "lecture", "tech"] },
    { question: "Ajoutez vos photos", key: "photos", type: "photos" },
    { question: "Résumé de votre profil", key: "summary", type: "summary" },
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
          age: me.age ? String(me.age) : "",
          bio: me.bio || "",
          gender: API_TO_GENDER[me.gender] || "",
          preference: API_TO_PREFERENCE[me.preference] || "",
        }));
      } catch (_) {
        setError("Impossible de charger ton profil. Reconnecte-toi.");
      } finally {
        setLoadingUser(false);
      }
    };

    bootstrap();
  }, [navigate]);

  const handleSelect = (value) => {
    if (error) setError("");
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  };

  const handleMultiSelect = (value) => {
    if (error) setError("");
    setAnswers((prev) => {
      const arr = prev[current.key];
      const updated = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [current.key]: updated };
    });
  };

  const handleChange = (e) => {
    if (error) setError("");
    setAnswers((prev) => ({ ...prev, [current.key]: e.target.value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (answers.photos.length + files.length > 5) {
      alert("Maximum 5 photos.");
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setAnswers((prev) => ({ ...prev, photos: [...prev.photos, ...previews] }));
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removePhoto = (indexToRemove) => {
    setAnswers((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove),
    }));
    setPhotoFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

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
        age: String(answers.age).trim(),
        bio: answers.bio,
        gender: GENDER_TO_API[answers.gender],
        preference: PREFERENCE_TO_API[answers.preference],
      });

      if (answers.tags.length > 0) {
        await Promise.all(answers.tags.map((tag) => toggleUserTag(token, tag)));
      }

      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          // Backend accepts one file per request and handles max 5 server-side.
          await patchProfilePicture(token, file);
        }
      }

      const tagsKey = `profile_tags_${userBase.username || "me"}`;
      localStorage.setItem(tagsKey, JSON.stringify(answers.tags));
      localStorage.removeItem("profile_tags_me");
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
        <h1 className="completeprofile-title">{current.question}</h1>
        {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

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
              <div className="summary-item">
                <h3>Âge</h3>
                <p>{answers.age}</p>
              </div>
            </div>

            <div className="summary-item">
              <h3>Bio</h3>
              <p>{answers.bio}</p>
            </div>

            <div className="summary-item">
              <h3>Tags</h3>
              <div className="hobby-badges">
                {answers.tags.map((h) => (
                  <span key={h} className="hobby-badge">{h}</span>
                ))}
              </div>
            </div>

            <div className="summary-item">
              <h3>Photos</h3>
              <div className="summary-photo-grid">
                {answers.photos.map((src, i) => (
                  <img key={`${src}-${i}`} src={src} alt="" className="summary-photo" />
                ))}
              </div>
            </div>

            <button className="confirm-button" onClick={confirmProfile} disabled={saving}>
              {saving ? "Envoi..." : "CONFIRMER"}
            </button>
          </div>
        )}

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

        {current.type === "textarea" && (
          <textarea
            value={answers[current.key]}
            onChange={handleChange}
            className="step-input"
          />
        )}

        {current.type === "number" && (
          <input
            type="number"
            min={18}
            max={120}
            value={answers[current.key]}
            onChange={handleChange}
            className="step-input"
          />
        )}

        {current.type === "photos" && (
          <>
            <label className="upload-box">
              + Ajouter une photo
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} />
            </label>

            <div className="photo-preview-grid">
              {answers.photos.map((src, i) => (
                <div key={`${src}-${i}`} className="photo-preview">
                  <img src={src} alt="" />
                  <button
                    type="button"
                    className="remove-photo"
                    aria-label="Supprimer la photo"
                    title="Supprimer la photo"
                    onClick={() => removePhoto(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

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
                    : current.type === "number"
                      ? !answers[current.key] || Number(answers[current.key]) < 18
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
