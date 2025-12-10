import "../CSS/CompleteProfile.css";
import { useState } from "react";

function CompleteProfile() {

  // ÉTAPE COURANTE
  const [step, setStep] = useState(0);

  // RÉPONSES UTILISATEUR
  const [answers, setAnswers] = useState({
    gender: "",
    preference: "",
    bio: "",
    hobby: "",
  });

  // TABLEAU DES QUESTIONS
  const steps = [
    { 
      question: "Quel est votre genre ?", 
      key: "gender", 
      type: "choices",
      options: ["Homme", "Femme", "Autre"]
    },
    { 
      question: "Quel genre recherchez-vous ?", 
      key: "preference", 
      type: "choices",
      options: ["Homme", "Femme", "Les deux"]
    },
    { 
      question: "Écrivez une courte bio :", 
      key: "bio", 
      type: "textarea" 
    },
    { 
      question: "Choisissez vos loisirs :", 
      key: "hobby", 
      type: "choices",
      options: ["Sport", "Jeux vidéo", "Voyages", "Cinéma", "Cuisine"]
    },
  ];

  const current = steps[step];

  const handleSelect = (value) => {
    setAnswers({ 
      ...answers, 
      [current.key]: value 
    });
  };

  const handleChange = (e) => {
    setAnswers({
      ...answers,
      [current.key]: e.target.value
    });
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="completeprofile-container">
      <div className="completeprofile-page">

        <h1 className="completeprofile-title">Compléter votre profil</h1>

        <p className="completeprofile-text">{current.question}</p>

        {/* SI CHOIX → cercles cliquables */}
        {current.type === "choices" && (
          <div className="choices-container">
            {current.options.map((option) => (
              <div 
                key={option}
                className={`choice-circle ${
                  answers[current.key] === option ? "selected" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}

        {/* SI TEXTAREA */}
        {current.type === "textarea" && (
          <textarea
            value={answers[current.key]}
            onChange={handleChange}
            className="step-input"
          ></textarea>
        )}

        {/* BOUTONS DE NAVIGATION */}
        <div className="step-buttons">
          {step > 0 && (
            <button className="prev-button" onClick={prevStep}>
              Retour
            </button>
          )}

          {step < steps.length - 1 ? (
            <button 
              className="next-button" 
              onClick={nextStep}
              disabled={!answers[current.key]} /* Désactive si pas de réponse */
            >
              Suivant
            </button>
          ) : (
            <button
              className="complete-button"
              onClick={() => console.log("Réponses finales :", answers)}
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
